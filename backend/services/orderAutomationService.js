const { Op } = require('sequelize');
const { Order, User } = require('../models');
const notificationService = require('./notificationService');

const AUTO_PROCESS_AFTER_MINUTES = Number(process.env.ORDER_AUTO_PROCESS_MINUTES || 25);
const POLL_INTERVAL_MS = Number(process.env.ORDER_AUTOMATION_POLL_MS || 60 * 1000);

let timer = null;

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

const startOrderAutomation = () => {
  if (timer) return timer;

  timer = setInterval(() => {
    processStalePendingOrders().catch(() => {});
  }, POLL_INTERVAL_MS);

  if (typeof timer.unref === 'function') timer.unref();
  processStalePendingOrders().catch(() => {});
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
};
