const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect } = require('../middlewares/authMiddleware');
const restrictTo = require('../middlewares/roleMiddleware');
const validate = require('../middlewares/validationMiddleware');
const {
  createOrderValidation,
  orderIdParamValidation,
  retryPaymentValidation,
  verifyPaymentValidation,
  updateOrderStatusValidation,
  refundOrderValidation,
} = require('../validations/orderValidation');

router.use(protect);

// User routes
router.get('/', orderController.getUserOrders);
router.post('/', validate(createOrderValidation), orderController.createOrder);
router.post('/:id/retry-payment', validate(retryPaymentValidation), orderController.retryPayment);
router.post('/:id/verify-payment', validate(verifyPaymentValidation), orderController.verifyPayment);

// Admin routes
router.get('/all', restrictTo('admin', 'superadmin'), orderController.getAllOrders);
router.put('/:id/status', restrictTo('admin', 'superadmin'), validate(updateOrderStatusValidation), orderController.updateOrderStatus);
router.post('/:id/refund', restrictTo('admin', 'superadmin'), validate(refundOrderValidation), orderController.refundOrder);

router.get('/:id', validate(orderIdParamValidation), orderController.getOrderById);
router.delete('/:id', validate(orderIdParamValidation), orderController.cancelOrder); // user can cancel their own pending order

module.exports = router;
