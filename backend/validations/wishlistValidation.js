const { body, param } = require('express-validator');

exports.addWishlistValidation = [
  body('productId').isUUID().withMessage('A valid productId is required'),
];

exports.removeWishlistValidation = [
  param('productId').isUUID().withMessage('Invalid product id'),
];
