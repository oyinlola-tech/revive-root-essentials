const { Product, Category } = require('../models');
const { Op, fn, literal } = require('sequelize');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const currencyService = require('../services/currencyService');
const cacheService = require('../services/cacheService');
const redisProductCacheService = require('../services/redisProductCacheService');
const Logger = require('../utils/Logger');

const logger = new Logger('ProductController');

const slugify = (value = '') =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 180);

const normalizeSlug = (value = '') => slugify(String(value || ''));
const uuidV4Pattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const resolveUniqueSlug = async (baseSlug, excludeId) => {
  const safeBase = normalizeSlug(baseSlug || 'product');
  let candidate = safeBase;
  let attempt = 1;

  while (true) {
    const existing = await Product.findOne({
      where: {
        slug: candidate,
        ...(excludeId ? { id: { [Op.ne]: excludeId } } : {}),
      },
      attributes: ['id'],
    });

    if (!existing) return candidate;
    attempt += 1;
    candidate = `${safeBase}-${attempt}`;
  }
};

const ensureProductSlug = async (product) => {
  if (product.slug) return product.slug;
  const fallbackBase = `${product.name || 'product'}-${String(product.id || '').slice(0, 8)}`;
  const slug = normalizeSlug(fallbackBase) || 'product';
  if (product.setDataValue) product.setDataValue('slug', slug);
  else product.slug = slug;
  return slug;
};

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

const applyPricingContext = (product, pricingContext) => {
  if (!product) return;

  const targetCurrency = pricingContext.currency || 'NGN';
  if (targetCurrency === 'NGN' || !pricingContext.rate) {
    if (product?.setDataValue) product.setDataValue('currency', 'NGN');
    else product.currency = 'NGN';
    return;
  }

  const basePrice = Number(product.price);
  const convertedPrice = currencyService.convertNgnToCurrencyWithBuffer(basePrice, pricingContext.rate);

  if (product.setDataValue) {
    product.setDataValue('price', convertedPrice);
    product.setDataValue('currency', targetCurrency);
  } else {
    product.price = convertedPrice;
    product.currency = targetCurrency;
  }
};

exports.getAllProducts = catchAsync(async (req, res, next) => {
  const pricingContext = await currencyService.getPricingContext(req);
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 12, 1), 50);
  const offset = (page - 1) * limit;

  // Create cache key based on query parameters
  const cacheKey = `products:list:${JSON.stringify({
    page,
    limit,
    search: req.query.search,
    minPrice: req.query.minPrice,
    maxPrice: req.query.maxPrice,
    category: req.query.category,
    sort: req.query.sort
  })}`;

  // Try to get from Redis cache
  let result = await redisProductCacheService.getCache(cacheKey);
  
  if (!result) {
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
    const categoryWhere = categoryFilter && categoryFilter.length > 0
      ? {
        [Op.or]: categoryFilter.map((name) => ({
          name: { [Op.like]: `%${name}%` },
        })),
      }
      : undefined;

    let order = [['isFeatured', 'DESC'], ['stock', 'DESC'], ['createdAt', 'DESC']];
    if (req.query.sort === 'name') order = [['name', 'ASC']];
    if (req.query.sort === 'price-asc') order = [['price', 'ASC']];
    if (req.query.sort === 'price-desc') order = [['price', 'DESC']];
    if (req.query.sort === 'newest') order = [['createdAt', 'DESC']];
    if (req.query.sort === 'ranked') order = [['isFeatured', 'DESC'], ['stock', 'DESC'], ['createdAt', 'DESC']];
    if (req.query.search) {
      const rawSearch = String(req.query.search).toLowerCase();
      order = [[literal(`CASE WHEN LOWER(name) LIKE ${Product.sequelize.escape(`${rawSearch}%`)} THEN 0 ELSE 1 END`), 'ASC'], ...order];
    }

    const include = [{
      model: Category,
      attributes: ['id', 'name'],
      ...(categoryWhere ? { where: categoryWhere } : {}),
      required: !!categoryWhere,
    }];

    const { rows: products, count: total } = await Product.findAndCountAll({
      where,
      include,
      limit,
      offset,
      order,
    });
    await Promise.all(products.map((product) => ensureProductSlug(product)));
    products.forEach((product) => applyPricingContext(product, pricingContext));

    result = {
      products,
      total: Array.isArray(total) ? total.length : total,
      page,
      limit,
    };

    // Cache the result (TTL: 10 minutes for search results, 1 hour for others)
    const ttl = req.query.search ? 600 : 3600;
    await redisProductCacheService.setCache(cacheKey, result, ttl);
    logger.debug(`Products list cached (TTL: ${ttl}s)`);
  } else {
    // Apply pricing context to cached products
    result.products.forEach((product) => applyPricingContext(product, pricingContext));
  }

  res.json(result);
});

exports.getProductById = catchAsync(async (req, res, next) => {
  const pricingContext = await currencyService.getPricingContext(req);
  
  // Try to get from Redis cache
  let product = await redisProductCacheService.getProductById(req.params.id, async (id) => {
    return await Product.findByPk(id, {
      include: [{ model: Category, attributes: ['id', 'name'] }],
    });
  });
  
  if (!product) {
    return next(new AppError('Product not found', 404));
  }
  
  await ensureProductSlug(product);
  applyPricingContext(product, pricingContext);
  res.json(product);
});

exports.getProductBySlug = catchAsync(async (req, res, next) => {
  const pricingContext = await currencyService.getPricingContext(req);
  const slug = normalizeSlug(req.params.slug);
  const product = await Product.findOne({
    where: { slug },
    include: [{ model: Category, attributes: ['id', 'name'] }],
  });

  if (!product) {
    return next(new AppError('Product not found', 404));
  }
  await ensureProductSlug(product);
  applyPricingContext(product, pricingContext);
  res.json(product);
});

exports.getProductByIdentifier = catchAsync(async (req, res, next) => {
  const identifier = String(req.params.identifier || '').trim();

  if (uuidV4Pattern.test(identifier)) {
    req.params.id = identifier;
    return exports.getProductById(req, res, next);
  }

  req.params.slug = identifier;
  return exports.getProductBySlug(req, res, next);
});

exports.createProduct = catchAsync(async (req, res, next) => {
  if (!req.body.imageUrl) {
    return next(new AppError('Product image is required for SEO-ready product creation', 400));
  }
  const seoPayload = buildSeoPayload(req.body);
  seoPayload.slug = await resolveUniqueSlug(seoPayload.slug || seoPayload.name);
  const product = await Product.create(seoPayload);
  
  // Invalidate product caches
  await redisProductCacheService.invalidateAllProductCaches();
  logger.info(`Product created: ${product.id}`, { productName: product.name });
  
  res.status(201).json(product);
});

exports.updateProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findByPk(req.params.id);
  if (!product) {
    return next(new AppError('Product not found', 404));
  }
  const seoPayload = buildSeoPayload({ ...product.toJSON(), ...req.body });
  seoPayload.slug = await resolveUniqueSlug(seoPayload.slug || seoPayload.name, product.id);
  await product.update(seoPayload);
  
  // Invalidate product caches
  await redisProductCacheService.invalidateProductCache(req.params.id);
  logger.info(`Product updated: ${product.id}`, { productName: product.name });
  
  res.json(product);
});

exports.deleteProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findByPk(req.params.id);
  if (!product) {
    return next(new AppError('Product not found', 404));
  }
  await product.destroy();
  
  // Invalidate product caches
  await redisProductCacheService.invalidateProductCache(req.params.id);
  logger.info(`Product deleted: ${req.params.id}`, { productName: product.name });
  
  res.status(204).json(null);
});

exports.getFeaturedProducts = catchAsync(async (req, res, next) => {
  const pricingContext = await currencyService.getPricingContext(req);
  
  // Try to get from Redis cache
  let products = await redisProductCacheService.getFeaturedProducts(async () => {
    return await Product.findAll({
      where: { isFeatured: true },
      include: [{ model: Category, attributes: ['id', 'name'] }],
      limit: 10,
    });
  });

  await Promise.all(products.map((product) => ensureProductSlug(product)));
  products.forEach((product) => applyPricingContext(product, pricingContext));
  res.json(products);
});

exports.getBestsellers = catchAsync(async (req, res, next) => {
  const pricingContext = await currencyService.getPricingContext(req);
  const products = await Product.findAll({
    include: [{ model: Category, attributes: ['id', 'name'] }],
    order: [[fn('RAND')]],
    limit: 10,
  });
  await Promise.all(products.map((product) => ensureProductSlug(product)));
  products.forEach((product) => applyPricingContext(product, pricingContext));
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
