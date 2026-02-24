const { CartItem, Product } = require('../models');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

exports.getCart = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const cartItems = await CartItem.findAll({
    where: { userId },
    include: [{ model: Product, attributes: ['id', 'name', 'price', 'imageUrl'] }],
  });

  const items = cartItems.map(item => ({
    id: item.id,
    productId: item.productId,
    name: item.Product.name,
    price: item.Product.price,
    quantity: item.quantity,
    image: item.Product.imageUrl,
  }));

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  res.json({ items, total });
});

exports.addToCart = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const { productId, quantity = 1 } = req.body;

  const product = await Product.findByPk(productId);
  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  const [cartItem, created] = await CartItem.findOrCreate({
    where: { userId, productId },
    defaults: { quantity },
  });

  if (!created) {
    cartItem.quantity += quantity;
    await cartItem.save();
  }

  res.status(201).json(cartItem);
});

exports.updateCartItem = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const itemId = req.params.itemId;
  const { quantity } = req.body;

  const cartItem = await CartItem.findOne({
    where: { id: itemId, userId },
  });

  if (!cartItem) {
    return next(new AppError('Cart item not found', 404));
  }

  cartItem.quantity = quantity;
  await cartItem.save();

  res.json(cartItem);
});

exports.removeFromCart = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const itemId = req.params.itemId;

  const deleted = await CartItem.destroy({
    where: { id: itemId, userId },
  });

  if (!deleted) {
    return next(new AppError('Cart item not found', 404));
  }

  res.status(204).json(null);
});

exports.clearCart = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  await CartItem.destroy({ where: { userId } });
  res.status(204).json(null);
});