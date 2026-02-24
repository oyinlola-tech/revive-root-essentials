const { Product, Category } = require('../models');
const { Op, fn } = require('sequelize');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

exports.getAllProducts = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 12;
  const offset = (page - 1) * limit;

  const where = {};
  if (req.query.search) {
    where.name = { [Op.like]: `%${req.query.search}%` };
  }
  if (req.query.minPrice || req.query.maxPrice) {
    where.price = {};
    if (req.query.minPrice) where.price[Op.gte] = Number(req.query.minPrice);
    if (req.query.maxPrice) where.price[Op.lte] = Number(req.query.maxPrice);
  }

  const categoryFilter = req.query.category
    ? req.query.category.split(',').map((name) => name.trim()).filter(Boolean)
    : null;

  let order = [['createdAt', 'DESC']];
  if (req.query.sort === 'name') order = [['name', 'ASC']];
  if (req.query.sort === 'price-asc') order = [['price', 'ASC']];
  if (req.query.sort === 'price-desc') order = [['price', 'DESC']];

  const include = [{
    model: Category,
    attributes: ['id', 'name'],
    ...(categoryFilter ? { where: { name: { [Op.in]: categoryFilter } } } : {}),
    required: !!categoryFilter,
  }];

  const { rows: products, count: total } = await Product.findAndCountAll({
    where,
    include,
    limit,
    offset,
    order,
  });

  res.json({
    products,
    total: Array.isArray(total) ? total.length : total,
    page,
    limit,
  });
});

exports.getProductById = catchAsync(async (req, res, next) => {
  const product = await Product.findByPk(req.params.id, {
    include: [{ model: Category, attributes: ['id', 'name'] }],
  });
  if (!product) {
    return next(new AppError('Product not found', 404));
  }
  res.json(product);
});

exports.createProduct = catchAsync(async (req, res, next) => {
  const product = await Product.create(req.body);
  res.status(201).json(product);
});

exports.updateProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findByPk(req.params.id);
  if (!product) {
    return next(new AppError('Product not found', 404));
  }
  await product.update(req.body);
  res.json(product);
});

exports.deleteProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findByPk(req.params.id);
  if (!product) {
    return next(new AppError('Product not found', 404));
  }
  await product.destroy();
  res.status(204).json(null);
});

exports.getFeaturedProducts = catchAsync(async (req, res, next) => {
  const products = await Product.findAll({
    where: { isFeatured: true },
    include: [{ model: Category, attributes: ['id', 'name'] }],
    limit: 10,
  });
  res.json(products);
});

exports.getBestsellers = catchAsync(async (req, res, next) => {
  const products = await Product.findAll({
    include: [{ model: Category, attributes: ['id', 'name'] }],
    order: [[fn('RAND')]],
    limit: 10,
  });
  res.json(products);
});
