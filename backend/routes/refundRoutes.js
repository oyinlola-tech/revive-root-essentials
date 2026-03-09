const express = require('express');
const refundController = require('../controllers/refundController');
const { authenticate, authorize, requireAdmin } = require('../middlewares/authMiddlewareEnhanced');
const { createRefundValidation } = require('../validations/advancedValidation');

const router = express.Router();

/**
 * Customer Routes
 */

// Create refund request - requires authentication
router.post(
  '/',
  authenticate,
  requireAdmin,
  createRefundValidation,
  refundController.createRefund,
);

// Get all refunds for current user
router.get(
  '/',
  authenticate,
  refundController.getMyRefunds,
);

// Get all refunds (admin only)
router.get(
  '/admin/all',
  authenticate,
  requireAdmin,
  refundController.getAllRefunds,
);

// Get refund stats (admin only)
router.get(
  '/admin/stats',
  authenticate,
  requireAdmin,
  refundController.getRefundStats,
);

// Approve refund (admin only)
router.patch(
  '/:id/approve',
  authenticate,
  requireAdmin,
  refundController.approveRefund,
);

// Reject refund (admin only)
router.patch(
  '/:id/reject',
  authenticate,
  requireAdmin,
  refundController.rejectRefund,
);

// Complete refund (admin only)
router.patch(
  '/:id/complete',
  authenticate,
  requireAdmin,
  refundController.completeRefund,
);

// Get specific refund
router.get(
  '/:id',
  authenticate,
  refundController.getRefund,
);

module.exports = router;
