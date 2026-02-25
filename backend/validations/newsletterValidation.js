const { body, query } = require('express-validator');

exports.subscribeValidation = [
  body('email').trim().normalizeEmail().isEmail().withMessage('Please provide a valid email address'),
];

exports.unsubscribeValidation = [
  query('token').trim().notEmpty().withMessage('Unsubscribe token is required'),
];
