const { body } = require('express-validator');

exports.submitContactValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }).withMessage('Name is too long'),
  body('email').trim().normalizeEmail().isEmail().withMessage('Valid email is required'),
  body('subject').trim().notEmpty().withMessage('Subject is required').isLength({ max: 150 }).withMessage('Subject is too long'),
  body('message').trim().notEmpty().withMessage('Message is required').isLength({ max: 5000 }).withMessage('Message is too long'),
];
