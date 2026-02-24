const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { protect } = require('../middlewares/authMiddleware');
const restrictTo = require('../middlewares/roleMiddleware');

// Public
router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);

// Admin only
router.post('/', protect, restrictTo('admin', 'superadmin'), categoryController.createCategory);
router.put('/:id', protect, restrictTo('admin', 'superadmin'), categoryController.updateCategory);
router.delete('/:id', protect, restrictTo('admin', 'superadmin'), categoryController.deleteCategory);

module.exports = router;