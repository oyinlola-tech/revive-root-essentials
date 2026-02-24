const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Newsletter = sequelize.define('Newsletter', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active',
    },
  }, {
    tableName: 'newsletters',
    underscored: true,
    timestamps: true,
  });

  return Newsletter;
};