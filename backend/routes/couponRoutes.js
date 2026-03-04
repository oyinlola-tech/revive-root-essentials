const express = require('express');
const couponController = require('../controllers/couponController');
const { authenticate, requireAdmin } = require('../middlewares/authMiddlewareEnhanced');
const { couponValidation } = require('../validations/advancedValidation');

const router = express.Router();

/**
 * Customer Routes
 */

// Get all active coupons
router.get(
  '/',
  couponController.getActiveCoupons,
);

// Apply coupon code
router.post(
  '/apply',
  couponValidation.applyCoupon,
  couponController.applyCoupon,
);

// Validate coupon code
router.post(
  '/validate',
  couponValidation.validateCoupon,
  couponController.validateCoupon,
);

/**
 * Admin Routes
 */

// Get coupon statistics
router.get(
  '/admin/stats',
  authenticate,
  requireAdmin,
  couponController.getCouponStats,
);

// Get all coupons
router.get(
  '/admin/all',
  authenticate,
  requireAdmin,
  couponController.getAllCoupons,
);

// Create coupon
router.post(
  '/admin',
  authenticate,
  requireAdmin,
  couponValidation.createCoupon,
  couponController.createCoupon,
);

// Get single coupon
router.get(
  '/admin/:id',
  authenticate,
  requireAdmin,
  couponController.getCoupon,
);

// Update coupon
router.put(
  '/admin/:id',
  authenticate,
  requireAdmin,
  couponValidation.updateCoupon,
  couponController.updateCoupon,
);

// Delete coupon
router.delete(
  '/admin/:id',
  authenticate,
  requireAdmin,
  couponController.deleteCoupon,
);

module.exports = router;
