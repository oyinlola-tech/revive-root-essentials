const { body } = require('express-validator');

exports.registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }).withMessage('Name is too long'),
  body('email').trim().normalizeEmail().isEmail().withMessage('Please provide a valid email'),
  body('phone').optional({ checkFalsy: true }).trim().isMobilePhone('any').withMessage('Please provide a valid phone number'),
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
  body('email').trim().normalizeEmail().isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

exports.sendOtpValidation = [
  body('type').optional().isIn(['email', 'phone']).withMessage('Type must be email or phone'),
  body('challengeToken').optional().isString().isLength({ min: 20, max: 2000 }).withMessage('Invalid challenge token'),
  body('identifier').custom((value, { req }) => {
    const type = req.body.type || 'email';
    if (type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim())) {
      throw new Error('Please provide a valid email');
    }
    if (type === 'phone' && !/^\+?[1-9]\d{7,14}$/.test(String(value || '').trim())) {
      throw new Error('Please provide a valid phone number in international format');
    }
    return true;
  }),
];

exports.verifyOtpValidation = [
  body('identifier').trim().notEmpty().withMessage('Identifier is required'),
  body('challengeToken').optional().isString().isLength({ min: 20, max: 2000 }).withMessage('Invalid challenge token'),
  body('otp').trim().isNumeric().isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
];

exports.verifyEmailValidation = [
  body('token').trim().isString().isLength({ min: 20, max: 4000 }).withMessage('Verification token is required'),
];

exports.changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
];

exports.resetPasswordConfirmValidation = [
  body('email').trim().normalizeEmail().isEmail().withMessage('Please provide a valid email'),
  body('otp').trim().isNumeric().isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
];

exports.resetPasswordValidation = [
  body('email').trim().normalizeEmail().isEmail().withMessage('Please provide a valid email'),
];
