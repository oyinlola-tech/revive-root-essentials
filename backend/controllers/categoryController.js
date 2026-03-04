const { Category } = require('../models');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const cacheService = require('../services/cacheService');
const Logger = require('../utils/Logger');

const logger = new Logger('CategoryController');

exports.getAllCategories = catchAsync(async (req, res, next) => {
  // Try to get from cache
  let categories = await cacheService.getCachedCategories();
  
  if (!categories) {
    categories = await Category.findAll();
    await cacheService.setCachedCategories(categories);
    logger.debug('Categories cached');
  }
  
  res.json(categories);
});

exports.getCategoryById = catchAsync(async (req, res, next) => {
  const category = await Category.findByPk(req.params.id);
  if (!category) {
    return next(new AppError('Category not found', 404));
  }
  res.json(category);
});

exports.createCategory = catchAsync(async (req, res, next) => {
  const category = await Category.create(req.body);
  
  // Invalidate cache
  await cacheService.invalidateCategories();
  logger.info(`Category created: ${category.id}`, { categoryName: category.name });
  
  res.status(201).json(category);
});

exports.updateCategory = catchAsync(async (req, res, next) => {
  const category = await Category.findByPk(req.params.id);
  if (!category) {
    return next(new AppError('Category not found', 404));
  }
  await category.update(req.body);
  
  // Invalidate cache
  await cacheService.invalidateCategories();
  logger.info(`Category updated: ${category.id}`, { categoryName: category.name });
  
  res.json(category);
});

exports.deleteCategory = catchAsync(async (req, res, next) => {
  const category = await Category.findByPk(req.params.id);
  if (!category) {
    return next(new AppError('Category not found', 404));
  }
  await category.destroy();
  
  // Invalidate cache
  await cacheService.invalidateCategories();
  logger.info(`Category deleted: ${req.params.id}`, { categoryName: category.name });
  
  res.status(204).json(null);
});