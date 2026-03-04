const {
  User, Product, Order, OrderItem, Coupon, RefundRequest, AuditLog,
} = require('../models');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const analyticsService = require('../services/analyticsService');
const auditService = require('../services/auditService');
const Logger = require('../utils/Logger');

const logger = new Logger('AdminController');

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

  const where = {};
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) {
      where.createdAt.$gte = new Date(startDate);
    }
    if (endDate) {
      where.createdAt.$lte = new Date(endDate);
    }
  }

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
  if (status) where.status = status;

  const { count, rows } = await User.findAndCountAll({
    where,
    attributes: { exclude: ['password'] },
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
 * ADMIN: Get user details
 * GET /api/admin/users/:id
 */
exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findByPk(req.params.id, {
    attributes: { exclude: ['password'] },
    include: [
      {
        model: Order,
        as: 'orders',
        attributes: ['id', 'orderNumber', 'totalAmount', 'status'],
      },
    ],
  });

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    success: true,
    data: user,
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

  const oldData = { role: user.role, status: user.status, isEmailVerified: user.isEmailVerified };

  if (role) user.role = role;
  if (status) user.status = status;
  if (isEmailVerified !== undefined) user.isEmailVerified = isEmailVerified;

  await user.save();

  await auditService.log(req.user.id, 'UPDATE_USER', 'User', user.id, {
    oldData,
    newData: { role: user.role, status: user.status, isEmailVerified: user.isEmailVerified },
  });

  res.status(200).json({
    success: true,
    message: 'User updated successfully',
    data: user,
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
        attributes: ['id', 'email', 'firstName', 'lastName'],
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

  if (!status) {
    return next(new AppError('Status is required', 400));
  }

  const order = await Order.findByPk(req.params.id);

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  const oldStatus = order.status;
  order.status = status;
  await order.save();

  await auditService.log(req.user.id, 'UPDATE_ORDER_STATUS', 'Order', order.id, {
    oldStatus,
    newStatus: status,
  });

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
