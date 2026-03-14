const AppError = require('./AppError');

const STATUS_REQUIRES_PAYMENT = new Set(['processing', 'shipped', 'delivered']);

const ensurePaidForStatus = (order, nextStatus) => {
  if (!order) {
    throw new AppError('Order not found', 404);
  }

  if (nextStatus === 'cancelled') return;

  if (STATUS_REQUIRES_PAYMENT.has(nextStatus) && order.paymentStatus !== 'paid') {
    throw new AppError('Cannot update status before payment confirmation', 400);
  }
};

module.exports = {
  STATUS_REQUIRES_PAYMENT,
  ensurePaidForStatus,
};
