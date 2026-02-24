const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect } = require('../middlewares/authMiddleware');
const restrictTo = require('../middlewares/roleMiddleware');
const validate = require('../middlewares/validationMiddleware');
const { createOrderValidation } = require('../validations/orderValidation');

router.use(protect);

// User routes
router.get('/', orderController.getUserOrders);
router.post('/', validate(createOrderValidation), orderController.createOrder);
router.post('/:id/verify-payment', orderController.verifyPayment);

// Admin routes
router.get('/all', restrictTo('admin', 'superadmin'), orderController.getAllOrders);
router.put('/:id/status', restrictTo('admin', 'superadmin'), orderController.updateOrderStatus);
router.post('/:id/refund', restrictTo('admin', 'superadmin'), orderController.refundOrder);

router.get('/:id', orderController.getOrderById);
router.delete('/:id', orderController.cancelOrder); // user can cancel their own pending order

module.exports = router;
