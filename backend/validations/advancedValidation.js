const { body, param, query } = require('express-validator');
const { isValidFileUpload } = require('../utils/securityUtils');

/**
 * File upload validation
 * Validates MIME type and file size
 */
exports.fileUploadValidation = [
  // Express validator doesn't have built-in file validation
  // This will be checked in the controller after multer processes the file
];

/**
 * Custom middleware to validate file uploads
 */
exports.validateFileUpload = (allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'], maxSize = 10 * 1024 * 1024) => {
  return (req, res, next) => {
    if (!req.file) {
      return next(); // File is optional in most cases
    }

    if (!isValidFileUpload(req.file, { allowedMimes, maxSize })) {
      const errors = [];
      if (req.file.size > maxSize) {
        errors.push(`File size exceeds maximum of ${maxSize / 1024 / 1024}MB`);
      }
      if (!allowedMimes.includes(req.file.mimetype)) {
        errors.push(`File type not allowed. Allowed types: ${allowedMimes.join(', ')}`);
      }
      return res.status(400).json({
        error: true,
        message: 'File validation failed',
        details: errors,
      });
    }

    next();
  };
};

/**
 * Coupon/Discount validation
 */
exports.createCouponValidation = [
  body('code')
    .trim()
    .notEmpty().withMessage('Coupon code is required')
    .isLength({ min: 3, max: 50 }).withMessage('Code must be between 3 and 50 characters')
    .matches(/^[A-Z0-9_-]+$/).withMessage('Code must contain only uppercase letters, numbers, hyphens, and underscores'),
  body('discountType')
    .notEmpty().withMessage('Discount type is required')
    .isIn(['percentage', 'fixed']).withMessage('Discount type must be percentage or fixed'),
  body('discountValue')
    .notEmpty().withMessage('Discount value is required')
    .isFloat({ min: 0 }).withMessage('Discount value must be a positive number'),
  body('maxDiscount')
    .optional()
    .isFloat({ min: 0 }).withMessage('Max discount must be a positive number'),
  body('minOrderAmount')
    .optional()
    .isFloat({ min: 0 }).withMessage('Minimum order amount must be a positive number'),
  body('maxUses')
    .optional()
    .isInt({ min: 1 }).withMessage('Max uses must be at least 1'),
  body('maxUsesPerUser')
    .optional()
    .isInt({ min: 1 }).withMessage('Max uses per user must be at least 1'),
  body('expiresAt')
    .notEmpty().withMessage('Expiry date is required')
    .isISO8601().withMessage('Expiry date must be a valid date'),
  body('isActive')
    .optional()
    .isBoolean().withMessage('isActive must be true or false'),
];

exports.updateCouponValidation = [
  ...exports.createCouponValidation,
  param('id').isUUID().withMessage('Invalid coupon ID'),
];

exports.applyCouponValidation = [
  body('code')
    .trim()
    .notEmpty().withMessage('Coupon code is required')
    .isLength({ min: 3, max: 50 }).withMessage('Invalid coupon code format'),
];

/**
 * Inventory validation
 */
exports.createInventoryValidation = [
  body('productId')
    .notEmpty().withMessage('Product ID is required')
    .isUUID().withMessage('Invalid product ID'),
  body('quantity')
    .notEmpty().withMessage('Quantity is required')
    .isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
  body('warehouseLocation')
    .optional()
    .trim()
    .isLength({ max: 255 }).withMessage('Warehouse location is too long'),
  body('sku')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 }).withMessage('SKU must be between 1 and 100 characters'),
];

exports.updateInventoryValidation = [
  ...exports.createInventoryValidation,
  param('id').isUUID().withMessage('Invalid inventory ID'),
];

exports.adjustStockValidation = [
  param('productId').isUUID().withMessage('Invalid product ID'),
  body('quantityChange')
    .notEmpty().withMessage('Quantity change is required')
    .isInt().withMessage('Quantity change must be an integer'),
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Reason is too long'),
];

/**
 * Refund request validation
 */
exports.createRefundValidation = [
  body('orderId')
    .notEmpty().withMessage('Order ID is required')
    .isUUID().withMessage('Invalid order ID'),
  body('reason')
    .trim()
    .notEmpty().withMessage('Refund reason is required')
    .isLength({ min: 10, max: 500 }).withMessage('Reason must be between 10 and 500 characters'),
  body('itemIds')
    .optional()
    .isArray().withMessage('itemIds must be an array')
    .custom((items) => {
      if (items && items.length > 0) {
        return items.every((id) => typeof id === 'string');
      }
      return true;
    }).withMessage('All item IDs must be strings'),
];

exports.updateRefundValidation = [
  param('id').isUUID().withMessage('Invalid refund ID'),
  body('status')
    .optional()
    .isIn(['pending', 'approved', 'rejected', 'completed']).withMessage('Invalid refund status'),
  body('adminNotes')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Admin notes are too long'),
];

/**
 * Audit log query validation
 */
exports.auditLogQueryValidation = [
  query('action')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Action filter is too long'),
  query('userId')
    .optional()
    .isUUID().withMessage('Invalid user ID'),
  query('resourceType')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('Resource type is too long'),
  query('startDate')
    .optional()
    .isISO8601().withMessage('Start date must be a valid date'),
  query('endDate')
    .optional()
    .isISO8601().withMessage('End date must be a valid date'),
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be at least 1'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
];

/**
 * Address validation
 */
exports.addressValidation = [
  body('firstName')
    .trim()
    .notEmpty().withMessage('First name is required')
    .isLength({ min: 1, max: 50 }).withMessage('First name must be between 1 and 50 characters'),
  body('lastName')
    .trim()
    .notEmpty().withMessage('Last name is required')
    .isLength({ min: 1, max: 50 }).withMessage('Last name must be between 1 and 50 characters'),
  body('street')
    .trim()
    .notEmpty().withMessage('Street address is required')
    .isLength({ min: 5, max: 100 }).withMessage('Street address must be between 5 and 100 characters'),
  body('city')
    .trim()
    .notEmpty().withMessage('City is required')
    .isLength({ min: 2, max: 50 }).withMessage('City must be between 2 and 50 characters'),
  body('state')
    .trim()
    .notEmpty().withMessage('State/Province is required')
    .isLength({ min: 2, max: 50 }).withMessage('State must be between 2 and 50 characters'),
  body('postalCode')
    .trim()
    .notEmpty().withMessage('Postal code is required')
    .isLength({ min: 3, max: 20 }).withMessage('Postal code must be between 3 and 20 characters'),
  body('country')
    .trim()
    .notEmpty().withMessage('Country is required')
    .isLength({ min: 2, max: 50 }).withMessage('Country must be between 2 and 50 characters'),
  body('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .isMobilePhone('any').withMessage('Please provide a valid phone number'),
  body('isDefault')
    .optional()
    .isBoolean().withMessage('isDefault must be true or false'),
];
