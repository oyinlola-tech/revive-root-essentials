const {
  User, Product, Order, OrderItem, Coupon, RefundRequest, AuditLog, sequelize,
} = require('../models');
const { Op } = require('sequelize');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const analyticsService = require('../services/analyticsService');
const auditService = require('../services/auditService');
const Logger = require('../utils/Logger');
const notificationService = require('../services/notificationService');

const logger = new Logger('AdminController');

const VALID_ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const VALID_USER_ROLES = ['user', 'admin', 'superadmin'];
const VALID_ADMIN_USER_STATUSES = ['active', 'inactive'];
const countSuperadmins = () => User.count({ where: { role: 'superadmin' } });

const applyDateRange = (where, startDate, endDate) => {
  if (!startDate && !endDate) return where;

  where.createdAt = {};
  if (startDate) {
    where.createdAt[Op.gte] = new Date(startDate);
  }
  if (endDate) {
    where.createdAt[Op.lte] = new Date(endDate);
  }

  return where;
};

const toAdminUserPayload = (user) => ({
  ...user.toJSON(),
  status: user.isVerified ? 'active' : 'inactive',
  isEmailVerified: Boolean(user.isVerified),
});

/**
 * ADMIN: Get dashboard statistics
 * GET /api/admin/dashboard
 */
exports.getDashboard = catchAsync(async (req, res, next) => {
  const [
    totalUsers,
    totalProducts,
    totalOrders,
    totalRevenue,
    pendingOrders,
    pendingRefunds,
    totalCoupons,
    recentOrders,
  ] = await Promise.all([
    User.count(),
    Product.count(),
    Order.count(),
    Order.sum('totalAmount', { where: { paymentStatus: 'paid' } }),
    Order.count({ where: { status: 'pending' } }),
    RefundRequest.count({ where: { status: 'pending' } }),
    Coupon.count({ where: { isActive: true } }),
    Order.findAll({
      limit: 10,
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'orderNumber', 'totalAmount', 'status', 'createdAt'],
    }),
  ]);

  res.status(200).json({
    success: true,
    data: {
      statistics: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue: totalRevenue || 0,
        pendingOrders,
        pendingRefunds,
        totalCoupons,
      },
      recentOrders,
    },
  });
});

/**
 * ADMIN: Get detailed analytics
 * GET /api/admin/analytics
 */
exports.getAnalytics = catchAsync(async (req, res, next) => {
  const {
    startDate = null,
    endDate = null,
    period = 'week',
  } = req.query;

  const where = applyDateRange({}, startDate, endDate);

  const [
    orderStats,
    productStats,
    userStats,
    paymentStats,
  ] = await Promise.all([
    Order.findAll({
      where,
      attributes: [
        [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('totalAmount')), 'revenue'],
      ],
      group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
      raw: true,
      order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'DESC']],
    }),
    Product.findAll({
      attributes: ['id', 'name', 'price'],
      include: [
        {
          model: OrderItem,
          attributes: [],
          required: true,
        },
      ],
      attributes: [
        'id',
        'name',
        'price',
        [sequelize.fn('COUNT', sequelize.col('OrderItems.id')), 'sold'],
      ],
      group: ['Product.id'],
      raw: true,
      subQuery: false,
      order: [[sequelize.literal('sold'), 'DESC']],
      limit: 10,
    }),
    User.findAll({
      where,
      attributes: [
        [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
      raw: true,
      order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'DESC']],
    }),
    Order.findAll({
      where,
      attributes: [
        'paymentStatus',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      group: ['paymentStatus'],
      raw: true,
    }),
  ]);

  res.status(200).json({
    success: true,
    data: {
      orderStats,
      topProducts: productStats,
      userStats,
      paymentStats,
    },
  });
});

/**
 * ADMIN: Get all users
 * GET /api/admin/users
 */
exports.getAllUsers = catchAsync(async (req, res, next) => {
  const { limit = 20, offset = 0, role = null, status = null } = req.query;

  const where = {};
  if (role) where.role = role;
  if (status) {
    if (!VALID_ADMIN_USER_STATUSES.includes(status)) {
      return next(new AppError('Invalid user status filter', 400));
    }
    where.isVerified = status === 'active';
  }

  const { count, rows } = await User.findAndCountAll({
    where,
    attributes: { exclude: ['passwordHash'] },
    limit: parseInt(limit, 10),
    offset: parseInt(offset, 10),
    order: [['createdAt', 'DESC']],
  });

  res.status(200).json({
    success: true,
    data: rows.map(toAdminUserPayload),
    pagination: {
      total: count,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
      pages: Math.ceil(count / parseInt(limit, 10)),
    },
  });
});

/**
 * ADMIN: Get user details
 * GET /api/admin/users/:id
 */
exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findByPk(req.params.id, {
    attributes: { exclude: ['passwordHash'] },
    include: [
      {
        model: Order,
        attributes: ['id', 'orderNumber', 'totalAmount', 'status'],
      },
    ],
  });

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    success: true,
    data: toAdminUserPayload(user),
  });
});

/**
 * ADMIN: Update user role/status
 * PATCH /api/admin/users/:id
 */
exports.updateUser = catchAsync(async (req, res, next) => {
  const user = await User.findByPk(req.params.id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  const { role, status, isEmailVerified } = req.body;

  if (role && !VALID_USER_ROLES.includes(role)) {
    return next(new AppError('Invalid role', 400));
  }
  if (status && !VALID_ADMIN_USER_STATUSES.includes(status)) {
    return next(new AppError('Invalid status', 400));
  }
  if (user.id === req.user.id && role && role !== req.user.role) {
    return next(new AppError('You cannot change your own admin role.', 400));
  }
  if (req.user.role !== 'superadmin' && user.role !== 'user') {
    return next(new AppError('Only superadmins can modify admin accounts.', 403));
  }
  if (req.user.role !== 'superadmin' && role && role !== user.role) {
    return next(new AppError('Only superadmins can change user roles.', 403));
  }
  if (req.user.role !== 'superadmin' && typeof isEmailVerified === 'boolean') {
    return next(new AppError('Only superadmins can change account verification state.', 403));
  }
  if (user.role === 'superadmin') {
    const nextRole = role || user.role;
    const nextVerifiedState = typeof isEmailVerified === 'boolean'
      ? isEmailVerified
      : status
        ? status === 'active'
        : user.isVerified;

    if ((nextRole !== 'superadmin' || !nextVerifiedState) && user.id === req.user.id) {
      return next(new AppError('You cannot reduce your own superadmin access.', 400));
    }

    if (nextRole !== 'superadmin' || !nextVerifiedState) {
      const superadminCount = await countSuperadmins();
      if (superadminCount <= 1) {
        return next(new AppError('You cannot weaken the last superadmin account.', 400));
      }
    }
  }

  const oldData = {
    role: user.role,
    status: user.isVerified ? 'active' : 'inactive',
    isEmailVerified: Boolean(user.isVerified),
  };

  if (role) user.role = role;
  if (status) user.isVerified = status === 'active';
  if (typeof isEmailVerified === 'boolean') user.isVerified = isEmailVerified;

  await user.save();

  await auditService.log(req.user.id, 'UPDATE_USER', 'User', user.id, {
    oldData,
    newData: {
      role: user.role,
      status: user.isVerified ? 'active' : 'inactive',
      isEmailVerified: Boolean(user.isVerified),
    },
  });

  res.status(200).json({
    success: true,
    message: 'User updated successfully',
    data: toAdminUserPayload(user),
  });
});

/**
 * ADMIN: Get all orders
 * GET /api/admin/orders
 */
exports.getAllOrders = catchAsync(async (req, res, next) => {
  const { limit = 20, offset = 0, status = null, paymentStatus = null } = req.query;

  const where = {};
  if (status) where.status = status;
  if (paymentStatus) where.paymentStatus = paymentStatus;

  const { count, rows } = await Order.findAndCountAll({
    where,
    include: [
      {
        model: User,
        attributes: ['id', 'email', 'name'],
      },
      {
        model: OrderItem,
        include: [
          {
            model: Product,
            attributes: ['id', 'name', 'price'],
          },
        ],
      },
    ],
    limit: parseInt(limit, 10),
    offset: parseInt(offset, 10),
    order: [['createdAt', 'DESC']],
  });

  res.status(200).json({
    success: true,
    data: rows,
    pagination: {
      total: count,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
      pages: Math.ceil(count / parseInt(limit, 10)),
    },
  });
});

/**
 * ADMIN: Update order status
 * PATCH /api/admin/orders/:id/status
 */
exports.updateOrderStatus = catchAsync(async (req, res, next) => {
  const { status } = req.body;

  if (!status || !VALID_ORDER_STATUSES.includes(status)) {
    return next(new AppError('Invalid order status', 400));
  }

  const order = await Order.findByPk(req.params.id);

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  if (['shipped', 'delivered'].includes(status) && order.paymentStatus !== 'paid') {
    return next(new AppError('Cannot set shipped/delivered status before payment confirmation', 400));
  }

  const allowedTransitions = {
    pending: ['processing', 'cancelled'],
    processing: ['shipped', 'cancelled'],
    shipped: ['delivered'],
    delivered: [],
    cancelled: [],
  };

  if (status !== order.status && !allowedTransitions[order.status]?.includes(status)) {
    return next(new AppError(`Cannot change order status from ${order.status} to ${status}`, 400));
  }

  const oldStatus = order.status;
  order.status = status;
  await order.save();

  await auditService.log(req.user.id, 'UPDATE_ORDER_STATUS', 'Order', order.id, {
    oldStatus,
    newStatus: status,
  });

  const user = order.userId ? await User.findByPk(order.userId) : null;
  if (user?.email) {
    const defaultNotes = {
      pending: 'Your order is pending review and confirmation.',
      processing: 'Your order is now being processed by our team.',
      shipped: 'Your order is out for delivery and on the way.',
      delivered: 'Your order has been delivered.',
      cancelled: 'Your order has been cancelled. If a refund applies, you will get a separate refund update by email.',
    };
    notificationService.sendOrderStatusEmail(user, order, req.body.note || defaultNotes[status]).catch(() => {});
  }

  res.status(200).json({
    success: true,
    message: 'Order status updated successfully',
    data: order,
  });
});

/**
 * ADMIN: Get statistics summary
 * GET /api/admin/stats
 */
exports.getStats = catchAsync(async (req, res, next) => {
  const [
    userCount,
    productCount,
    orderCount,
    refundCount,
    couponCount,
    auditLogCount,
  ] = await Promise.all([
    User.count(),
    Product.count(),
    Order.count(),
    RefundRequest.count(),
    Coupon.count(),
    AuditLog.count(),
  ]);

  const revenue = await Order.sum('totalAmount', { where: { paymentStatus: 'paid' } });

  res.status(200).json({
    success: true,
    data: {
      users: userCount,
      products: productCount,
      orders: orderCount,
      refunds: refundCount,
      coupons: couponCount,
      auditLogs: auditLogCount,
      revenue: revenue || 0,
    },
  });
});

/**
 * ADMIN: Bulk update products
 * POST /api/admin/products/bulk-update
 */
exports.bulkUpdateProducts = catchAsync(async (req, res, next) => {
  const { productIds, updates } = req.body;

  if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
    return next(new AppError('ProductIds array is required', 400));
  }

  const result = await Product.update(updates, {
    where: { id: productIds },
  });

  await auditService.log(req.user.id, 'BULK_UPDATE_PRODUCTS', 'Product', productIds.join(','), {
    count: productIds.length,
    updates,
  });

  logger.info(`Bulk updated ${productIds.length} products`);

  res.status(200).json({
    success: true,
    message: `Updated ${result[0]} products`,
  });
});

/**
 * ADMIN: Bulk delete products
 * POST /api/admin/products/bulk-delete
 */
exports.bulkDeleteProducts = catchAsync(async (req, res, next) => {
  const { productIds } = req.body;

  if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
    return next(new AppError('ProductIds array is required', 400));
  }

  const result = await Product.destroy({
    where: { id: productIds },
  });

  await auditService.log(req.user.id, 'BULK_DELETE_PRODUCTS', 'Product', productIds.join(','), {
    count: productIds.length,
  });

  logger.info(`Bulk deleted ${productIds.length} products`);

  res.status(200).json({
    success: true,
    message: `Deleted ${result} products`,
  });
});
