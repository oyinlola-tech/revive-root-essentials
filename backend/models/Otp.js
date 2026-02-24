const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Otp = sequelize.define('Otp', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    identifier: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING(6),
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('email'),
      allowNull: false,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'expires_at',
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
  }, {
    tableName: 'otps',
    underscored: true,
    timestamps: true,
  });

  return Otp;
};
