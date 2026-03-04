const express = require('express');
const adminController = require('../controllers/adminController');
const { authenticate, requireAdmin } = require('../middlewares/authMiddlewareEnhanced');

const router = express.Router();

/**
 * All admin routes require authentication and admin role
 */

// Dashboard
router.get(
  '/dashboard',
  authenticate,
  requireAdmin,
  adminController.getDashboard,
);

// Analytics
router.get(
  '/analytics',
  authenticate,
  requireAdmin,
  adminController.getAnalytics,
);

// Statistics
router.get(
  '/stats',
  authenticate,
  requireAdmin,
  adminController.getStats,
);

/**
 * User Management
 */

// Get all users
router.get(
  '/users',
  authenticate,
  requireAdmin,
  adminController.getAllUsers,
);

// Get user details
router.get(
  '/users/:id',
  authenticate,
  requireAdmin,
  adminController.getUser,
);

// Update user
router.patch(
  '/users/:id',
  authenticate,
  requireAdmin,
  adminController.updateUser,
);

/**
 * Order Management
 */

// Get all orders
router.get(
  '/orders',
  authenticate,
  requireAdmin,
  adminController.getAllOrders,
);

// Update order status
router.patch(
  '/orders/:id/status',
  authenticate,
  requireAdmin,
  adminController.updateOrderStatus,
);

/**
 * Product Bulk Operations
 */

// Bulk update products
router.post(
  '/products/bulk-update',
  authenticate,
  requireAdmin,
  adminController.bulkUpdateProducts,
);

// Bulk delete products
router.post(
  '/products/bulk-delete',
  authenticate,
  requireAdmin,
  adminController.bulkDeleteProducts,
);

module.exports = router;
