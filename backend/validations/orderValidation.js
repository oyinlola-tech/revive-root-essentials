const { body, param } = require('express-validator');

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
  body('shippingAddress.state')
    .optional({ checkFalsy: true })
    .trim()
    .custom((value, { req }) => {
      const country = String(req.body?.shippingAddress?.country || '').trim().toLowerCase();
      if (country === 'nigeria' && !String(value || '').trim()) {
        throw new Error('Shipping state is required for Nigeria');
      }
      return true;
    }),
  body('shippingAddress.city')
    .optional({ checkFalsy: true })
    .trim()
    .custom((value, { req }) => {
      const country = String(req.body?.shippingAddress?.country || '').trim().toLowerCase();
      if (country === 'nigeria' && !String(value || '').trim()) {
        throw new Error('Shipping city is required for Nigeria');
      }
      return true;
    }),
  body('shippingAddress.line1').trim().notEmpty().withMessage('Address line is required'),
  body('shippingAddress.postalCode').optional({ checkFalsy: true }).trim().isLength({ min: 3, max: 15 }).withMessage('Postal code is invalid'),
  body('note').optional({ checkFalsy: true }).trim().isLength({ max: 1000 }).withMessage('Order note is too long'),
  body('paymentMethod').trim().isIn(['card', 'ussd', 'transfer']).withMessage('Payment method must be one of: card, ussd, transfer'),
  body('currency').optional({ checkFalsy: true }).trim().toUpperCase().isIn(SUPPORTED_CHARGE_CURRENCIES).withMessage(`Currency must be one of: ${SUPPORTED_CHARGE_CURRENCIES.join(', ')}`),
];

exports.orderIdParamValidation = [
  param('id').isUUID().withMessage('Order ID must be a valid UUID'),
];

exports.retryPaymentValidation = [
  ...exports.orderIdParamValidation,
];

exports.verifyPaymentValidation = [
  ...exports.orderIdParamValidation,
  body('transactionId').optional({ checkFalsy: true }).isInt({ min: 1 }).withMessage('transactionId must be a positive integer'),
  body('transaction_id').optional({ checkFalsy: true }).isInt({ min: 1 }).withMessage('transaction_id must be a positive integer'),
  body('reference').optional({ checkFalsy: true }).trim().isLength({ min: 5, max: 100 }).withMessage('reference must be between 5 and 100 characters'),
];

exports.updateOrderStatusValidation = [
  ...exports.orderIdParamValidation,
  body('status').isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled']).withMessage('Invalid order status'),
  body('note').optional({ checkFalsy: true }).trim().isLength({ max: 1000 }).withMessage('Note is too long'),
];

exports.refundOrderValidation = [
  ...exports.orderIdParamValidation,
  body('reason').optional({ checkFalsy: true }).trim().isLength({ max: 1000 }).withMessage('Reason is too long'),
];
