const { body } = require('express-validator');

exports.registerValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
];

exports.loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

exports.sendOtpValidation = [
  body('identifier').isEmail().withMessage('Please provide a valid email'),
];

exports.verifyOtpValidation = [
  body('identifier').notEmpty().withMessage('Identifier is required'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
];
