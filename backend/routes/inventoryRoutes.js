const express = require('express');
const inventoryController = require('../controllers/inventoryController');
const { authenticate, requireAdmin } = require('../middlewares/authMiddlewareEnhanced');
const { inventoryValidation } = require('../validations/advancedValidation');

const router = express.Router();

/**
 * All inventory routes are admin-only
 */

// Get all inventory
router.get(
  '/',
  authenticate,
  requireAdmin,
  inventoryController.getAllInventory,
);

// Get inventory statistics
router.get(
  '/stats',
  authenticate,
  requireAdmin,
  inventoryController.getInventoryStats,
);

// Get low stock items (reorder alerts)
router.get(
  '/reorder/items',
  authenticate,
  requireAdmin,
  inventoryController.getReorderItems,
);

// Create inventory
router.post(
  '/',
  authenticate,
  requireAdmin,
  inventoryValidation.createInventory,
  inventoryController.createInventory,
);

// Get inventory for specific product
router.get(
  '/product/:productId',
  authenticate,
  requireAdmin,
  inventoryController.getProductInventory,
);

// Check stock availability
router.post(
  '/check-stock',
  authenticate,
  requireAdmin,
  inventoryController.checkStock,
);

// Adjust inventory (add/subtract)
router.post(
  '/:productId/adjust',
  authenticate,
  requireAdmin,
  inventoryValidation.adjustInventory,
  inventoryController.adjustInventory,
);

// Reserve stock
router.post(
  '/:productId/reserve',
  authenticate,
  requireAdmin,
  inventoryController.reserveStock,
);

// Release reserved stock
router.post(
  '/:productId/release',
  authenticate,
  requireAdmin,
  inventoryController.releaseStock,
);

// Update inventory settings
router.put(
  '/:productId',
  authenticate,
  requireAdmin,
  inventoryValidation.updateInventory,
  inventoryController.updateInventory,
);

module.exports = router;
