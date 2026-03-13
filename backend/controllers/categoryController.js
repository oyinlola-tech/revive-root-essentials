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
  // Category creation is intentionally disabled.
  // const category = await Category.create(req.body);
  // await cacheService.invalidateCategories();
  // logger.info(`Category created: ${category.id}`, { categoryName: category.name });
  // res.status(201).json(category);
  return next(new AppError('Category management is disabled', 403));
});

exports.updateCategory = catchAsync(async (req, res, next) => {
  // Category updates are intentionally disabled.
  // const category = await Category.findByPk(req.params.id);
  // if (!category) {
  //   return next(new AppError('Category not found', 404));
  // }
  // await category.update(req.body);
  // await cacheService.invalidateCategories();
  // logger.info(`Category updated: ${category.id}`, { categoryName: category.name });
  // res.json(category);
  return next(new AppError('Category management is disabled', 403));
});

exports.deleteCategory = catchAsync(async (req, res, next) => {
  // Category deletion is intentionally disabled.
  // const category = await Category.findByPk(req.params.id);
  // if (!category) {
  //   return next(new AppError('Category not found', 404));
  // }
  // await category.destroy();
  // await cacheService.invalidateCategories();
  // logger.info(`Category deleted: ${req.params.id}`, { categoryName: category.name });
  // res.status(204).json(null);
  return next(new AppError('Category management is disabled', 403));
});
