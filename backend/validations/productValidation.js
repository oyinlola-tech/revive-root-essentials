const { body } = require('express-validator');

const baseProductValidation = [
  body('name').optional().trim().notEmpty().withMessage('Product name is required'),
  body('description').optional().trim().isLength({ max: 5000 }).withMessage('Description is too long'),
  body('price')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage('Price must be greater than 0'),
  body('imageUrl').optional().trim().isURL({ protocols: ['http', 'https'], require_protocol: true }).withMessage('Product image must be a valid URL'),
  body('imageUrls').optional().isArray({ min: 1, max: 10 }).withMessage('Product images must be an array of 1 to 10 URLs'),
  body('imageUrls.*').optional().trim().isURL({ protocols: ['http', 'https'], require_protocol: true }).withMessage('Each product image must be a valid URL'),
  body('categoryId').optional({ nullable: true, checkFalsy: true }).isUUID().withMessage('Invalid category ID'),
  body('ingredients').optional().isArray({ max: 50 }).withMessage('Ingredients must be an array'),
  body('ingredients.*').optional().isString().withMessage('Each ingredient must be a string'),
  body('benefits').optional().isArray({ max: 50 }).withMessage('Benefits must be an array'),
  body('benefits.*').optional().isString().withMessage('Each benefit must be a string'),
  body('howToUse').optional().trim().isLength({ max: 5000 }).withMessage('How to use text is too long'),
  body('size').optional().trim().isLength({ max: 80 }).withMessage('Size must be 80 characters or less'),
  body('stock').optional().isInt({ min: 0, max: 100000 }).withMessage('Stock must be a non-negative integer'),
  body('metaTitle').optional().trim().isLength({ max: 255 }).withMessage('Meta title must be less than 255 characters'),
  body('metaDescription').optional().trim().isLength({ max: 500 }).withMessage('Meta description is too long'),
  body('metaKeywords').optional().trim().isLength({ max: 255 }).withMessage('Meta keywords must be less than 255 characters'),
  body('isFeatured').optional().isBoolean().withMessage('isFeatured must be true or false'),
];

exports.createProductValidation = [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('price').isFloat({ gt: 0 }).withMessage('Price must be greater than 0'),
  body('categoryId').isUUID().withMessage('Category is required'),
  body().custom((value) => {
    const urls = Array.isArray(value?.imageUrls) ? value.imageUrls.filter(Boolean) : [];
    const imageUrl = String(value?.imageUrl || '').trim();

    if (urls.length === 0 && !imageUrl) {
      throw new Error('At least one product image is required for SEO optimization');
    }

    return true;
  }),
  ...baseProductValidation,
];

exports.updateProductValidation = [
  body('categoryId').isUUID().withMessage('Category is required'),
  ...baseProductValidation,
];
