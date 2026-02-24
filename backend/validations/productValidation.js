const { body } = require('express-validator');

exports.createProductValidation = [
  body('name').notEmpty().withMessage('Product name is required'),
  body('price').isNumeric().withMessage('Price must be a number').custom(val => val > 0),
  body('categoryId').optional().isUUID().withMessage('Invalid category ID'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
];
