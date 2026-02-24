const { Product, Category } = require('../models');
const { Op, fn } = require('sequelize');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

const slugify = (value = '') =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 180);

const buildSeoPayload = (payload) => {
  const name = payload.name || '';
  const description = payload.description || '';
  const slugBase = payload.slug || slugify(name);
  const appName = process.env.APP_NAME || '';
  const categoryKeyword = payload.categoryName || payload.category || '';
  const derivedKeywords = [name, categoryKeyword, slugBase?.replace(/-/g, ' ')]
    .map((value) => String(value || '').trim())
    .filter(Boolean)
    .join(', ');

  return {
    ...payload,
    slug: slugBase || undefined,
    metaTitle: payload.metaTitle || (appName ? `${name} | ${appName}` : name),
    metaDescription: payload.metaDescription || description.slice(0, 155),
    metaKeywords: payload.metaKeywords || derivedKeywords || undefined,
  };
};

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
  if (!req.body.imageUrl) {
    return next(new AppError('Product image is required for SEO-ready product creation', 400));
  }

  const product = await Product.create(buildSeoPayload(req.body));
  res.status(201).json(product);
});

exports.updateProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findByPk(req.params.id);
  if (!product) {
    return next(new AppError('Product not found', 404));
  }
  await product.update(buildSeoPayload({ ...product.toJSON(), ...req.body }));
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

exports.uploadProductImage = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('Image file is required', 400));
  }

  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const imageUrl = `${baseUrl}/uploads/${req.file.filename}`;

  res.status(201).json({
    message: 'Image uploaded successfully',
    imageUrl,
    filename: req.file.filename,
  });
});
