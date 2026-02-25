const { Order, OrderItem, Product, User } = require('../models');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const orderService = require('../services/orderService');
const paymentService = require('../services/paymentService');
const notificationService = require('../services/notificationService');
const currencyService = require('../services/currencyService');

const allowedPaymentMethods = new Set(['card', 'ussd', 'transfer']);

const mapOrderItems = (orderItems = []) => orderItems.map((item) => ({
  name: item.Product?.name || 'Product',
  quantity: item.quantity,
  price: item.price,
}));

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
  const { items, shippingAddress, paymentMethod, currency } = req.body;
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

  // Validate items (could be from cart or directly provided)
  // For simplicity, we assume items array is provided directly
  const order = await orderService.createOrder(userId, { paymentMethod: normalizedPaymentMethod, shippingAddress }, items, pricingContext);
  const fullOrder = await Order.findByPk(order.id, {
    include: [{ model: OrderItem, include: [Product] }],
  });

  let paymentResponse = null;
  try {
    paymentResponse = await paymentService.initiateTransaction({
      amount: order.totalAmount,
      email: req.user.email,
      currency: order.currency,
      reference: order.orderNumber,
      callbackUrl: `${process.env.FRONTEND_URL || ''}/orders/${order.id}`,
      paymentMethod: normalizedPaymentMethod,
    });
  } catch (error) {
    return next(new AppError('Unable to initialize payment. Please try again.', 502));
  }

  await notificationService.sendOrderPlacedEmail(req.user, fullOrder, mapOrderItems(fullOrder.OrderItems));

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
  order.status = status;
  await order.save();

  if (user?.email) {
    notificationService.sendOrderStatusEmail(user, order, req.body.note).catch(() => {});
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
  if (!transactionId) {
    return next(new AppError('transactionId is required to verify payment', 400));
  }

  const paymentData = await paymentService.verifyTransaction(transactionId);
  const txn = paymentData?.data || paymentData;

  const succeeded = String(txn?.transaction_status || txn?.status || '').toLowerCase();
  if (!['success', 'successful', 'paid', 'completed'].includes(succeeded)) {
    return next(new AppError('Payment has not been confirmed yet', 400));
  }

  if (txn?.tx_ref && String(txn.tx_ref) !== String(order.orderNumber)) {
    return next(new AppError('Transaction reference does not match this order', 400));
  }

  if (txn?.currency && String(txn.currency).toUpperCase() !== String(order.currency).toUpperCase()) {
    return next(new AppError('Payment currency does not match this order', 400));
  }

  const paidAmount = Number(txn?.amount || txn?.transaction_amount || 0);
  if (paidAmount && paidAmount < Number(order.totalAmount)) {
    return next(new AppError('Paid amount is lower than order total. Verification rejected.', 400));
  }

  order.paymentStatus = 'paid';
  order.status = order.status === 'pending' ? 'processing' : order.status;
  order.paymentTransactionRef = txn?.flw_ref || txn?.tx_ref || transactionId;
  await order.save();

  const user = await User.findByPk(order.userId);
  if (user) {
    await notificationService.sendReceiptEmail(user, order, mapOrderItems(order.OrderItems));
  }

  res.json({
    message: 'Payment verified successfully',
    order,
  });
});

exports.refundOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findByPk(req.params.id);
  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  if (order.paymentStatus !== 'paid') {
    return next(new AppError('Only paid orders can be refunded', 400));
  }

  order.paymentStatus = 'refunded';
  order.status = 'cancelled';
  await order.save();

  const user = await User.findByPk(order.userId);
  if (user) {
    await notificationService.sendRefundEmail(user, order, req.body.reason);
  }

  res.json({
    message: 'Order refunded successfully',
    order,
  });
});
