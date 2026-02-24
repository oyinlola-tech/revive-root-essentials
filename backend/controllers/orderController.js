const { Order, OrderItem, Product } = require('../models');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const orderService = require('../services/orderService');
const paymentService = require('../services/paymentService');

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
  const { items, shippingAddress, paymentMethod } = req.body;

  // Validate items (could be from cart or directly provided)
  // For simplicity, we assume items array is provided directly
  const order = await orderService.createOrder(userId, { paymentMethod, shippingAddress }, items);

  // Initiate payment with Squad
  const paymentResponse = await paymentService.initiateTransaction({
    amount: order.totalAmount,
    email: req.user.email,
    currency: order.currency,
    reference: order.orderNumber,
    callbackUrl: `${process.env.FRONTEND_URL}/order-confirmation`,
  });

  res.status(201).json({
    orderId: order.id,
    orderNumber: order.orderNumber,
    total: order.totalAmount,
    status: order.status,
    paymentUrl: paymentResponse.data?.checkout_url, // depends on Squad response
  });
});

exports.updateOrderStatus = catchAsync(async (req, res, next) => {
  const { status } = req.body;
  const order = await Order.findByPk(req.params.id);
  if (!order) {
    return next(new AppError('Order not found', 404));
  }
  order.status = status;
  await order.save();
  res.json(order);
});

exports.cancelOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findByPk(req.params.id);
  if (!order) {
    return next(new AppError('Order not found', 404));
  }
  // Allow cancellation only if order is pending
  if (order.status !== 'pending') {
    return next(new AppError('Order cannot be cancelled', 400));
  }
  order.status = 'cancelled';
  await order.save();
  res.json(order);
});