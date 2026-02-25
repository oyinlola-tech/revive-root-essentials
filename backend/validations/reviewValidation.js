const { body, param } = require('express-validator');

exports.productParamValidation = [
  param('productId').isUUID().withMessage('Invalid product id'),
];

exports.createReviewValidation = [
  body('productId').isUUID().withMessage('Valid productId is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional({ nullable: true }).trim().isLength({ max: 2000 }).withMessage('Comment is too long'),
];

exports.updateReviewValidation = [
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional({ nullable: true }).trim().isLength({ max: 2000 }).withMessage('Comment is too long'),
];
