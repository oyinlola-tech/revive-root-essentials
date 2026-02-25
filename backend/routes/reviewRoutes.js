const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { protect } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validationMiddleware');
const {
  productParamValidation,
  createReviewValidation,
  updateReviewValidation,
} = require('../validations/reviewValidation');

// Public: get reviews for a product
router.get('/product/:productId', validate(productParamValidation), reviewController.getProductReviews);

// Protected: create, update, delete reviews
router.use(protect);
router.post('/', validate(createReviewValidation), reviewController.createReview);
router.put('/:id', validate(updateReviewValidation), reviewController.updateReview);
router.delete('/:id', reviewController.deleteReview);

module.exports = router;
