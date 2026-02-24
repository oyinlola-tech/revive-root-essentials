const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { protect } = require('../middlewares/authMiddleware');

// Public: get reviews for a product
router.get('/product/:productId', reviewController.getProductReviews);

// Protected: create, update, delete reviews
router.use(protect);
router.post('/', reviewController.createReview);
router.put('/:id', reviewController.updateReview);
router.delete('/:id', reviewController.deleteReview);

module.exports = router;