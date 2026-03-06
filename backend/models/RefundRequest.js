const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const RefundRequest = sequelize.define('RefundRequest', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    orderId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'orders',
        key: 'id',
      },
      field: 'order_id',
    },
    userId: {
      type: DataTypes.UUID,
      // allow null so ON DELETE SET NULL associations succeed
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
      field: 'user_id',
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    itemIds: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Array of order item IDs to refund. If null, refund entire order.',
      field: 'item_ids',
    },
    requestedAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'requested_amount',
    },
    approvedAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: 'approved_amount',
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected', 'completed'),
      defaultValue: 'pending',
    },
    adminNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'admin_notes',
    },
    processedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
      field: 'processed_by',
    },
    processedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'processed_at',
    },
    attachments: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Array of file URLs or evidence provided by user',
    },
  }, {
    tableName: 'refund_requests',
    underscored: true,
    timestamps: true,
  });

  return RefundRequest;
};
