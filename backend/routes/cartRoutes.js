const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { protect } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validationMiddleware');
const {
  addToCartValidation,
  updateCartItemValidation,
  cartItemParamValidation,
} = require('../validations/cartValidation');

router.use(protect); // All cart routes require authentication

router.get('/', cartController.getCart);
router.post('/', validate(addToCartValidation), cartController.addToCart);
router.put('/:itemId', validate(updateCartItemValidation), cartController.updateCartItem);
router.delete('/:itemId', validate(cartItemParamValidation), cartController.removeFromCart);
router.delete('/', cartController.clearCart);

module.exports = router;
