const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Inventory = sequelize.define('Inventory', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    productId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id',
      },
      field: 'product_id',
    },
    sku: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    reservedQuantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
      field: 'reserved_quantity',
    },
    warehouseLocation: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'warehouse_location',
    },
    reorderLevel: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0,
      },
      field: 'reorder_level',
    },
    reorderQuantity: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
      },
      field: 'reorder_quantity',
    },
    lastStockCheck: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'last_stock_check',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    tableName: 'inventories',
    underscored: true,
    timestamps: true,
  });

  return Inventory;
};
