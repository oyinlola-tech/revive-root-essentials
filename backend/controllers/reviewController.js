const { Review, Product, User, Order, OrderItem } = require('../models');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

exports.getProductReviews = catchAsync(async (req, res, next) => {
  const reviews = await Review.findAll({
    where: { productId: req.params.productId },
    include: [{ model: User, attributes: ['id', 'name'] }],
  });
  res.json(reviews);
});

exports.createReview = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const { productId, rating, comment } = req.body;

  // Check if product exists
  const product = await Product.findByPk(productId);
  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  // Check if user already reviewed this product (optional: allow one review per user)
  const existing = await Review.findOne({ where: { userId, productId } });
  if (existing) {
    return next(new AppError('You have already reviewed this product', 400));
  }

  // Only users who purchased (paid order) can review
  const purchasedItem = await OrderItem.findOne({
    where: { productId },
    include: [{
      model: Order,
      where: { userId, paymentStatus: 'paid' },
      attributes: ['id', 'paymentStatus'],
    }],
  });

  if (!purchasedItem) {
    return next(new AppError('You can only review products you have purchased', 403));
  }

  const review = await Review.create({
    userId,
    productId,
    rating,
    comment,
  });

  res.status(201).json(review);
});

exports.updateReview = catchAsync(async (req, res, next) => {
  const reviewId = req.params.id;
  const userId = req.user.id;
  const { rating, comment } = req.body;

  const review = await Review.findByPk(reviewId);
  if (!review) {
    return next(new AppError('Review not found', 404));
  }
  if (review.userId !== userId && req.user.role !== 'admin') {
    return next(new AppError('You are not authorized to update this review', 403));
  }

  review.rating = rating || review.rating;
  review.comment = comment || review.comment;
  await review.save();

  res.json(review);
});

exports.deleteReview = catchAsync(async (req, res, next) => {
  const reviewId = req.params.id;
  const userId = req.user.id;

  const review = await Review.findByPk(reviewId);
  if (!review) {
    return next(new AppError('Review not found', 404));
  }
  if (review.userId !== userId && req.user.role !== 'admin') {
    return next(new AppError('You are not authorized to delete this review', 403));
  }

  await review.destroy();
  res.status(204).json(null);
});
