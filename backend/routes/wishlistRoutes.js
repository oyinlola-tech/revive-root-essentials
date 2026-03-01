const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');
const { protect } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validationMiddleware');
const {
  addWishlistValidation,
  removeWishlistValidation,
} = require('../validations/wishlistValidation');

router.use(protect);

router.get('/', wishlistController.getWishlist);
router.post('/', validate(addWishlistValidation), wishlistController.addToWishlist);
router.delete('/:productId', validate(removeWishlistValidation), wishlistController.removeFromWishlist);
router.delete('/', wishlistController.clearWishlist);

module.exports = router;
