const { body } = require('express-validator');

exports.createProductValidation = [
  body('name').notEmpty().withMessage('Product name is required'),
  body('price').isNumeric().withMessage('Price must be a number').custom(val => val > 0),
  body('imageUrl').notEmpty().withMessage('Product image is required for SEO optimization'),
  body('categoryId').optional().isUUID().withMessage('Invalid category ID'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('metaTitle').optional().isLength({ max: 255 }).withMessage('Meta title must be less than 255 characters'),
  body('metaDescription').optional().isLength({ max: 500 }).withMessage('Meta description is too long'),
  body('metaKeywords').optional().isLength({ max: 255 }).withMessage('Meta keywords must be less than 255 characters'),
];
