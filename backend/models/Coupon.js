const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Coupon = sequelize.define('Coupon', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        isUppercase: true,
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    discountType: {
      type: DataTypes.ENUM('percentage', 'fixed'),
      allowNull: false,
      validate: {
        isIn: [['percentage', 'fixed']],
      },
    },
    discountValue: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    maxDiscount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        min: 0,
      },
      field: 'max_discount',
    },
    minOrderAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        min: 0,
      },
      field: 'min_order_amount',
    },
    maxUses: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
      },
      field: 'max_uses',
    },
    maxUsesPerUser: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
      },
      field: 'max_uses_per_user',
    },
    currentUses: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'current_uses',
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'expires_at',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active',
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
      field: 'created_by',
    },
  }, {
    tableName: 'coupons',
    underscored: true,
    timestamps: true,
  });

  return Coupon;
};
