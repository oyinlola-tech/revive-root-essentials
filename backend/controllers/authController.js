const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Op } = require('sequelize');
const { User, Otp } = require('../models');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const generateOtp = require('../utils/generateOtp');
const { sendEmail } = require('../utils/emailService');
const { jwtSecret, jwtExpiresIn, jwtRefreshSecret, jwtRefreshExpiresIn } = require('../config/auth');

const signToken = (id) => {
  return jwt.sign({ id }, jwtSecret, { expiresIn: jwtExpiresIn });
};

const signRefreshToken = (id) => {
  return jwt.sign({ id }, jwtRefreshSecret, { expiresIn: jwtRefreshExpiresIn });
};

exports.register = catchAsync(async (req, res, next) => {
  const { name, email, phone, password } = req.body;
  const normalizedEmail = email.toLowerCase().trim();

  const existingUser = await User.findOne({ where: { email: normalizedEmail } });
  if (existingUser) {
    return next(new AppError('User already exists with this email', 400));
  }

  const user = await User.create({
    name,
    email: normalizedEmail,
    phone,
    passwordHash: password,
    isVerified: false,
  });

  const otpCode = generateOtp();
  const otpHash = crypto.createHash('sha256').update(otpCode).digest('hex');
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await Otp.destroy({ where: { identifier: normalizedEmail, type: 'email' } });
  await Otp.create({
    identifier: normalizedEmail,
    type: 'email',
    code: otpHash,
    userId: user.id,
    expiresAt,
  });

  await sendEmail(
    normalizedEmail,
    'Verify your account',
    `<p>Your OTP code is: <strong>${otpCode}</strong>. It expires in 5 minutes.</p>`
  );

  res.status(201).json({
    message: 'Registration successful. OTP sent to your email.',
    verificationRequired: true,
  });
});

exports.sendOtp = catchAsync(async (req, res, next) => {
  const { identifier } = req.body;
  const normalizedIdentifier = identifier.toLowerCase().trim();

  const user = await User.findOne({ where: { email: normalizedIdentifier } });
  if (!user) {
    return next(new AppError('No account found with this email', 404));
  }

  const recentOtp = await Otp.findOne({
    where: {
      identifier: normalizedIdentifier,
      type: 'email',
      createdAt: { [Op.gt]: new Date(Date.now() - 60 * 1000) },
    },
  });

  if (recentOtp) {
    return next(new AppError('Please wait before requesting a new OTP', 429));
  }

  const otpCode = generateOtp();
  const otpHash = crypto.createHash('sha256').update(otpCode).digest('hex');
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  await Otp.destroy({ where: { identifier: normalizedIdentifier, type: 'email' } });
  await Otp.create({
    identifier: normalizedIdentifier,
    type: 'email',
    code: otpHash,
    userId: user.id,
    expiresAt,
  });

  await sendEmail(
    normalizedIdentifier,
    'Your OTP Code',
    `<p>Your OTP code is: <strong>${otpCode}</strong>. It expires in 5 minutes.</p>`
  );

  res.json({
    message: 'OTP sent successfully to your email',
    expiresIn: 300,
  });
});

exports.verifyOtp = catchAsync(async (req, res, next) => {
  const { identifier, otp } = req.body;
  const normalizedIdentifier = identifier.toLowerCase().trim();
  const otpHash = crypto.createHash('sha256').update(otp).digest('hex');

  const otpRecord = await Otp.findOne({
    where: {
      identifier: normalizedIdentifier,
      type: 'email',
      code: otpHash,
      expiresAt: { [Op.gt]: new Date() },
    },
  });

  if (!otpRecord) {
    return next(new AppError('Invalid or expired OTP', 400));
  }

  const user = await User.findOne({ where: { email: normalizedIdentifier } });
  if (!user) {
    return next(new AppError('No account found with this email', 404));
  }

  user.isVerified = true;
  await user.save();

  await otpRecord.destroy(); // remove used OTP

  const token = signToken(user.id);
  const refreshToken = signRefreshToken(user.id);

  res.json({
    token,
    refreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  const normalizedEmail = email.toLowerCase().trim();

  const user = await User.scope('withPassword').findOne({ where: { email: normalizedEmail } });
  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  if (!user.isVerified) {
    return next(new AppError('Please verify your email before logging in', 403));
  }

  const token = signToken(user.id);
  const refreshToken = signRefreshToken(user.id);

  res.json({
    token,
    refreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

exports.logout = catchAsync(async (req, res, next) => {
  // In stateless JWT, just inform client to delete token
  res.json({ message: 'Logged out successfully' });
});

exports.getMe = catchAsync(async (req, res, next) => {
  res.json(req.user);
});

exports.refreshToken = catchAsync(async (req, res, next) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return next(new AppError('Refresh token required', 400));
  }

  try {
    const decoded = jwt.verify(refreshToken, jwtRefreshSecret);
    const newToken = signToken(decoded.id);
    res.json({ token: newToken });
  } catch (error) {
    return next(new AppError('Invalid or expired refresh token', 401));
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ where: { email: normalizedEmail } });
  if (!user) {
    return res.json({ message: 'If an account exists, a reset OTP has been sent.' });
  }

  const otpCode = generateOtp();
  const otpHash = crypto.createHash('sha256').update(otpCode).digest('hex');
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await Otp.destroy({ where: { identifier: normalizedEmail, type: 'email' } });
  await Otp.create({
    identifier: normalizedEmail,
    type: 'email',
    code: otpHash,
    userId: user.id,
    expiresAt,
  });

  await sendEmail(
    normalizedEmail,
    'Password reset OTP',
    `<p>Your password reset OTP is: <strong>${otpCode}</strong>. It expires in 5 minutes.</p>`
  );

  res.json({ message: 'If an account exists, a reset OTP has been sent.' });
});
