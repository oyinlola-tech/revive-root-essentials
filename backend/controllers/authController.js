const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Op } = require('sequelize');
const { OAuth2Client } = require('google-auth-library');
const jwksClient = require('jwks-rsa');
const { User, Otp } = require('../models');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const generateOtp = require('../utils/generateOtp');
const notificationService = require('../services/notificationService');
const { jwtSecret, jwtExpiresIn, jwtRefreshSecret, jwtRefreshExpiresIn } = require('../config/auth');

const normalizeIdentifier = (identifier, type) => {
  if (type === 'email') return String(identifier || '').toLowerCase().trim();
  return String(identifier || '').trim();
};

const normalizeEmail = (email) => String(email || '').toLowerCase().trim();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || '');
const appleKeysClient = jwksClient({
  jwksUri: 'https://appleid.apple.com/auth/keys',
  cache: true,
  rateLimit: true,
});

const signToken = (id, sessionId) => {
  return jwt.sign({ id, sessionId }, jwtSecret, { expiresIn: jwtExpiresIn });
};

const signRefreshToken = (id, sessionId) => {
  return jwt.sign({ id, sessionId }, jwtRefreshSecret, { expiresIn: jwtRefreshExpiresIn });
};

const createSession = async (user) => {
  user.currentSessionId = crypto.randomUUID();
  await user.save();
  return user.currentSessionId;
};

const getAppleSigningKey = (header, callback) => {
  appleKeysClient.getSigningKey(header.kid, (error, key) => {
    if (error) return callback(error);
    callback(null, key.getPublicKey());
  });
};

const verifyAppleIdToken = async (idToken) => {
  if (!process.env.APPLE_CLIENT_ID) {
    throw new AppError('Apple OAuth is not configured on the server', 500);
  }

  return new Promise((resolve, reject) => {
    jwt.verify(
      idToken,
      getAppleSigningKey,
      {
        algorithms: ['RS256'],
        issuer: 'https://appleid.apple.com',
        audience: process.env.APPLE_CLIENT_ID,
      },
      (error, decoded) => {
        if (error) return reject(new AppError('Invalid Apple identity token', 401));
        resolve(decoded);
      },
    );
  });
};

const buildAuthPayload = async (user) => {
  const sessionId = await createSession(user);
  return {
    token: signToken(user.id, sessionId),
    refreshToken: signRefreshToken(user.id, sessionId),
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatarUrl || undefined,
    },
  };
};

const findOrCreateOAuthUser = async ({
  provider,
  subject,
  email,
  name,
  avatarUrl,
  acceptedTerms,
  acceptedMarketing,
  acceptedNewsletter,
}) => {
  const normalizedEmail = normalizeEmail(email);
  const oauthSubject = `${provider}:${subject}`;

  let user = await User.findOne({ where: { oauthSubject } });
  if (!user && normalizedEmail) {
    user = await User.findOne({ where: { email: normalizedEmail } });
  }

  const newsletterOptIn = Boolean(acceptedNewsletter);

  if (!user) {
    if (!normalizedEmail) {
      throw new AppError('Apple did not return an email. Sign in first on the same Apple account or provide email scope.', 400);
    }

    if (!acceptedTerms) {
      throw new AppError('Accept Terms and Conditions to create an account with social login', 400);
    }

    user = await User.create({
      name: name || normalizedEmail.split('@')[0] || 'New User',
      email: normalizedEmail,
      isVerified: true,
      authProvider: provider,
      oauthProvider: provider,
      oauthSubject,
      avatarUrl: avatarUrl || null,
      acceptedTerms: true,
      termsAcceptedAt: new Date(),
      acceptedMarketing: Boolean(acceptedMarketing),
      acceptedNewsletter: newsletterOptIn,
      newsletterUnsubscribedAt: newsletterOptIn ? null : new Date(),
    });

    return { user, isNewUser: true };
  }

  user.isVerified = true;
  if (!user.oauthSubject) {
    user.oauthSubject = oauthSubject;
    user.oauthProvider = provider;
  }
  if (!user.authProvider || user.authProvider === 'local') {
    user.authProvider = provider;
  }
  if (!user.avatarUrl && avatarUrl) {
    user.avatarUrl = avatarUrl;
  }
  await user.save();

  return { user, isNewUser: false };
};

exports.register = catchAsync(async (req, res, next) => {
  const {
    name,
    email,
    phone,
    password,
    acceptedTerms,
    acceptedMarketing = false,
    acceptedNewsletter = false,
  } = req.body;
  const normalizedEmail = String(email || '').toLowerCase().trim();

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
    authProvider: 'local',
    acceptedTerms: Boolean(acceptedTerms),
    termsAcceptedAt: acceptedTerms ? new Date() : null,
    acceptedMarketing: Boolean(acceptedMarketing),
    acceptedNewsletter: Boolean(acceptedNewsletter),
    newsletterUnsubscribedAt: acceptedNewsletter ? null : new Date(),
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

  await notificationService.sendOtpNotification({
    channel: 'email',
    recipient: normalizedEmail,
    name,
    code: otpCode,
    expiresMinutes: 5,
  });

  res.status(201).json({
    message: 'Registration successful. OTP sent to your email.',
    verificationRequired: true,
  });
});

exports.sendOtp = catchAsync(async (req, res, next) => {
  const { identifier, type = 'email' } = req.body;
  const normalizedIdentifier = normalizeIdentifier(identifier, type);

  const userWhere = type === 'email' ? { email: normalizedIdentifier } : { phone: normalizedIdentifier };
  const user = await User.findOne({ where: userWhere });
  if (!user) {
    return next(new AppError(`No account found with this ${type}`, 404));
  }

  const recentOtp = await Otp.findOne({
    where: {
      identifier: normalizedIdentifier,
      type,
      createdAt: { [Op.gt]: new Date(Date.now() - 60 * 1000) },
    },
  });

  if (recentOtp) {
    return next(new AppError('Please wait before requesting a new OTP', 429));
  }

  const otpCode = generateOtp();
  const otpHash = crypto.createHash('sha256').update(otpCode).digest('hex');
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  await Otp.destroy({ where: { identifier: normalizedIdentifier, type } });
  await Otp.create({
    identifier: normalizedIdentifier,
    type,
    code: otpHash,
    userId: user.id,
    expiresAt,
  });

  await notificationService.sendOtpNotification({
    channel: type,
    recipient: normalizedIdentifier,
    name: user.name,
    code: otpCode,
    expiresMinutes: 5,
  });

  res.json({
    message: `OTP sent successfully to your ${type}`,
    expiresIn: 300,
  });
});

exports.verifyOtp = catchAsync(async (req, res, next) => {
  const { identifier, otp } = req.body;
  const normalizedIdentifier = String(identifier || '').trim();
  if (!/^\d{6}$/.test(String(otp || ''))) {
    return next(new AppError('Invalid OTP format', 400));
  }
  const otpHash = crypto.createHash('sha256').update(otp).digest('hex');

  const otpRecord = await Otp.findOne({
    where: {
      identifier: {
        [Op.in]: [normalizedIdentifier, normalizedIdentifier.toLowerCase()],
      },
      code: otpHash,
      expiresAt: { [Op.gt]: new Date() },
    },
  });

  if (!otpRecord) {
    return next(new AppError('Invalid or expired OTP', 400));
  }

  const user = await User.findOne({
    where: otpRecord.type === 'phone'
      ? { phone: otpRecord.identifier }
      : { email: otpRecord.identifier.toLowerCase() },
  });
  if (!user) {
    return next(new AppError('No account found for this OTP request', 404));
  }

  const wasUnverified = !user.isVerified;
  user.isVerified = true;
  await user.save();

  await otpRecord.destroy(); // remove used OTP

  const sessionId = await createSession(user);
  const token = signToken(user.id, sessionId);
  const refreshToken = signRefreshToken(user.id, sessionId);

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

  if (wasUnverified) {
    notificationService.sendWelcomeEmail(user).catch(() => {});
  }
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  const normalizedEmail = String(email || '').toLowerCase().trim();

  const user = await User.scope('withPassword').findOne({ where: { email: normalizedEmail } });
  if (!user) {
    return next(new AppError('Incorrect email or password', 401));
  }

  if (!user.passwordHash) {
    return next(new AppError('This account uses social login. Please continue with Google or Apple.', 401));
  }

  if (!(await user.comparePassword(password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  if (!user.isVerified) {
    return next(new AppError('Please verify your email before logging in', 403));
  }

  const payload = await buildAuthPayload(user);

  res.json(payload);

  notificationService.sendLoginAlert(user, {
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    time: new Date().toLocaleString(),
  }).catch(() => {});
});

exports.oauthGoogle = catchAsync(async (req, res, next) => {
  const {
    idToken,
    acceptedTerms = false,
    acceptedMarketing = false,
    acceptedNewsletter = false,
  } = req.body;

  if (!idToken) {
    return next(new AppError('Google identity token is required', 400));
  }
  if (!process.env.GOOGLE_CLIENT_ID) {
    return next(new AppError('Google OAuth is not configured on the server', 500));
  }

  let profile;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    profile = ticket.getPayload();
  } catch (error) {
    return next(new AppError('Invalid Google identity token', 401));
  }

  if (!profile?.email) {
    return next(new AppError('Google account email is required', 400));
  }

  const { user, isNewUser } = await findOrCreateOAuthUser({
    provider: 'google',
    subject: profile.sub,
    email: profile.email,
    name: profile.name,
    avatarUrl: profile.picture,
    acceptedTerms: Boolean(acceptedTerms),
    acceptedMarketing: Boolean(acceptedMarketing),
    acceptedNewsletter: Boolean(acceptedNewsletter),
  });

  const payload = await buildAuthPayload(user);
  res.json(payload);

  if (isNewUser) {
    notificationService.sendWelcomeEmail(user).catch(() => {});
  }
});

exports.oauthApple = catchAsync(async (req, res, next) => {
  const {
    idToken,
    name,
    acceptedTerms = false,
    acceptedMarketing = false,
    acceptedNewsletter = false,
  } = req.body;

  if (!idToken) {
    return next(new AppError('Apple identity token is required', 400));
  }

  const profile = await verifyAppleIdToken(idToken);

  if (!profile?.sub) {
    return next(new AppError('Invalid Apple profile', 401));
  }

  const { user, isNewUser } = await findOrCreateOAuthUser({
    provider: 'apple',
    subject: profile.sub,
    email: profile.email,
    name,
    avatarUrl: null,
    acceptedTerms: Boolean(acceptedTerms),
    acceptedMarketing: Boolean(acceptedMarketing),
    acceptedNewsletter: Boolean(acceptedNewsletter),
  });

  const payload = await buildAuthPayload(user);
  res.json(payload);

  if (isNewUser) {
    notificationService.sendWelcomeEmail(user).catch(() => {});
  }
});

exports.logout = catchAsync(async (req, res, next) => {
  req.user.currentSessionId = null;
  await req.user.save();
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
    const user = await User.findByPk(decoded.id);
    if (!user || !user.currentSessionId || user.currentSessionId !== decoded.sessionId) {
      return next(new AppError('Session expired. Please log in again.', 401));
    }

    const newToken = signToken(decoded.id, decoded.sessionId);
    res.json({ token: newToken });
  } catch (error) {
    return next(new AppError('Invalid or expired refresh token', 401));
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const normalizedEmail = String(email || '').toLowerCase().trim();
  if (!normalizedEmail) {
    return next(new AppError('Email is required', 400));
  }
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

  await notificationService.sendOtpNotification({
    channel: 'email',
    recipient: normalizedEmail,
    name: user.name,
    code: otpCode,
    expiresMinutes: 5,
  });

  res.json({ message: 'If an account exists, a reset OTP has been sent.' });
});
