const { body } = require('express-validator');

exports.registerValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('acceptedTerms')
    .custom((value) => value === true || value === 'true')
    .withMessage('You must accept the Terms and Conditions to create an account'),
  body('acceptedMarketing')
    .optional()
    .isBoolean()
    .withMessage('acceptedMarketing must be true or false'),
  body('acceptedNewsletter')
    .optional()
    .isBoolean()
    .withMessage('acceptedNewsletter must be true or false'),
];

exports.loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

exports.sendOtpValidation = [
  body('type').isIn(['email', 'phone']).withMessage('Type must be email or phone'),
  body('identifier').custom((value, { req }) => {
    if (req.body.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value || '')) {
      throw new Error('Please provide a valid email');
    }
    if (req.body.type === 'phone' && !/^\+?[1-9]\d{7,14}$/.test(value || '')) {
      throw new Error('Please provide a valid phone number in international format');
    }
    return true;
  }),
];

exports.verifyOtpValidation = [
  body('identifier').notEmpty().withMessage('Identifier is required'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
];
