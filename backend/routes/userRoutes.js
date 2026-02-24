const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');
const restrictTo = require('../middlewares/roleMiddleware');
const validate = require('../middlewares/validationMiddleware');
const { updateUserValidation, createAdminValidation } = require('../validations/userValidation');

// Admin/Superadmin only
router.get('/', protect, restrictTo('admin', 'superadmin'), userController.getAllUsers);
router.post('/admin-account', protect, restrictTo('superadmin'), validate(createAdminValidation), userController.createAdminAccount);
router.put('/:id/role', protect, restrictTo('superadmin'), userController.updateUserRole);
router.delete('/:id', protect, restrictTo('superadmin'), userController.deleteUser);
router.delete('/me/account', protect, userController.deleteMyAccount);

// Authenticated users can access their own data
router.get('/:id', protect, userController.getUserById);
router.put('/:id', protect, validate(updateUserValidation), userController.updateUser);

module.exports = router;
