const { Inventory, Product } = require('../models');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const inventoryService = require('../services/inventoryService');
const { inventoryValidation } = require('../validations/advancedValidation');
const { validationResult } = require('express-validator');
const Logger = require('../utils/Logger');

const logger = new Logger('InventoryController');

/**
 * ADMIN: Get inventory for a product
 * GET /api/admin/inventory/product/:productId
 */
exports.getProductInventory = catchAsync(async (req, res, next) => {
  const { productId } = req.params;

  const inventory = await inventoryService.getInventory(productId);

  if (!inventory) {
    return next(new AppError('Inventory not found for this product', 404));
  }

  res.status(200).json({
    success: true,
    data: inventory,
  });
});

/**
 * ADMIN: Get all inventory
 * GET /api/admin/inventory
 */
exports.getAllInventory = catchAsync(async (req, res, next) => {
  const { limit = 20, offset = 0, lowStock = false } = req.query;

  const where = {};
  if (lowStock === 'true') {
    where.$and = [
      { $where: 'quantity <= reorderLevel' },
    ];
  }

  const { count, rows } = await Inventory.findAndCountAll({
    where,
    include: [
      {
        model: Product,
        as: 'product',
        attributes: ['id', 'name', 'sku', 'price'],
      },
    ],
    limit: parseInt(limit, 10),
    offset: parseInt(offset, 10),
    order: [['quantity', 'ASC']],
  });

  res.status(200).json({
    success: true,
    data: rows,
    pagination: {
      total: count,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
      pages: Math.ceil(count / parseInt(limit, 10)),
    },
  });
});

/**
 * ADMIN: Check stock availability
 * POST /api/admin/inventory/check-stock
 */
exports.checkStock = catchAsync(async (req, res, next) => {
  const { productId, quantity } = req.body;

  if (!productId || quantity === undefined) {
    return next(new AppError('ProductId and quantity are required', 400));
  }

  const hasStock = await inventoryService.hasStock(productId, parseInt(quantity, 10));

  res.status(200).json({
    success: true,
    data: {
      productId,
      requestedQuantity: quantity,
      hasStock,
    },
  });
});

/**
 * ADMIN: Adjust inventory (add/subtract stock)
 * POST /api/admin/inventory/:productId/adjust
 */
exports.adjustInventory = catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError(errors.array()[0].msg, 400));
  }

  const { productId } = req.params;
  const { quantity, reason } = req.body;

  if (quantity === 0) {
    return next(new AppError('Quantity cannot be zero', 400));
  }

  let inventory;
  if (quantity > 0) {
    inventory = await inventoryService.addStock(productId, quantity, reason);
  } else {
    inventory = await inventoryService.deductStock(productId, Math.abs(quantity), reason);
  }

  logger.info(`Inventory adjusted for product ${productId}: ${quantity} units. Reason: ${reason}`);

  res.status(200).json({
    success: true,
    message: 'Inventory updated successfully',
    data: inventory,
  });
});

/**
 * ADMIN: Reserve stock for an order
 * POST /api/admin/inventory/:productId/reserve
 */
exports.reserveStock = catchAsync(async (req, res, next) => {
  const { productId } = req.params;
  const { quantity } = req.body;

  if (!quantity || quantity <= 0) {
    return next(new AppError('Quantity must be greater than 0', 400));
  }

  const inventory = await inventoryService.reserveStock(productId, parseInt(quantity, 10));

  logger.info(`Stock reserved for product ${productId}: ${quantity} units`);

  res.status(200).json({
    success: true,
    message: 'Stock reserved successfully',
    data: inventory,
  });
});

/**
 * ADMIN: Release reserved stock
 * POST /api/admin/inventory/:productId/release
 */
exports.releaseStock = catchAsync(async (req, res, next) => {
  const { productId } = req.params;
  const { quantity } = req.body;

  if (!quantity || quantity <= 0) {
    return next(new AppError('Quantity must be greater than 0', 400));
  }

  const inventory = await inventoryService.releaseStock(productId, parseInt(quantity, 10));

  logger.info(`Stock released for product ${productId}: ${quantity} units`);

  res.status(200).json({
    success: true,
    message: 'Stock released successfully',
    data: inventory,
  });
});

/**
 * ADMIN: Get low stock items (reorder alerts)
 * GET /api/admin/inventory/reorder/items
 */
exports.getReorderItems = catchAsync(async (req, res, next) => {
  const items = await inventoryService.getReorderItems();

  res.status(200).json({
    success: true,
    message: `${items.length} items need reordering`,
    data: items,
  });
});

/**
 * ADMIN: Get inventory statistics
 * GET /api/admin/inventory/stats
 */
exports.getInventoryStats = catchAsync(async (req, res, next) => {
  const totalInventory = await Inventory.count();
  const lowStockItems = await Inventory.count({
    where: {
      $where: 'quantity <= reorderLevel',
    },
  });

  const outOfStock = await Inventory.count({
    where: { quantity: 0 },
  });

  const totalQuantity = await Inventory.sum('quantity');

  res.status(200).json({
    success: true,
    data: {
      totalInventory,
      lowStockItems,
      outOfStock,
      totalQuantity: totalQuantity || 0,
    },
  });
});

/**
 * ADMIN: Create inventory for a product
 * POST /api/admin/inventory
 */
exports.createInventory = catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError(errors.array()[0].msg, 400));
  }

  const {
    productId,
    sku,
    quantity,
    warehouseLocation,
    reorderLevel,
  } = req.body;

  // Check if inventory already exists
  const existingInventory = await Inventory.findOne({ where: { productId } });
  if (existingInventory) {
    return next(new AppError('Inventory already exists for this product', 400));
  }

  const inventory = await Inventory.create({
    productId,
    sku,
    quantity,
    warehouseLocation,
    reorderLevel,
    reservedQuantity: 0,
  });

  logger.info(`Inventory created for product ${productId}: ${quantity} units`);

  res.status(201).json({
    success: true,
    message: 'Inventory created successfully',
    data: inventory,
  });
});

/**
 * ADMIN: Update inventory settings
 * PUT /api/admin/inventory/:productId
 */
exports.updateInventory = catchAsync(async (req, res, next) => {
  const { productId } = req.params;
  const {
    sku,
    warehouseLocation,
    reorderLevel,
  } = req.body;

  const inventory = await Inventory.findOne({ where: { productId } });

  if (!inventory) {
    return next(new AppError('Inventory not found for this product', 404));
  }

  if (sku) inventory.sku = sku;
  if (warehouseLocation) inventory.warehouseLocation = warehouseLocation;
  if (reorderLevel !== undefined) inventory.reorderLevel = reorderLevel;

  await inventory.save();

  logger.info(`Inventory updated for product ${productId}`);

  res.status(200).json({
    success: true,
    message: 'Inventory settings updated successfully',
    data: inventory,
  });
});
