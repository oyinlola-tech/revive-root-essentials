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
  const { productId } = req.body;
  const quantity = Number(req.body.quantity || 1);

  const product = await Product.findByPk(productId);
  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  if (quantity > product.stock) {
    return next(new AppError('Requested quantity exceeds available stock', 400));
  }

  const [cartItem, created] = await CartItem.findOrCreate({
    where: { userId, productId },
    defaults: { quantity },
  });

  if (!created) {
    const updatedQuantity = cartItem.quantity + quantity;
    if (updatedQuantity > product.stock) {
      return next(new AppError('Requested quantity exceeds available stock', 400));
    }
    cartItem.quantity = updatedQuantity;
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

  const parsedQuantity = Number(quantity);
  const product = await Product.findByPk(cartItem.productId);
  if (!product) {
    return next(new AppError('Associated product not found', 404));
  }
  if (parsedQuantity > product.stock) {
    return next(new AppError('Requested quantity exceeds available stock', 400));
  }

  cartItem.quantity = parsedQuantity;
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
