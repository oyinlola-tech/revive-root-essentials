const { WishlistItem, Product, Category } = require('../models');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const currencyService = require('../services/currencyService');

const applyPricingContext = (product, pricingContext) => {
  if (!product) return;

  const targetCurrency = pricingContext.currency || 'NGN';
  if (targetCurrency === 'NGN' || !pricingContext.rate) {
    product.setDataValue('currency', 'NGN');
    return;
  }

  const basePrice = Number(product.price);
  const convertedPrice = currencyService.convertNgnToCurrency(basePrice, pricingContext.rate);
  product.setDataValue('price', convertedPrice);
  product.setDataValue('currency', targetCurrency);
};

exports.getWishlist = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const pricingContext = await currencyService.getPricingContext(req);

  const items = await WishlistItem.findAll({
    where: { userId },
    include: [{
      model: Product,
      include: [{ model: Category, attributes: ['id', 'name'] }],
    }],
    order: [['createdAt', 'DESC']],
  });

  const products = items
    .map((item) => item.Product)
    .filter(Boolean);

  products.forEach((product) => applyPricingContext(product, pricingContext));

  res.json({ products });
});

exports.addToWishlist = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const { productId } = req.body;

  const product = await Product.findByPk(productId, { attributes: ['id'] });
  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  await WishlistItem.findOrCreate({
    where: { userId, productId },
    defaults: { userId, productId },
  });

  res.status(201).json({ message: 'Product added to wishlist' });
});

exports.removeFromWishlist = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const { productId } = req.params;

  const deleted = await WishlistItem.destroy({
    where: { userId, productId },
  });

  if (!deleted) {
    return next(new AppError('Wishlist item not found', 404));
  }

  res.status(204).json(null);
});

exports.clearWishlist = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  await WishlistItem.destroy({ where: { userId } });
  res.status(204).json(null);
});
