const express = require('express');
const auditController = require('../controllers/auditController');
const { authenticate, requireAdmin } = require('../middlewares/authMiddlewareEnhanced');

const router = express.Router();

/**
 * All audit log routes are admin-only
 */

// Get all audit logs with filters
router.get(
  '/',
  authenticate,
  requireAdmin,
  auditController.getAllLogs,
);

// Get audit statistics
router.get(
  '/stats',
  authenticate,
  requireAdmin,
  auditController.getAuditStats,
);

// Get recent audit logs
router.get(
  '/recent',
  authenticate,
  requireAdmin,
  auditController.getRecentLogs,
);

// Get action summary
router.get(
  '/summary/by-action',
  authenticate,
  requireAdmin,
  auditController.getActionSummary,
);

// Export audit logs as CSV
router.get(
  '/export/csv',
  authenticate,
  requireAdmin,
  auditController.exportAuditLogs,
);

// Get logs for specific resource
router.get(
  '/resource/:resourceType/:resourceId',
  authenticate,
  requireAdmin,
  auditController.getResourceLogs,
);

// Get logs for specific user
router.get(
  '/user/:userId',
  authenticate,
  requireAdmin,
  auditController.getUserLogs,
);

module.exports = router;
