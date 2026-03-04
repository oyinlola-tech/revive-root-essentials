const { Coupon } = require('../models');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const couponService = require('../services/couponService');
const { couponValidation } = require('../validations/advancedValidation');
const { validationResult } = require('express-validator');
const Logger = require('../utils/Logger');

const logger = new Logger('CouponController');

/**
 * Get all active coupons (customer view)
 * GET /api/coupons
 */
exports.getActiveCoupons = catchAsync(async (req, res, next) => {
  const coupons = await couponService.getActiveCoupons();

  res.status(200).json({
    success: true,
    data: coupons,
  });
});

/**
 * Validate and apply coupon to order
 * POST /api/coupons/apply
 */
exports.applyCoupon = catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError(errors.array()[0].msg, 400));
  }

  const { code, orderTotal } = req.body;
  const userId = req.user ? req.user.id : null;

  const result = await couponService.applyCoupon(code, orderTotal, userId);

  res.status(200).json({
    success: true,
    message: 'Coupon applied successfully',
    data: result,
  });
});

/**
 * Validate coupon code
 * POST /api/coupons/validate
 */
exports.validateCoupon = catchAsync(async (req, res, next) => {
  const { code } = req.body;

  if (!code) {
    return next(new AppError('Coupon code is required', 400));
  }

  const coupon = await couponService.validateCoupon(code);

  res.status(200).json({
    success: true,
    message: 'Coupon is valid',
    data: coupon,
  });
});

/**
 * ADMIN: Create new coupon
 * POST /api/admin/coupons
 */
exports.createCoupon = catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError(errors.array()[0].msg, 400));
  }

  const {
    code,
    discountType,
    discountValue,
    maxUses,
    maxUsesPerUser,
    minOrderAmount,
    expiresAt,
    description,
  } = req.body;

  const userId = req.user.id;

  const coupon = await Coupon.create({
    code: code.toUpperCase(),
    discountType,
    discountValue,
    maxUses,
    maxUsesPerUser,
    minOrderAmount,
    expiresAt,
    description,
    isActive: true,
    createdBy: userId,
  });

  logger.info(`Coupon created: ${coupon.code} by admin ${userId}`);

  res.status(201).json({
    success: true,
    message: 'Coupon created successfully',
    data: coupon,
  });
});

/**
 * ADMIN: Get all coupons (admin view)
 * GET /api/admin/coupons
 */
exports.getAllCoupons = catchAsync(async (req, res, next) => {
  const {
    limit = 20,
    offset = 0,
    isActive = null,
    status = null,
  } = req.query;

  const where = {};
  if (isActive !== null) {
    where.isActive = isActive === 'true';
  }

  const { count, rows } = await Coupon.findAndCountAll({
    where,
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
 * ADMIN: Get coupon by ID
 * GET /api/admin/coupons/:id
 */
exports.getCoupon = catchAsync(async (req, res, next) => {
  const coupon = await Coupon.findByPk(req.params.id);

  if (!coupon) {
    return next(new AppError('Coupon not found', 404));
  }

  res.status(200).json({
    success: true,
    data: coupon,
  });
});

/**
 * ADMIN: Update coupon
 * PUT /api/admin/coupons/:id
 */
exports.updateCoupon = catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError(errors.array()[0].msg, 400));
  }

  const coupon = await Coupon.findByPk(req.params.id);

  if (!coupon) {
    return next(new AppError('Coupon not found', 404));
  }

  const {
    code,
    discountType,
    discountValue,
    maxUses,
    maxUsesPerUser,
    minOrderAmount,
    expiresAt,
    description,
    isActive,
  } = req.body;

  if (code) coupon.code = code.toUpperCase();
  if (discountType) coupon.discountType = discountType;
  if (discountValue !== undefined) coupon.discountValue = discountValue;
  if (maxUses !== undefined) coupon.maxUses = maxUses;
  if (maxUsesPerUser !== undefined) coupon.maxUsesPerUser = maxUsesPerUser;
  if (minOrderAmount !== undefined) coupon.minOrderAmount = minOrderAmount;
  if (expiresAt) coupon.expiresAt = expiresAt;
  if (description) coupon.description = description;
  if (isActive !== undefined) coupon.isActive = isActive;

  await coupon.save();

  logger.info(`Coupon updated: ${coupon.code} by admin ${req.user.id}`);

  res.status(200).json({
    success: true,
    message: 'Coupon updated successfully',
    data: coupon,
  });
});

/**
 * ADMIN: Delete coupon
 * DELETE /api/admin/coupons/:id
 */
exports.deleteCoupon = catchAsync(async (req, res, next) => {
  const coupon = await Coupon.findByPk(req.params.id);

  if (!coupon) {
    return next(new AppError('Coupon not found', 404));
  }

  await coupon.destroy();

  logger.info(`Coupon deleted: ${coupon.code} by admin ${req.user.id}`);

  res.status(200).json({
    success: true,
    message: 'Coupon deleted successfully',
  });
});

/**
 * ADMIN: Get coupon statistics
 * GET /api/admin/coupons/stats
 */
exports.getCouponStats = catchAsync(async (req, res, next) => {
  const totalCoupons = await Coupon.count();
  const activeCoupons = await Coupon.count({ where: { isActive: true } });
  const expiredCoupons = await Coupon.count({
    where: {
      expiresAt: { $lt: new Date() },
    },
  });

  res.status(200).json({
    success: true,
    data: {
      totalCoupons,
      activeCoupons,
      expiredCoupons,
      inactiveCoupons: totalCoupons - activeCoupons - expiredCoupons,
    },
  });
});
