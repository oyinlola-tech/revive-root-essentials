const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Order = sequelize.define('Order', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    orderNumber: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      field: 'order_number',
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
      field: 'user_id',
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'total_amount',
    },
    shippingFee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      field: 'shipping_fee',
    },
    currency: {
      type: DataTypes.STRING(3),
      defaultValue: 'NGN',
    },
    status: {
      type: DataTypes.ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled'),
      defaultValue: 'pending',
    },
    paymentMethod: {
      type: DataTypes.STRING(50),
      field: 'payment_method',
    },
    paymentStatus: {
      type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
      defaultValue: 'pending',
      field: 'payment_status',
    },
    squadTransactionRef: {
      type: DataTypes.STRING(100),
      field: 'squad_transaction_ref',
    },
    shippingAddress: {
      type: DataTypes.JSON,
      field: 'shipping_address',
    },
  }, {
    tableName: 'orders',
    underscored: true,
    timestamps: true,
  });

  return Order;
};
