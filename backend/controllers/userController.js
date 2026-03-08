const { User } = require('../models');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

const countSuperadmins = () => User.count({ where: { role: 'superadmin' } });

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
  const isOwner = req.user?.id === req.params.id;
  const isPrivileged = ['admin', 'superadmin'].includes(req.user?.role);
  if (!isOwner && !isPrivileged) {
    return next(new AppError('You can only access your own account', 403));
  }

  const user = await User.findByPk(req.params.id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }
  res.json(user);
});

exports.updateUser = catchAsync(async (req, res, next) => {
  const isOwner = req.user?.id === req.params.id;
  const isPrivileged = ['admin', 'superadmin'].includes(req.user?.role);
  if (!isOwner && !isPrivileged) {
    return next(new AppError('You can only update your own account', 403));
  }

  const user = await User.findByPk(req.params.id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  const {
    name,
    phone,
    acceptedMarketing,
    acceptedNewsletter,
  } = req.body;

  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (typeof acceptedMarketing === 'boolean') {
    user.acceptedMarketing = acceptedMarketing;
  }
  if (typeof acceptedNewsletter === 'boolean') {
    user.acceptedNewsletter = acceptedNewsletter;
    user.newsletterUnsubscribedAt = acceptedNewsletter ? null : new Date();
  }

  await user.save();
  res.json(user);
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  if (req.user?.role !== 'superadmin') {
    return next(new AppError('Only superadmins can delete user accounts.', 403));
  }

  const user = await User.findByPk(req.params.id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }
  if (user.id === req.user.id) {
    return next(new AppError('Use the self-service delete flow for your own account.', 400));
  }
  if (user.role === 'superadmin') {
    const superadminCount = await countSuperadmins();
    if (superadminCount <= 1) {
      return next(new AppError('You cannot delete the last superadmin account.', 400));
    }
  }
  await user.destroy();
  res.status(204).json(null);
});

exports.updateUserRole = catchAsync(async (req, res, next) => {
  if (req.user?.role !== 'superadmin') {
    return next(new AppError('Only superadmins can change user roles.', 403));
  }

  const { role } = req.body;
  if (!['user', 'admin', 'superadmin'].includes(role)) {
    return next(new AppError('Invalid role', 400));
  }

  const user = await User.findByPk(req.params.id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }
  if (user.id === req.user.id && role !== req.user.role) {
    return next(new AppError('You cannot change your own role.', 400));
  }
  if (user.role === 'superadmin' && role !== 'superadmin') {
    const superadminCount = await countSuperadmins();
    if (superadminCount <= 1) {
      return next(new AppError('You cannot demote the last superadmin.', 400));
    }
  }

  user.role = role;
  await user.save();
  res.json(user);
});

exports.createAdminAccount = catchAsync(async (req, res, next) => {
  if (req.user?.role !== 'superadmin') {
    return next(new AppError('Only superadmins can create admin accounts.', 403));
  }

  const { name, email, password, phone } = req.body;
  const normalizedEmail = email.toLowerCase().trim();

  const existingUser = await User.findOne({ where: { email: normalizedEmail } });
  if (existingUser) {
    return next(new AppError('User already exists with this email', 400));
  }

  const adminUser = await User.create({
    name,
    email: normalizedEmail,
    phone,
    passwordHash: password,
    role: 'admin',
    isVerified: true,
    acceptedTerms: true,
    termsAcceptedAt: new Date(),
    acceptedMarketing: false,
    acceptedNewsletter: false,
    newsletterUnsubscribedAt: new Date(),
  });

  res.status(201).json({
    message: 'Admin account created successfully',
    user: {
      id: adminUser.id,
      name: adminUser.name,
      email: adminUser.email,
      role: adminUser.role,
    },
  });
});

exports.deleteMyAccount = catchAsync(async (req, res, next) => {
  const user = await User.findByPk(req.user.id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }
  if (user.role === 'superadmin') {
    const superadminCount = await countSuperadmins();
    if (superadminCount <= 1) {
      return next(new AppError('You cannot delete the last superadmin account.', 400));
    }
  }

  await user.destroy();
  res.status(204).json(null);
});
