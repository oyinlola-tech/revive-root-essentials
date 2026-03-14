const { Order, OrderItem, Product, User, RefundRequest, AuditLog } = require('../models');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const orderService = require('../services/orderService');
const paymentService = require('../services/paymentService');
const notificationService = require('../services/notificationService');
const currencyService = require('../services/currencyService');
const refundService = require('../services/refundService');
const { Op } = require('sequelize');

const allowedPaymentMethods = new Set(['card', 'ussd', 'transfer']);

const mapOrderItems = (orderItems = []) => orderItems.map((item) => ({
  name: item.Product?.name || 'Product',
  quantity: item.quantity,
  price: item.price,
}));

const mapTransactionStatus = (txn = {}) => String(
  txn.transaction_status
  || txn.status
  || txn.processor_response
  || txn.charge_response_message
  || '',
).toLowerCase();

const isSuccessfulTransaction = (txn = {}) => {
  const status = mapTransactionStatus(txn);
  const chargeCode = String(txn.charge_response_code || txn.chargeResponseCode || '').trim();
  const isChargeApproved = !chargeCode || chargeCode === '00';
  return ['success', 'successful', 'paid', 'completed'].includes(status) && isChargeApproved;
};

const isFailedTransaction = (txn = {}) => {
  const status = mapTransactionStatus(txn);
  return ['failed', 'failure', 'cancelled', 'canceled', 'declined', 'error'].includes(status);
};

const markOrderFailedFromTransaction = async (order) => {
  if (!order || order.paymentStatus === 'paid' || order.paymentStatus === 'refunded') {
    return;
  }
  if (order.paymentStatus !== 'failed') {
    order.paymentStatus = 'failed';
    await order.save();
  }
};

const markOrderPaidFromTransaction = async (order, txn) => {
  if (txn?.tx_ref && String(txn.tx_ref) !== String(order.orderNumber)) {
    throw new AppError('Transaction reference does not match this order', 400);
  }

  if (txn?.currency && String(txn.currency).toUpperCase() !== String(order.currency).toUpperCase()) {
    throw new AppError('Payment currency does not match this order', 400);
  }

  const paidAmount = Number(txn?.amount || txn?.transaction_amount || 0);
  if (paidAmount && paidAmount < Number(order.totalAmount)) {
    throw new AppError('Paid amount is lower than order total. Verification rejected.', 400);
  }

  const wasAlreadyPaid = order.paymentStatus === 'paid';
  order.paymentStatus = 'paid';
  order.status = order.status === 'pending' ? 'processing' : order.status;
  order.paymentTransactionRef = txn?.flw_ref || txn?.tx_ref || txn?.id || order.paymentTransactionRef;
  await order.save();
  return { wasAlreadyPaid };
};

const logFlutterwaveAudit = async ({
  req,
  order,
  action,
  status,
  errorMessage,
  response,
}) => {
  if (!AuditLog) return;
  try {
    await AuditLog.create({
      userId: req?.user?.id || order?.userId || null,
      action,
      resourceType: 'order',
      resourceId: order?.id || order?.orderNumber || null,
      ipAddress: req?.ip || null,
      userAgent: req?.get?.('user-agent') || null,
      status,
      errorMessage: errorMessage || null,
      metadata: {
        orderNumber: order?.orderNumber,
        response,
      },
    });
  } catch {
    // Never block payment flows on audit logging failures.
  }
};

exports.getUserOrders = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const orders = await Order.findAll({
    where: { userId },
    order: [['createdAt', 'DESC']],
    include: [{ model: OrderItem, include: [Product] }],
  });
  res.json(orders);
});

exports.getAllOrders = catchAsync(async (req, res, next) => {
  const orders = await Order.findAll({
    include: [{ model: OrderItem }],
    order: [['createdAt', 'DESC']],
  });
  res.json(orders);
});

exports.getOrderById = catchAsync(async (req, res, next) => {
  const order = await Order.findByPk(req.params.id, {
    include: [{ model: OrderItem, include: [Product] }],
  });
  if (!order) {
    return next(new AppError('Order not found', 404));
  }
  // Check if user is admin or the owner
  if (req.user.role === 'user' && order.userId !== req.user.id) {
    return next(new AppError('You do not have permission to view this order', 403));
  }
  res.json(order);
});

exports.createOrder = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const { items, shippingAddress, paymentMethod, currency, note } = req.body;
  const normalizedPaymentMethod = String(paymentMethod || '').trim().toLowerCase();

  if (!allowedPaymentMethods.has(normalizedPaymentMethod)) {
    return next(new AppError('Unsupported payment method. Use card, ussd, or transfer.', 400));
  }

  const pricingContext = await currencyService.getPricingContext(req, currency);
  if (pricingContext.invalidCurrency) {
    return next(new AppError(`Unsupported currency: ${pricingContext.invalidCurrency}`, 400));
  }
  if (pricingContext.currency !== 'NGN' && !pricingContext.rate) {
    return next(new AppError(`Conversion rate unavailable for ${pricingContext.currency}`, 502));
  }

  // Charge in the selected/display currency so the user pays the exact shown amount.
  const order = await orderService.createOrder(
    userId,
    { paymentMethod: normalizedPaymentMethod, shippingAddress, note },
    items,
    pricingContext,
  );
  const fullOrder = await Order.findByPk(order.id, {
    include: [{ model: OrderItem, include: [Product] }],
  });

  let paymentResponse = null;
  try {
    const callbackBase = process.env.FRONTEND_URL;
    const callbackUrl = callbackBase ? `${callbackBase.replace(/\/$/, '')}/orders/${order.id}` : undefined;
    paymentResponse = await paymentService.initiateTransaction({
      amount: order.totalAmount,
      email: req.user.email,
      currency: order.currency,
      reference: order.orderNumber,
      callbackUrl,
      paymentMethod: normalizedPaymentMethod,
    });
  } catch (error) {
    await markOrderFailedFromTransaction(order);
    notificationService.sendPaymentFailedEmail(
      req.user,
      fullOrder,
      mapOrderItems(fullOrder.OrderItems),
      'We could not initialize payment with the processor. Please retry shortly.',
    ).catch(() => {});
    return next(new AppError('Unable to initialize payment. Please try again.', 502));
  }

  res.status(201).json({
    orderId: order.id,
    orderNumber: order.orderNumber,
    total: order.totalAmount,
    status: order.status,
    paymentUrl: paymentResponse?.data?.link || null,
  });
});

exports.updateOrderStatus = catchAsync(async (req, res, next) => {
  const { status } = req.body;
  if (!['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
    return next(new AppError('Invalid order status', 400));
  }

  const order = await Order.findByPk(req.params.id);
  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  const user = await User.findByPk(order.userId);
  if (['shipped', 'delivered'].includes(status) && order.paymentStatus !== 'paid') {
    return next(new AppError('Cannot set shipped/delivered status before payment confirmation', 400));
  }
  const allowedTransitions = {
    pending: ['processing', 'cancelled'],
    processing: ['shipped'],
    shipped: ['delivered'],
    delivered: [],
    cancelled: [],
  };
  if (status !== order.status && !allowedTransitions[order.status]?.includes(status)) {
    return next(new AppError(`Cannot change order status from ${order.status} to ${status}`, 400));
  }
  order.status = status;
  await order.save();

  if (user?.email) {
    const defaultNotes = {
      pending: 'Your order is pending review and confirmation.',
      processing: 'Your order is now being processed by our team.',
      shipped: 'Your order is on the way.',
      delivered: 'Your order has been delivered.',
      cancelled: 'Your order has been cancelled.',
    };
    notificationService.sendOrderStatusEmail(user, order, req.body.note || defaultNotes[status]).catch(() => {});
  }
  res.json(order);
});

exports.cancelOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findByPk(req.params.id);
  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  if (req.user.role === 'user' && order.userId !== req.user.id) {
    return next(new AppError('You do not have permission to cancel this order', 403));
  }

  // Allow cancellation only if order is pending
  if (order.status !== 'pending') {
    return next(new AppError('Order cannot be cancelled', 400));
  }
  order.status = 'cancelled';
  await order.save();
  const user = await User.findByPk(order.userId);
  if (user?.email) {
    notificationService.sendOrderStatusEmail(
      user,
      order,
      'Your order has been cancelled. If a refund applies, you will receive a separate refund update by email.',
    ).catch(() => {});
  }
  res.json(order);
});

exports.verifyPayment = catchAsync(async (req, res, next) => {
  const order = await Order.findByPk(req.params.id, {
    include: [{ model: OrderItem, include: [Product] }],
  });
  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  if (req.user.role === 'user' && order.userId !== req.user.id) {
    return next(new AppError('You do not have permission to verify this order', 403));
  }

  const transactionId = req.body.transactionId || req.body.transaction_id || req.query.transactionId || req.query.transaction_id;
  const reference = req.body.reference || req.query.reference;
  if (!transactionId && !reference) {
    return next(new AppError('transactionId or reference is required to verify payment', 400));
  }

  let paymentData;
  try {
    paymentData = transactionId
      ? await paymentService.verifyTransaction(transactionId)
      : await paymentService.verifyTransactionByReference(reference);
  } catch (error) {
    await logFlutterwaveAudit({
      req,
      order,
      action: 'flutterwave.verify',
      status: 'failure',
      errorMessage: error?.message || 'Payment verification failed',
      response: null,
    });
    throw error;
  }

  const txn = paymentData?.data || paymentData;
  if (!txn?.tx_ref) {
    return next(new AppError('Transaction reference missing from payment processor response', 400));
  }

  await logFlutterwaveAudit({
    req,
    order,
    action: 'flutterwave.verify',
    status: isSuccessfulTransaction(txn) ? 'success' : 'failure',
    errorMessage: !isSuccessfulTransaction(txn) ? 'Payment not confirmed' : null,
    response: paymentData,
  });

  if (!isSuccessfulTransaction(txn)) {
    if (isFailedTransaction(txn)) {
      await markOrderFailedFromTransaction(order);
      const user = await User.findByPk(order.userId);
      if (user) {
        notificationService.sendPaymentFailedEmail(
          user,
          order,
          mapOrderItems(order.OrderItems),
          'Payment could not be confirmed. Please retry with the same order.',
        ).catch(() => {});
      }
    }
    return next(new AppError('Payment has not been confirmed yet', 400));
  }

  const { wasAlreadyPaid } = await markOrderPaidFromTransaction(order, {
    ...txn,
    flw_ref: txn?.flw_ref || transactionId || reference,
  });

  const user = await User.findByPk(order.userId);
  if (user && !wasAlreadyPaid) {
    await notificationService.sendReceiptEmail(user, order, mapOrderItems(order.OrderItems));
    await notificationService.sendAdminOrderAlert(order, mapOrderItems(order.OrderItems), user);
  }

  res.json({
    message: 'Payment verified successfully',
    order,
  });
});

exports.handleFlutterwaveWebhook = catchAsync(async (req, res, next) => {
  const signature = req.headers['verif-hash'] || req.headers['x-verif-hash'];
  if (!paymentService.verifyWebhookSignature(signature)) {
    return next(new AppError('Invalid webhook signature', 401));
  }

  const rawPayload = Buffer.isBuffer(req.body)
    ? req.body.toString('utf8')
    : JSON.stringify(req.body || {});

  let payload;
  try {
    payload = JSON.parse(rawPayload || '{}');
  } catch (error) {
    return next(new AppError('Invalid webhook payload', 400));
  }

  const eventType = String(payload?.event || '').toLowerCase();
  if (!eventType.includes('charge')) {
    return res.status(200).json({ message: 'Webhook ignored' });
  }

  const txn = payload?.data || {};
  await logFlutterwaveAudit({
    req,
    order: txn?.tx_ref ? { orderNumber: String(txn.tx_ref) } : null,
    action: 'flutterwave.webhook',
    status: isSuccessfulTransaction(txn) ? 'success' : 'failure',
    errorMessage: !isSuccessfulTransaction(txn) ? 'Payment not confirmed' : null,
    response: payload,
  });
  if (!isSuccessfulTransaction(txn)) {
    if (isFailedTransaction(txn)) {
      const txRef = String(txn.tx_ref || '').trim();
      if (txRef) {
        const failedOrder = await Order.findOne({
          where: { orderNumber: txRef },
          include: [{ model: OrderItem, include: [Product] }],
        });
        if (failedOrder) {
          await markOrderFailedFromTransaction(failedOrder);
          const user = await User.findByPk(failedOrder.userId);
          if (user) {
            notificationService.sendPaymentFailedEmail(
              user,
              failedOrder,
              mapOrderItems(failedOrder.OrderItems),
              'Payment webhook reported a failed transaction.',
            ).catch(() => {});
          }
        }
      }
    }
    return res.status(200).json({ message: 'Payment not successful, no update applied' });
  }

  const txRef = String(txn.tx_ref || '').trim();
  if (!txRef) {
    return next(new AppError('Webhook transaction reference missing', 400));
  }

  const order = await Order.findOne({
    where: { orderNumber: txRef },
    include: [{ model: OrderItem, include: [Product] }],
  });

  if (!order) {
    return next(new AppError('Order not found for webhook transaction', 404));
  }

  const { wasAlreadyPaid } = await markOrderPaidFromTransaction(order, txn);

  const user = await User.findByPk(order.userId);
  if (user && !wasAlreadyPaid) {
    await notificationService.sendReceiptEmail(user, order, mapOrderItems(order.OrderItems));
    await notificationService.sendAdminOrderAlert(order, mapOrderItems(order.OrderItems), user);
  }

  return res.status(200).json({ message: 'Webhook processed' });
});

exports.refundOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findByPk(req.params.id);
  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  if (order.status !== 'cancelled') {
    return next(new AppError('Refunds can only be issued for cancelled orders', 400));
  }

  if (order.paymentStatus !== 'paid') {
    return next(new AppError('Only cancelled paid orders can be refunded', 400));
  }

  const existingRefund = await RefundRequest.findOne({
    where: {
      orderId: order.id,
      status: { [Op.in]: ['pending', 'approved', 'completed'] },
    },
  });
  if (existingRefund) {
    return next(new AppError('A refund flow already exists for this order', 400));
  }

  const refund = await RefundRequest.create({
    orderId: order.id,
    userId: order.userId,
    reason: req.body.reason || 'Admin issued refund for a cancelled order.',
    requestedAmount: order.totalAmount,
    status: 'pending',
  });

  const approvedRefund = await refundService.approveRefund(refund.id, req.user.id, {
    approvedAmount: order.totalAmount,
    notes: req.body.reason || 'Your cancelled order has entered refund processing. We will email you again once the refund is completed.',
  });

  const user = await User.findByPk(order.userId);
  if (user) {
    await notificationService.sendOrderStatusEmail(
      user,
      order,
      'Your cancelled order is now in refund processing. We will keep you updated by email until the refund is completed.',
    ).catch(() => {});
  }

  res.json({
    message: 'Refund issued successfully',
    order,
    refund: approvedRefund,
  });
});
