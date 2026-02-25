const { body } = require('express-validator');

const SUPPORTED_CHARGE_CURRENCIES = [
  'GBP',
  'CAD',
  'XAF',
  'COP',
  'EGP',
  'EUR',
  'GHS',
  'KES',
  'IRN',
  'NGN',
  'RWF',
  'SLL',
  'ZAR',
  'TZS',
  'UGX',
  'USD',
  'XOF',
  'ZMW',
];

exports.createOrderValidation = [
  body('items').isArray({ min: 1 }).withMessage('Items must be a non-empty array'),
  body('items.*.productId').isUUID().withMessage('Each item must have a valid productId'),
  body('items.*.quantity').isInt({ min: 1, max: 100 }).withMessage('Quantity must be between 1 and 100'),
  body('shippingAddress').isObject().withMessage('Shipping address is required'),
  body('shippingAddress.country').trim().notEmpty().withMessage('Shipping country is required'),
  body('shippingAddress.state').trim().notEmpty().withMessage('Shipping state is required'),
  body('shippingAddress.city').trim().notEmpty().withMessage('Shipping city is required'),
  body('shippingAddress.line1').trim().notEmpty().withMessage('Address line is required'),
  body('shippingAddress.postalCode').optional({ checkFalsy: true }).trim().isLength({ min: 3, max: 15 }).withMessage('Postal code is invalid'),
  body('paymentMethod').trim().isIn(['card', 'ussd', 'transfer']).withMessage('Payment method must be one of: card, ussd, transfer'),
  body('currency').optional({ checkFalsy: true }).trim().toUpperCase().isIn(SUPPORTED_CHARGE_CURRENCIES).withMessage(`Currency must be one of: ${SUPPORTED_CHARGE_CURRENCIES.join(', ')}`),
];
