const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AuditLog = sequelize.define('AuditLog', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
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
    action: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    resourceType: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'resource_type',
    },
    resourceId: {
      type: DataTypes.STRING(191),
      allowNull: true,
      field: 'resource_id',
    },
    changes: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Before and after values of changed fields',
    },
    ipAddress: {
      type: DataTypes.STRING(45),
      allowNull: true,
      field: 'ip_address',
    },
    userAgent: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'user_agent',
    },
    status: {
      type: DataTypes.ENUM('success', 'failure'),
      defaultValue: 'success',
    },
    statusCode: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'status_code',
    },
    errorMessage: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'error_message',
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Additional context or data',
    },
  }, {
    tableName: 'audit_logs',
    underscored: true,
    timestamps: true,
    updatedAt: false, // Audit logs should not be updated
  });

  return AuditLog;
};
