const { Op } = require('sequelize');
const { AuditLog, User, sequelize } = require('../models');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const auditService = require('../services/auditService');
const Logger = require('../utils/Logger');

const logger = new Logger('AuditController');

/**
 * ADMIN: Get all audit logs
 * GET /api/admin/audit-logs
 */
exports.getAllLogs = catchAsync(async (req, res, next) => {
  const {
    limit = 50,
    offset = 0,
    action = null,
    resourceType = null,
    userId = null,
    orderNumber = null,
    startDate = null,
    endDate = null,
  } = req.query;

  const filters = {};
  if (action) filters.action = action;
  if (resourceType) filters.resourceType = resourceType;
  if (userId) filters.userId = userId;
  if (orderNumber) filters.orderNumber = orderNumber;
  if (startDate) filters.startDate = new Date(startDate);
  if (endDate) filters.endDate = new Date(endDate);

  const result = await auditService.getLogs({
    ...filters,
    limit: parseInt(limit, 10),
    offset: parseInt(offset, 10),
  });

  res.status(200).json({
    success: true,
    data: result.logs,
    pagination: {
      total: result.total,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
      pages: Math.ceil(result.total / parseInt(limit, 10)),
    },
  });
});

/**
 * ADMIN: Get audit logs for a specific resource
 * GET /api/admin/audit-logs/resource/:resourceType/:resourceId
 */
exports.getResourceLogs = catchAsync(async (req, res, next) => {
  const { resourceType, resourceId } = req.params;
  const { limit = 50, offset = 0 } = req.query;

  const logs = await auditService.getResourceLogs(
    resourceType,
    resourceId,
    parseInt(limit, 10),
    parseInt(offset, 10),
  );

  res.status(200).json({
    success: true,
    data: logs,
  });
});

/**
 * ADMIN: Get audit logs for a specific user
 * GET /api/admin/audit-logs/user/:userId
 */
exports.getUserLogs = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const { limit = 50 } = req.query;

  const logs = await auditService.getUserLogs(userId, parseInt(limit, 10));

  res.status(200).json({
    success: true,
    data: logs,
  });
});

/**
 * ADMIN: Get recent audit logs
 * GET /api/admin/audit-logs/recent
 */
exports.getRecentLogs = catchAsync(async (req, res, next) => {
  const { limit = 100 } = req.query;

  const logs = await AuditLog.findAll({
    include: [
      {
        model: User,
        attributes: ['id', 'email', 'name', 'role'],
      },
    ],
    limit: parseInt(limit, 10),
    order: [['createdAt', 'DESC']],
  });

  res.status(200).json({
    success: true,
    data: logs,
  });
});

/**
 * ADMIN: Get audit statistics
 * GET /api/admin/audit-logs/stats
 */
exports.getAuditStats = catchAsync(async (req, res, next) => {
  const { startDate = null, endDate = null } = req.query;

  const where = {};
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) {
      where.createdAt[Op.gte] = new Date(startDate);
    }
    if (endDate) {
      where.createdAt[Op.lte] = new Date(endDate);
    }
  }

  const [
    totalLogs,
    createActions,
    updateActions,
    deleteActions,
    approveActions,
    failedActions,
  ] = await Promise.all([
    AuditLog.count({ where }),
    AuditLog.count({ where: { ...where, action: { [Op.like]: 'CREATE%' } } }),
    AuditLog.count({ where: { ...where, action: { [Op.like]: 'UPDATE%' } } }),
    AuditLog.count({ where: { ...where, action: { [Op.like]: 'DELETE%' } } }),
    AuditLog.count({ where: { ...where, action: { [Op.like]: 'APPROVE%' } } }),
    AuditLog.count({ where: { ...where, status: 'failed' } }),
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalLogs,
      createActions,
      updateActions,
      deleteActions,
      approveActions,
      failedActions,
    },
  });
});

/**
 * ADMIN: Export audit logs (CSV)
 * GET /api/admin/audit-logs/export/csv
 */
exports.exportAuditLogs = catchAsync(async (req, res, next) => {
  const { startDate = null, endDate = null } = req.query;

  const where = {};
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) {
      where.createdAt[Op.gte] = new Date(startDate);
    }
    if (endDate) {
      where.createdAt[Op.lte] = new Date(endDate);
    }
  }

  const logs = await AuditLog.findAll({
    where,
    include: [
      {
        model: User,
        attributes: ['email', 'name'],
      },
    ],
    order: [['createdAt', 'DESC']],
    raw: true,
  });

  // Convert to CSV format
  const csvHeader = 'ID,Timestamp,User,Action,ResourceType,ResourceId,IpAddress,Status,Changes\n';
  const csvRows = logs.map((log) => {
    const user = log['User.email'] || 'System';
    const changes = log.changes ? JSON.stringify(log.changes).replace(/"/g, '""') : '';
    return `${log.id},"${log.createdAt}","${user}","${log.action}","${log.resourceType}","${log.resourceId}","${log.ipAddress}","${log.status}","${changes}"`;
  });

  const csv = csvHeader + csvRows.join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="audit-logs.csv"');
  res.send(csv);

  logger.info(`Audit logs exported by admin ${req.user.id}`);
});

/**
 * ADMIN: Get action summary by type
 * GET /api/admin/audit-logs/summary/by-action
 */
exports.getActionSummary = catchAsync(async (req, res, next) => {
  const logs = await AuditLog.findAll({
    attributes: ['action', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
    group: ['action'],
    raw: true,
    subQuery: false,
  });

  const summary = logs.reduce((acc, log) => {
    acc[log.action] = parseInt(log.count, 10);
    return acc;
  }, {});

  res.status(200).json({
    success: true,
    data: summary,
  });
});
