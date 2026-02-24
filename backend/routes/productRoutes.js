const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect } = require('../middlewares/authMiddleware');
const restrictTo = require('../middlewares/roleMiddleware');
const validate = require('../middlewares/validationMiddleware');
const { createProductValidation, updateProductValidation } = require('../validations/productValidation');
const upload = require('../middlewares/uploadMiddleware');

// Public routes
router.get('/', productController.getAllProducts);
router.get('/featured', productController.getFeaturedProducts);
router.get('/bestsellers', productController.getBestsellers);
router.get('/resolve/:identifier', productController.getProductByIdentifier);
router.get('/slug/:slug', productController.getProductBySlug);
router.get('/:id', productController.getProductById);

// Admin only
router.post('/upload-image', protect, restrictTo('admin', 'superadmin'), upload.single('image'), productController.uploadProductImage);
router.post('/', protect, restrictTo('admin', 'superadmin'), validate(createProductValidation), productController.createProduct);
router.put('/:id', protect, restrictTo('admin', 'superadmin'), validate(updateProductValidation), productController.updateProduct);
router.delete('/:id', protect, restrictTo('admin', 'superadmin'), productController.deleteProduct);

module.exports = router;
