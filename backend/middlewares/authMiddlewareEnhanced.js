const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const { jwtSecret } = require('../config/auth');
const { bruteForceProtector, tokenBlacklist } = require('../utils/securityUtils');
const Logger = require('../utils/Logger');

const logger = new Logger('AuthMiddleware');

/**
 * Enhanced authentication middleware
 * - Verifies JWT token
 * - Checks token blacklist (for logout)
 * - Validates session
 */
exports.authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

    if (!token) {
      return next(new AppError('Authentication token required', 401));
    }

    // Check if token is blacklisted (user logged out)
    const isBlacklisted = await tokenBlacklist.isBlacklisted(token);
    if (isBlacklisted) {
      return next(new AppError('Session expired. Please log in again.', 401));
    }

    let decoded;
    try {
      decoded = jwt.verify(token, jwtSecret);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return next(new AppError('Token expired. Please refresh.', 401));
      }
      return next(new AppError('Invalid token', 401));
    }

    // Find user and verify session ID
    const { User } = require('../models');
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Verify session is still active
    if (user.currentSessionId !== decoded.sessionId) {
      return next(new AppError('Session invalidated. Please log in again.', 401));
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    logger.error('Authentication error', error);
    next(new AppError('Authentication failed', 500));
  }
};

/**
 * Role-based access control
 */
exports.authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      logger.warn(`Unauthorized access attempt: ${req.user.id} (${req.user.role})`, {
        requiredRoles: allowedRoles,
        method: req.method,
        path: req.path,
      });
      return next(new AppError('You do not have permission to access this resource', 403));
    }

    next();
  };
};

/**
 * Middleware for login endpoints
 * - Checks for brute force attempts
 * - Locks account after multiple failed attempts
 */
exports.checkBruteForce = async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new AppError('Email is required', 400));
  }

  const isLocked = await bruteForceProtector.isLocked(email);
  if (isLocked) {
    logger.warn(`Login attempt on locked account: ${email}`);
    return next(new AppError('Account temporarily locked due to too many failed attempts. Try again in 15 minutes.', 429));
  }

  next();
};

/**
 * Middleware to verify superadmin role
 */
exports.requireSuperadmin = (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Authentication required', 401));
  }

  if (req.user.role !== 'superadmin') {
    logger.warn(`Superadmin access denied: ${req.user.id}`, {
      userRole: req.user.role,
      method: req.method,
      path: req.path,
    });
    return next(new AppError('This action requires superadmin privileges', 403));
  }

  next();
};

/**
 * Middleware to verify admin or superadmin role
 */
exports.requireAdmin = (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Authentication required', 401));
  }

  if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
    logger.warn(`Admin access denied: ${req.user.id}`, {
      userRole: req.user.role,
      method: req.method,
      path: req.path,
    });
    return next(new AppError('This action requires admin or superadmin privileges', 403));
  }

  next();
};

/**
 * Optional authentication middleware
 * - Authenticates if token is provided
 * - Does not fail if no token (allows anonymous access)
 */
exports.optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

    if (!token) {
      return next();
    }

    // Check if token is blacklisted
    const isBlacklisted = await tokenBlacklist.isBlacklisted(token);
    if (isBlacklisted) {
      return next(); // Treat as unauthenticated
    }

    let decoded;
    try {
      decoded = jwt.verify(token, jwtSecret);
    } catch {
      return next(); // Treat as unauthenticated
    }

    const { User } = require('../models');
    const user = await User.findByPk(decoded.id);

    if (user && user.currentSessionId === decoded.sessionId) {
      req.user = user;
      req.token = token;
    }

    next();
  } catch (error) {
    logger.error('Optional auth error', error);
    next(); // Continue without authentication on error
  }
};
