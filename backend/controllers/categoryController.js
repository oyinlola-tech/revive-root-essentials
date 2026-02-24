const { Category } = require('../models');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

exports.getAllCategories = catchAsync(async (req, res, next) => {
  const categories = await Category.findAll();
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
  res.status(201).json(category);
});

exports.updateCategory = catchAsync(async (req, res, next) => {
  const category = await Category.findByPk(req.params.id);
  if (!category) {
    return next(new AppError('Category not found', 404));
  }
  await category.update(req.body);
  res.json(category);
});

exports.deleteCategory = catchAsync(async (req, res, next) => {
  const category = await Category.findByPk(req.params.id);
  if (!category) {
    return next(new AppError('Category not found', 404));
  }
  await category.destroy();
  res.status(204).json(null);
});