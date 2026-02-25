const { body, param } = require('express-validator');

exports.addToCartValidation = [
  body('productId').isUUID().withMessage('A valid productId is required'),
  body('quantity').optional().isInt({ min: 1, max: 100 }).withMessage('Quantity must be between 1 and 100'),
];

exports.updateCartItemValidation = [
  param('itemId').isUUID().withMessage('Invalid cart item id'),
  body('quantity').isInt({ min: 1, max: 100 }).withMessage('Quantity must be between 1 and 100'),
];

exports.cartItemParamValidation = [
  param('itemId').isUUID().withMessage('Invalid cart item id'),
];
