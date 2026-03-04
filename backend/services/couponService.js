const { Coupon } = require('../models');
const { Op } = require('sequelize');
const AppError = require('../utils/AppError');
const Logger = require('../utils/Logger');

const logger = new Logger('CouponService');

class CouponService {
  /**
   * Apply a coupon to an order
   */
  async applyCoupon(code, orderTotal, userId) {
    try {
      const coupon = await Coupon.findOne({
        where: {
          code: String(code || '').toUpperCase(),
          isActive: true,
          expiresAt: { [Op.gt]: new Date() },
        },
      });

      if (!coupon) {
        throw new AppError('Invalid or expired coupon', 400);
      }

      // Check if coupon has exceeded max uses
      if (coupon.maxUses && coupon.currentUses >= coupon.maxUses) {
        throw new AppError('This coupon has exceeded its maximum uses', 400);
      }

      // Check minimum order amount
      if (coupon.minOrderAmount && orderTotal < coupon.minOrderAmount) {
        throw new AppError(
          `Minimum order amount of ${coupon.minOrderAmount} required for this coupon`,
          400
        );
      }

      // Calculate discount
      let discountAmount = 0;
      if (coupon.discountType === 'percentage') {
        discountAmount = (orderTotal * coupon.discountValue) / 100;
        if (coupon.maxDiscount) {
          discountAmount = Math.min(discountAmount, coupon.maxDiscount);
        }
      } else {
        // Fixed discount
        discountAmount = coupon.discountValue;
      }

      discountAmount = Math.min(discountAmount, orderTotal);

      return {
        couponId: coupon.id,
        code: coupon.code,
        discountAmount: Math.round(discountAmount * 100) / 100,
        originalAmount: orderTotal,
        finalAmount: Math.round((orderTotal - discountAmount) * 100) / 100,
      };
    } catch (error) {
      logger.error('Failed to apply coupon', error, { code, orderTotal });
      throw error;
    }
  }

  /**
   * Validate coupon before using
   */
  async validateCoupon(code) {
    try {
      const coupon = await Coupon.findOne({
        where: {
          code: String(code || '').toUpperCase(),
          isActive: true,
          expiresAt: { [Op.gt]: new Date() },
        },
      });

      if (!coupon) {
        return { valid: false, reason: 'Coupon not found or expired' };
      }

      if (coupon.maxUses && coupon.currentUses >= coupon.maxUses) {
        return { valid: false, reason: 'Coupon has reached maximum uses' };
      }

      return {
        valid: true,
        coupon: {
          id: coupon.id,
          code: coupon.code,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          minOrderAmount: coupon.minOrderAmount,
        },
      };
    } catch (error) {
      logger.error('Failed to validate coupon', error, { code });
      return { valid: false, reason: 'Validation error' };
    }
  }

  /**
   * Increment coupon usage after successful order
   */
  async useCoupon(couponId) {
    try {
      const coupon = await Coupon.findByPk(couponId);
      if (!coupon) {
        throw new AppError('Coupon not found', 404);
      }

      coupon.currentUses = (coupon.currentUses || 0) + 1;
      await coupon.save();

      logger.info(`Coupon ${coupon.code} used. Total uses: ${coupon.currentUses}`);
      return coupon;
    } catch (error) {
      logger.error('Failed to use coupon', error, { couponId });
      throw error;
    }
  }

  /**
   * Get all active coupons (for customer view)
   */
  async getActiveCoupons() {
    try {
      const coupons = await Coupon.findAll({
        where: {
          isActive: true,
          expiresAt: { [Op.gt]: new Date() },
        },
        attributes: ['code', 'discountType', 'discountValue', 'minOrderAmount', 'description'],
        order: [['discountValue', 'DESC']],
      });

      return coupons;
    } catch (error) {
      logger.error('Failed to get active coupons', error);
      throw error;
    }
  }
}

module.exports = new CouponService();
