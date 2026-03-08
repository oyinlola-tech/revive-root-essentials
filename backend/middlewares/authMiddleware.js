const jwt = require('jsonwebtoken');
const { User } = require('../models');
const AppError = require('../utils/AppError');
const { jwtSecret } = require('../config/auth');
const Logger = require('../utils/Logger');
const { tokenBlacklist } = require('../utils/securityUtils');

const logger = new Logger('Middleware:Auth');

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('You are not logged in. Please log in to access this resource.', 401));
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, jwtSecret, { algorithms: ['HS256'] });
    } catch (verifyError) {
      if (verifyError.name === 'JsonWebTokenError') {
        logger.warn('Invalid token attempt', { ip: req.ip, path: req.path });
        return next(new AppError('Invalid token. Please log in again.', 401));
      } else if (verifyError.name === 'TokenExpiredError') {
        logger.warn('Expired token attempt', { ip: req.ip, path: req.path });
        return next(new AppError('Your token has expired. Please log in again.', 401));
      }
      throw verifyError;
    }

    const isBlacklisted = await tokenBlacklist.isBlacklisted(token);
    if (isBlacklisted) {
      logger.warn('Blacklisted token attempt', { ip: req.ip, path: req.path });
      return next(new AppError('Session expired. Please log in again.', 401));
    }

    // Check if user still exists
    const user = await User.findByPk(decoded.id);
    if (!user) {
      logger.warn('User not found for valid token', { userId: decoded.id, ip: req.ip });
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    // Verify session ID hasn't been invalidated
    if (!decoded.sessionId || !user.currentSessionId || decoded.sessionId !== user.currentSessionId) {
      logger.warn('Session invalidated', { userId: user.id, ip: req.ip });
      return next(new AppError('Session invalidated. Please log in again.', 401));
    }

    // Check if user account is active (future enhancement)
    if (user.isDeleted || user.isBanned) {
      logger.warn('Access attempt with inactive account', { userId: user.id, ip: req.ip });
      return next(new AppError('Your account is not active.', 401));
    }

    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    logger.error('Auth middleware error', error, { ip: req.ip });
    next(error);
  }
};

module.exports = { protect };
