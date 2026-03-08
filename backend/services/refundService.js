const { Op } = require('sequelize');
const { RefundRequest, Order, User, AuditLog } = require('../models');
const AppError = require('../utils/AppError');
const Logger = require('../utils/Logger');
const auditService = require('./auditService');

const logger = new Logger('RefundService');

class RefundService {
  /**
   * Create a new refund request
   * @param {string} orderId - Order ID
   * @param {string} userId - User ID (requester)
   * @param {object} refundData - { reason, requestedAmount, attachments }
   * @returns {object} Created refund request
   */
  async createRefund(orderId, userId, refundData = {}) {
    const order = await Order.findByPk(orderId);
    if (!order) {
      throw new AppError('Order not found', 404);
    }

    if (order.userId !== userId) {
      throw new AppError('You can only request refund for your own orders', 403);
    }

    if (order.paymentStatus !== 'paid') {
      throw new AppError('Cannot refund unpaid orders', 400);
    }

    if (!['pending', 'processing', 'delivered'].includes(order.status)) {
      throw new AppError('Cannot refund orders with this status', 400);
    }

    const maxRefundAmount = order.totalAmount;
    const requestedAmount = refundData.requestedAmount || maxRefundAmount;

    if (requestedAmount > maxRefundAmount) {
      throw new AppError(
        `Requested amount (${requestedAmount}) exceeds order total (${maxRefundAmount})`,
        400,
      );
    }

    const existingRefund = await RefundRequest.findOne({
      where: { orderId, status: 'pending' },
    });

    if (existingRefund) {
      throw new AppError('Pending refund already exists for this order', 400);
    }

    const refund = await RefundRequest.create({
      orderId,
      userId,
      reason: refundData.reason || '',
      requestedAmount,
      status: 'pending',
      attachments: refundData.attachments || null,
    });

    await auditService.log(userId, 'CREATE_REFUND_REQUEST', 'RefundRequest', refund.id, {
      orderId,
      amount: requestedAmount,
      reason: refundData.reason,
    });

    logger.info(`Refund request created: ${refund.id} for order ${orderId}`);
    return refund;
  }

  /**
   * Get refund by ID
   * @param {string} refundId - Refund request ID
   * @param {string} userId - Current user ID (for permission check)
   * @returns {object} Refund request
   */
  async getRefund(refundId, userId = null) {
    const refund = await RefundRequest.findByPk(refundId, {
      include: [
        { model: Order, attributes: ['id', 'orderNumber', 'totalAmount', 'status', 'paymentStatus'] },
        { model: User, as: 'user', attributes: ['id', 'email', 'name'] },
        { model: User, as: 'processor', attributes: ['id', 'email', 'name'] },
      ],
    });

    if (!refund) {
      throw new AppError('Refund request not found', 404);
    }

    if (userId && refund.userId !== userId) {
      throw new AppError('You can only view your own refund requests', 403);
    }

    return refund;
  }

  /**
   * Get refunds for a user
   * @param {string} userId - User ID
   * @param {object} options - { limit, offset, status }
   * @returns {object} { refunds, total }
   */
  async getUserRefunds(userId, options = {}) {
    const { limit = 10, offset = 0, status = null } = options;

    const where = { userId };
    if (status) {
      where.status = status;
    }

    const { count, rows } = await RefundRequest.findAndCountAll({
      where,
      include: [
        { model: Order, attributes: ['id', 'orderNumber', 'totalAmount', 'status'] },
        {
          model: User,
          as: 'processor',
          attributes: ['id', 'email', 'name'],
        },
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return { refunds: rows, total: count };
  }

  /**
   * Get all refunds (admin only)
   * @param {object} options - { limit, offset, status, userId, startDate, endDate }
   * @returns {object} { refunds, total }
   */
  async getAllRefunds(options = {}) {
    const {
      limit = 20,
      offset = 0,
      status = null,
      userId = null,
      startDate = null,
      endDate = null,
    } = options;

    const where = {};
    if (status) {
      where.status = status;
    }
    if (userId) {
      where.userId = userId;
    }
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt[Op.gte] = new Date(startDate);
      }
      if (endDate) {
        where.createdAt[Op.lte] = new Date(endDate);
      }
    }

    const { count, rows } = await RefundRequest.findAndCountAll({
      where,
      include: [
        { model: Order, attributes: ['id', 'orderNumber', 'totalAmount', 'status', 'paymentStatus'] },
        { model: User, as: 'user', attributes: ['id', 'email', 'name'] },
        { model: User, as: 'processor', attributes: ['id', 'email', 'name'] },
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return { refunds: rows, total: count };
  }

  /**
   * Approve a refund request
   * @param {string} refundId - Refund request ID
   * @param {string} adminId - Admin user ID
   * @param {object} approvalData - { approvedAmount, notes }
   * @returns {object} Updated refund request
   */
  async approveRefund(refundId, adminId, approvalData = {}) {
    const refund = await RefundRequest.findByPk(refundId);
    if (!refund) {
      throw new AppError('Refund request not found', 404);
    }

    if (refund.status !== 'pending') {
      throw new AppError(`Cannot approve refund with status: ${refund.status}`, 400);
    }

    const approvedAmount = approvalData.approvedAmount || refund.requestedAmount;
    if (approvedAmount > refund.requestedAmount) {
      throw new AppError('Approved amount cannot exceed requested amount', 400);
    }

    refund.status = 'approved';
    refund.approvedAmount = approvedAmount;
    refund.processedBy = adminId;
    refund.adminNotes = approvalData.notes || '';
    refund.processedAt = new Date();
    await refund.save();

    await auditService.log(adminId, 'APPROVE_REFUND', 'RefundRequest', refundId, {
      orderId: refund.orderId,
      approvedAmount,
      notes: approvalData.notes,
    });

    logger.info(`Refund approved: ${refundId} for amount ${approvedAmount}`);
    return refund;
  }

  /**
   * Reject a refund request
   * @param {string} refundId - Refund request ID
   * @param {string} adminId - Admin user ID
   * @param {object} rejectionData - { reason, notes }
   * @returns {object} Updated refund request
   */
  async rejectRefund(refundId, adminId, rejectionData = {}) {
    const refund = await RefundRequest.findByPk(refundId);
    if (!refund) {
      throw new AppError('Refund request not found', 404);
    }

    if (refund.status !== 'pending') {
      throw new AppError(`Cannot reject refund with status: ${refund.status}`, 400);
    }

    refund.status = 'rejected';
    refund.processedBy = adminId;
    refund.adminNotes = [rejectionData.reason, rejectionData.notes].filter(Boolean).join('\n');
    refund.processedAt = new Date();
    await refund.save();

    await auditService.log(adminId, 'REJECT_REFUND', 'RefundRequest', refundId, {
      orderId: refund.orderId,
      reason: rejectionData.reason,
      notes: rejectionData.notes,
    });

    logger.info(`Refund rejected: ${refundId}`);
    return refund;
  }

  /**
   * Mark refund as completed
   * @param {string} refundId - Refund request ID
   * @param {string} adminId - Admin user ID
   * @param {object} completionData - { transactionRef, completedAt }
   * @returns {object} Updated refund request
   */
  async completeRefund(refundId, adminId, completionData = {}) {
    const refund = await RefundRequest.findByPk(refundId);
    if (!refund) {
      throw new AppError('Refund request not found', 404);
    }

    if (refund.status !== 'approved') {
      throw new AppError('Can only complete approved refunds', 400);
    }

    refund.status = 'completed';
    refund.processedBy = adminId;
    refund.processedAt = completionData.completedAt || new Date();
    refund.adminNotes = [
      refund.adminNotes,
      completionData.transactionRef ? `Transaction reference: ${completionData.transactionRef}` : null,
    ].filter(Boolean).join('\n');
    await refund.save();

    // Update order status if fully refunded
    const order = await Order.findByPk(refund.orderId);
    if (order && refund.approvedAmount >= order.totalAmount) {
      order.paymentStatus = 'refunded';
      order.status = 'cancelled';
      await order.save();
    }

    await auditService.log(adminId, 'COMPLETE_REFUND', 'RefundRequest', refundId, {
      orderId: refund.orderId,
      amount: refund.approvedAmount,
      transactionRef: completionData.transactionRef,
    });

    logger.info(`Refund completed: ${refundId}`);
    return refund;
  }

  /**
   * Get refund statistics
   * @param {object} options - { startDate, endDate }
   * @returns {object} Statistics
   */
  async getRefundStats(options = {}) {
    const { startDate = null, endDate = null } = options;

    const where = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt[Op.gte] = new Date(startDate);
      }
      if (endDate) {
        where.createdAt[Op.lte] = new Date(endDate);
      }
    }

    const [pending, approved, rejected, completed] = await Promise.all([
      RefundRequest.count({ where: { ...where, status: 'pending' } }),
      RefundRequest.count({ where: { ...where, status: 'approved' } }),
      RefundRequest.count({ where: { ...where, status: 'rejected' } }),
      RefundRequest.count({ where: { ...where, status: 'completed' } }),
    ]);

    const totalRefunds = await RefundRequest.sum('approvedAmount', {
      where: { ...where, status: 'completed' },
    });

    return {
      pending,
      approved,
      rejected,
      completed,
      totalRefunds: totalRefunds || 0,
    };
  }
}

module.exports = new RefundService();
