const { body } = require('express-validator');

exports.updateUserValidation = [
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('phone').optional().isMobilePhone('any').withMessage('Please provide a valid phone'),
];