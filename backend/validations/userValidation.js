const { body } = require('express-validator');

exports.updateUserValidation = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('phone').optional({ nullable: true, checkFalsy: true }).trim().isMobilePhone('any').withMessage('Please provide a valid phone'),
  body('acceptedMarketing').optional().isBoolean().withMessage('acceptedMarketing must be true or false'),
  body('acceptedNewsletter').optional().isBoolean().withMessage('acceptedNewsletter must be true or false'),
];

exports.createAdminValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('phone').optional().isMobilePhone('any').withMessage('Please provide a valid phone'),
];
