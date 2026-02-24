const { User } = require('../models');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const offset = (page - 1) * limit;

  const where = {};
  if (req.query.role) where.role = req.query.role;

  const { rows: users, count: total } = await User.findAndCountAll({
    where,
    limit,
    offset,
    order: [['createdAt', 'DESC']],
  });

  res.json({
    users,
    total,
    page,
    limit,
  });
});

exports.getUserById = catchAsync(async (req, res, next) => {
  const user = await User.findByPk(req.params.id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }
  res.json(user);
});

exports.updateUser = catchAsync(async (req, res, next) => {
  const user = await User.findByPk(req.params.id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  const { name, phone } = req.body;
  if (name) user.name = name;
  if (phone) user.phone = phone;

  await user.save();
  res.json(user);
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByPk(req.params.id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }
  await user.destroy();
  res.status(204).json(null);
});

exports.updateUserRole = catchAsync(async (req, res, next) => {
  const { role } = req.body;
  if (!['user', 'admin', 'superadmin'].includes(role)) {
    return next(new AppError('Invalid role', 400));
  }

  const user = await User.findByPk(req.params.id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  user.role = role;
  await user.save();
  res.json(user);
});
