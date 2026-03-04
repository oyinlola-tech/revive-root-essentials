const { RefundRequest, Order } = require('../models');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const refundService = require('../services/refundService');
const { refundValidation } = require('../validations/advancedValidation');
const { validationResult } = require('express-validator');

/**
 * Create a new refund request
 * POST /api/refunds
 */
exports.createRefund = catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError(errors.array()[0].msg, 400));
  }

  const { orderId, reason, requestedAmount, attachments } = req.body;
  const userId = req.user.id;

  const refund = await refundService.createRefund(orderId, userId, {
    reason,
    requestedAmount,
    attachments,
  });

  res.status(201).json({
    success: true,
    message: 'Refund request submitted successfully',
    data: refund,
  });
});

/**
 * Get all refunds for current user
 * GET /api/refunds
 */
exports.getMyRefunds = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const { limit = 10, offset = 0, status } = req.query;

  const { refunds, total } = await refundService.getUserRefunds(userId, {
    limit: parseInt(limit, 10),
    offset: parseInt(offset, 10),
    status,
  });

  res.status(200).json({
    success: true,
    data: refunds,
    pagination: {
      total,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
      pages: Math.ceil(total / parseInt(limit, 10)),
    },
  });
});

/**
 * Get a specific refund request
 * GET /api/refunds/:id
 */
exports.getRefund = catchAsync(async (req, res, next) => {
  const refundId = req.params.id;
  const userId = req.user ? req.user.id : null;

  const refund = await refundService.getRefund(refundId, userId);

  res.status(200).json({
    success: true,
    data: refund,
  });
});

/**
 * ADMIN: Get all refunds
 * GET /api/admin/refunds
 */
exports.getAllRefunds = catchAsync(async (req, res, next) => {
  const {
    limit = 20,
    offset = 0,
    status,
    userId,
    startDate,
    endDate,
  } = req.query;

  const { refunds, total } = await refundService.getAllRefunds({
    limit: parseInt(limit, 10),
    offset: parseInt(offset, 10),
    status,
    userId,
    startDate,
    endDate,
  });

  res.status(200).json({
    success: true,
    data: refunds,
    pagination: {
      total,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
      pages: Math.ceil(total / parseInt(limit, 10)),
    },
  });
});

/**
 * ADMIN: Approve a refund request
 * PATCH /api/admin/refunds/:id/approve
 */
exports.approveRefund = catchAsync(async (req, res, next) => {
  const refundId = req.params.id;
  const adminId = req.user.id;
  const { approvedAmount, notes } = req.body;

  const refund = await refundService.approveRefund(refundId, adminId, {
    approvedAmount,
    notes,
  });

  res.status(200).json({
    success: true,
    message: 'Refund request approved successfully',
    data: refund,
  });
});

/**
 * ADMIN: Reject a refund request
 * PATCH /api/admin/refunds/:id/reject
 */
exports.rejectRefund = catchAsync(async (req, res, next) => {
  const refundId = req.params.id;
  const adminId = req.user.id;
  const { reason, notes } = req.body;

  const refund = await refundService.rejectRefund(refundId, adminId, {
    reason,
    notes,
  });

  res.status(200).json({
    success: true,
    message: 'Refund request rejected successfully',
    data: refund,
  });
});

/**
 * ADMIN: Complete/process a refund
 * PATCH /api/admin/refunds/:id/complete
 */
exports.completeRefund = catchAsync(async (req, res, next) => {
  const refundId = req.params.id;
  const adminId = req.user.id;
  const { transactionRef, completedAt } = req.body;

  const refund = await refundService.completeRefund(refundId, adminId, {
    transactionRef,
    completedAt,
  });

  res.status(200).json({
    success: true,
    message: 'Refund processed successfully',
    data: refund,
  });
});

/**
 * ADMIN: Get refund statistics
 * GET /api/admin/refunds/stats
 */
exports.getRefundStats = catchAsync(async (req, res, next) => {
  const { startDate, endDate } = req.query;

  const stats = await refundService.getRefundStats({
    startDate,
    endDate,
  });

  res.status(200).json({
    success: true,
    data: stats,
  });
});
