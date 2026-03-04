const { Inventory, Product } = require('../models');
const AppError = require('../utils/AppError');
const Logger = require('../utils/Logger');

const logger = new Logger('InventoryService');

class InventoryService {
  /**
   * Get inventory for a product
   */
  async getInventory(productId) {
    try {
      const inventory = await Inventory.findOne({
        where: { productId },
        include: [{ model: Product, attributes: ['name', 'price'] }],
      });

      if (!inventory) {
        return null;
      }

      return {
        id: inventory.id,
        productId: inventory.productId,
        sku: inventory.sku,
        quantity: inventory.quantity,
        available: inventory.quantity - (inventory.reservedQuantity || 0),
        reserved: inventory.reservedQuantity,
        warehouseLocation: inventory.warehouseLocation,
        reorderLevel: inventory.reorderLevel,
        needsReorder: inventory.reorderLevel && inventory.quantity <= inventory.reorderLevel,
        product: inventory.Product,
      };
    } catch (error) {
      logger.error('Failed to get inventory', error, { productId });
      throw error;
    }
  }

  /**
   * Check if product has sufficient stock
   */
  async hasStock(productId, quantity) {
    try {
      const inventory = await Inventory.findOne({
        where: { productId },
      });

      if (!inventory) {
        return false;
      }

      const available = inventory.quantity - (inventory.reservedQuantity || 0);
      return available >= quantity;
    } catch (error) {
      logger.error('Failed to check stock', error, { productId, quantity });
      return false;
    }
  }

  /**
   * Reserve inventory for an order
   */
  async reserveStock(productId, quantity) {
    try {
      const inventory = await Inventory.findOne({
        where: { productId },
      });

      if (!inventory) {
        throw new AppError('Inventory not found for product', 404);
      }

      const available = inventory.quantity - (inventory.reservedQuantity || 0);
      if (available < quantity) {
        throw new AppError('Insufficient stock', 400);
      }

      inventory.reservedQuantity = (inventory.reservedQuantity || 0) + quantity;
      await inventory.save();

      logger.info(`Stock reserved: ${productId}`, { quantity, reserved: inventory.reservedQuantity });
      return inventory;
    } catch (error) {
      logger.error('Failed to reserve stock', error, { productId, quantity });
      throw error;
    }
  }

  /**
   * Release reserved stock
   */
  async releaseStock(productId, quantity) {
    try {
      const inventory = await Inventory.findOne({
        where: { productId },
      });

      if (!inventory) {
        throw new AppError('Inventory not found', 404);
      }

      inventory.reservedQuantity = Math.max(0, (inventory.reservedQuantity || 0) - quantity);
      await inventory.save();

      logger.info(`Stock released: ${productId}`, { quantity, reserved: inventory.reservedQuantity });
      return inventory;
    } catch (error) {
      logger.error('Failed to release stock', error, { productId, quantity });
      throw error;
    }
  }

  /**
   * Deduct stock after order completion
   */
  async deductStock(productId, quantity, reason = 'order') {
    try {
      const inventory = await Inventory.findOne({
        where: { productId },
      });

      if (!inventory) {
        throw new AppError('Inventory not found', 404);
      }

      if (inventory.quantity < quantity) {
        throw new AppError('Insufficient stock for deduction', 400);
      }

      inventory.quantity -= quantity;
      inventory.reservedQuantity = Math.max(0, (inventory.reservedQuantity || 0) - quantity);
      await inventory.save();

      logger.info(`Stock deducted: ${productId}`, { quantity, reason, remaining: inventory.quantity });
      return inventory;
    } catch (error) {
      logger.error('Failed to deduct stock', error, { productId, quantity });
      throw error;
    }
  }

  /**
   * Add stock (restock)
   */
  async addStock(productId, quantity, reason = 'restock') {
    try {
      const inventory = await Inventory.findOne({
        where: { productId },
      });

      if (!inventory) {
        throw new AppError('Inventory not found', 404);
      }

      inventory.quantity += quantity;
      await inventory.save();

      logger.info(`Stock added: ${productId}`, { quantity, reason, total: inventory.quantity });
      return inventory;
    } catch (error) {
      logger.error('Failed to add stock', error, { productId, quantity });
      throw error;
    }
  }

  /**
   * Get products that need reordering
   */
  async getReorderItems() {
    try {
      const inventories = await Inventory.findAll({
        where: this.sequelize.where(
          this.sequelize.col('quantity'),
          this.sequelize.Op.lte,
          this.sequelize.col('reorder_level')
        ),
        include: [{ model: Product, attributes: ['id', 'name', 'price'] }],
        order: [['quantity', 'ASC']],
      });

      return inventories.map((inv) => ({
        id: inv.id,
        sku: inv.sku,
        product: inv.Product,
        currentQuantity: inv.quantity,
        reorderLevel: inv.reorderLevel,
        reorderQuantity: inv.reorderQuantity,
        shortage: Math.max(0, (inv.reorderLevel || 0) - inv.quantity),
      }));
    } catch (error) {
      logger.error('Failed to get reorder items', error);
      throw error;
    }
  }
}

module.exports = new InventoryService();
