const { body } = require('express-validator');

exports.createOrderValidation = [
  body('items').isArray({ min: 1 }).withMessage('Items must be a non-empty array'),
  body('items.*.productId').isUUID().withMessage('Each item must have a valid productId'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('shippingAddress').isObject().withMessage('Shipping address is required'),
  body('paymentMethod').notEmpty().withMessage('Payment method is required'),
];