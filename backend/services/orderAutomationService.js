const { Op } = require('sequelize');
const { Order, User, OrderItem, Product, CartItem } = require('../models');
const notificationService = require('./notificationService');

const AUTO_PROCESS_AFTER_MINUTES = Number(process.env.ORDER_AUTO_PROCESS_MINUTES || 25);
const AUTO_CANCEL_AFTER_MINUTES = Number(process.env.ORDER_AUTO_CANCEL_MINUTES || 60);
const POLL_INTERVAL_MS = Number(process.env.ORDER_AUTOMATION_POLL_MS || 60 * 1000);

let timer = null;
let isRunning = false;

const processStalePendingOrders = async () => {
  const threshold = new Date(Date.now() - AUTO_PROCESS_AFTER_MINUTES * 60 * 1000);
  const orders = await Order.findAll({
    where: {
      status: 'pending',
      createdAt: { [Op.lte]: threshold },
      paymentStatus: 'paid',
    },
  });

  for (const order of orders) {
    order.status = 'processing';
    await order.save();

    if (order.userId) {
      const user = await User.findByPk(order.userId);
      if (user?.email) {
        await notificationService.sendOrderStatusEmail(
          user,
          order,
          `Your order automatically moved to processing after ${AUTO_PROCESS_AFTER_MINUTES} minutes and is now being handled by our team.`,
        ).catch(() => {});
      }
    }
  }

  return orders.length;
};

const restoreStockForOrder = async (orderId) => {
  if (!orderId) return;
  const items = await OrderItem.findAll({
    where: { orderId },
    attributes: ['productId', 'quantity'],
  });
  if (!items.length) return;
  await Promise.all(items.map((item) => (
    Product.increment('stock', {
      by: Number(item.quantity || 0),
      where: { id: item.productId },
    })
  )));
};

const restoreCartForOrder = async (order) => {
  if (!order?.userId) return;
  const items = await OrderItem.findAll({
    where: { orderId: order.id },
    attributes: ['productId', 'quantity'],
  });
  if (!items.length) return;
  for (const item of items) {
    const existing = await CartItem.findOne({
      where: { userId: order.userId, productId: item.productId },
    });
    if (existing) {
      existing.quantity = Number(existing.quantity || 0) + Number(item.quantity || 0);
      await existing.save();
    } else {
      await CartItem.create({
        userId: order.userId,
        productId: item.productId,
        quantity: Number(item.quantity || 0) || 1,
      });
    }
  }
};

const cancelStaleUnpaidOrders = async () => {
  const threshold = new Date(Date.now() - AUTO_CANCEL_AFTER_MINUTES * 60 * 1000);
  const orders = await Order.findAll({
    where: {
      status: 'pending',
      createdAt: { [Op.lte]: threshold },
      paymentStatus: { [Op.in]: ['pending', 'failed'] },
    },
  });

  for (const order of orders) {
    await restoreStockForOrder(order.id);
    await restoreCartForOrder(order);
    order.status = 'cancelled';
    await order.save();

    if (order.userId) {
      const user = await User.findByPk(order.userId);
      if (user?.email) {
        await notificationService.sendOrderStatusEmail(
          user,
          order,
          `Your order was cancelled because payment was not completed within ${AUTO_CANCEL_AFTER_MINUTES} minutes.`,
        ).catch(() => {});
      }
    }
  }

  return orders.length;
};

const runAutomation = async () => {
  if (isRunning) return;
  isRunning = true;
  try {
    await processStalePendingOrders();
    await cancelStaleUnpaidOrders();
  } finally {
    isRunning = false;
  }
};

const startOrderAutomation = () => {
  if (timer) return timer;

  timer = setInterval(() => {
    runAutomation().catch(() => {});
  }, POLL_INTERVAL_MS);

  if (typeof timer.unref === 'function') timer.unref();
  runAutomation().catch(() => {});
  return timer;
};

const stopOrderAutomation = () => {
  if (!timer) return;
  clearInterval(timer);
  timer = null;
};

module.exports = {
  startOrderAutomation,
  stopOrderAutomation,
  processStalePendingOrders,
  cancelStaleUnpaidOrders,
};
