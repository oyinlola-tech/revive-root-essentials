const { AuditLog, User } = require('../models');
const { Op, Sequelize } = require('sequelize');
const Logger = require('../utils/Logger');

const logger = new Logger('AuditService');

class AuditService {
  /**
   * Log an action
   */
  async log(userId, action, resourceType, resourceId = null, options = {}) {
    try {
      const {
        changes = null,
        ipAddress = null,
        userAgent = null,
        status = 'success',
        statusCode = null,
        errorMessage = null,
        metadata = null,
      } = options;

      const log = await AuditLog.create({
        userId,
        action,
        resourceType,
        resourceId,
        changes,
        ipAddress,
        userAgent,
        status,
        statusCode,
        errorMessage,
        metadata,
      });

      logger.debug(`Audit log created: ${action}/${resourceType}`, {
        resourceId,
        userId,
      });

      return log;
    } catch (error) {
      logger.error('Failed to create audit log', error, {
        action,
        resourceType,
        userId,
      });
      // Don't throw - audit logging should not break the application
      return null;
    }
  }

  /**
   * Log from request/response context
   */
  async logRequest(req, action, resourceType, resourceId = null, options = {}) {
    return this.log(req.user?.id || null, action, resourceType, resourceId, {
      ...options,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }

  /**
   * Get audit logs
   */
  async getLogs(filters = {}) {
    try {
      const {
        action = null,
        userId = null,
        resourceType = null,
        orderNumber = null,
        startDate = null,
        endDate = null,
        limit = 50,
        offset = 0,
      } = filters;

      const where = {};
      if (action) where.action = action;
      if (userId) where.userId = userId;
      if (resourceType) where.resourceType = resourceType;
      if (orderNumber) {
        const orderNumberTerm = String(orderNumber).trim();
        if (orderNumberTerm) {
          where[Op.or] = [
            { resourceId: { [Op.like]: `%${orderNumberTerm}%` } },
            Sequelize.where(
              Sequelize.json('metadata.orderNumber'),
              { [Op.like]: `%${orderNumberTerm}%` }
            ),
          ];
        }
      }

      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt[Op.gte] = startDate;
        if (endDate) where.createdAt[Op.lte] = endDate;
      }

      const { rows, count } = await AuditLog.findAndCountAll({
        where,
        include: [{ model: User, attributes: ['id', 'name', 'email'] }],
        order: [['createdAt', 'DESC']],
        limit: Math.min(limit, 100),
        offset,
      });

      return {
        logs: rows,
        total: count,
        page: Math.floor(offset / limit) + 1,
        limit,
      };
    } catch (error) {
      logger.error('Failed to get audit logs', error, { filters });
      throw error;
    }
  }

  /**
   * Get logs for a specific resource
   */
  async getResourceLogs(resourceType, resourceId) {
    try {
      const logs = await AuditLog.findAll({
        where: { resourceType, resourceId },
        include: [{ model: User, attributes: ['id', 'name', 'email'] }],
        order: [['createdAt', 'DESC']],
      });

      return logs;
    } catch (error) {
      logger.error('Failed to get resource logs', error, { resourceType, resourceId });
      throw error;
    }
  }

  /**
   * Get logs for a specific user
   */
  async getUserLogs(userId, limit = 50) {
    try {
      const logs = await AuditLog.findAll({
        where: { userId },
        order: [['createdAt', 'DESC']],
        limit,
      });

      return logs;
    } catch (error) {
      logger.error('Failed to get user logs', error, { userId });
      throw error;
    }
  }

  /**
   * Get recent actions
   */
  async getRecentActions(limit = 100) {
    try {
      const logs = await AuditLog.findAll({
        include: [{ model: User, attributes: ['id', 'name', 'email'] }],
        order: [['createdAt', 'DESC']],
        limit: Math.min(limit, 200),
      });

      return logs;
    } catch (error) {
      logger.error('Failed to get recent actions', error);
      throw error;
    }
  }

  /**
   * Log model changes (for update operations)
   */
  buildChangesObject(oldData, newData) {
    const changes = {};
    const oldObj = oldData.toJSON ? oldData.toJSON() : oldData;
    const newObj = newData.toJSON ? newData.toJSON() : newData;

    Object.keys(newObj).forEach((key) => {
      if (oldObj[key] !== newObj[key]) {
        changes[key] = {
          before: oldObj[key],
          after: newObj[key],
        };
      }
    });

    return Object.keys(changes).length > 0 ? changes : null;
  }
}

module.exports = new AuditService();
