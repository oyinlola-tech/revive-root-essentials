const Logger = require('../utils/Logger');
const { generateCsrfToken, timingSafeEqual } = require('../utils/securityUtils');

const logger = new Logger('Middleware:Security');

const CSRF_TOKEN_HEADER = 'x-csrf-token';
const CSRF_COOKIE_NAME = '__csrf_token';
const CSRF_TOKEN_TTL_MS = 60 * 60 * 1000;

// In-memory CSRF token storage with expiry.
const csrfTokens = new Map();

const purgeExpiredCsrfTokens = (now = Date.now()) => {
  for (const [token, expiresAt] of csrfTokens) {
    if (expiresAt <= now) csrfTokens.delete(token);
  }
};

const getCsrfCookieToken = (req) => {
  if (req.signedCookies && req.signedCookies[CSRF_COOKIE_NAME]) {
    return req.signedCookies[CSRF_COOKIE_NAME];
  }
  return req.cookies ? req.cookies[CSRF_COOKIE_NAME] : undefined;
};

const buildCsrfCookieOptions = () => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    maxAge: CSRF_TOKEN_TTL_MS,
    path: '/api',
  };

  if (process.env.COOKIE_SECRET) cookieOptions.signed = true;

  return cookieOptions;
};

/**
 * Middleware to generate CSRF tokens for protected operations
 */
const csrfProtectionMiddleware = (req, res, next) => {
  purgeExpiredCsrfTokens();

  if (req.method === 'GET') {
    const now = Date.now();
    const existingToken = getCsrfCookieToken(req);
    const existingExpiry = existingToken ? csrfTokens.get(existingToken) : null;
    const token = existingToken && existingExpiry && existingExpiry > now
      ? existingToken
      : generateCsrfToken();
    csrfTokens.set(token, now + CSRF_TOKEN_TTL_MS);
    res.setHeader('X-CSRF-Token', token);
    res.cookie(CSRF_COOKIE_NAME, token, buildCsrfCookieOptions());
    return next();
  }

  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    if (req.path.includes('/webhook') || req.path.includes('/flutterwave')) {
      return next();
    }

    const token = req.get(CSRF_TOKEN_HEADER) || (req.body && req.body._csrf);
    const cookieToken = getCsrfCookieToken(req);

    if (!token || !cookieToken) {
      logger.warn('CSRF token missing', {
        path: req.path,
        method: req.method,
        ip: req.ip,
      });
      return res.status(403).json({
        error: true,
        message: 'CSRF token missing or invalid',
      });
    }

    const tokenExpiry = csrfTokens.get(token);
    if (!tokenExpiry || tokenExpiry <= Date.now() || !timingSafeEqual(token, cookieToken)) {
      logger.warn('CSRF token validation failed', {
        path: req.path,
        method: req.method,
        ip: req.ip,
      });
      return res.status(403).json({
        error: true,
        message: 'CSRF token invalid',
      });
    }

    csrfTokens.delete(token);
  }

  next();
};

/**
 * Middleware to add additional security headers
 */
const additionalSecurityHeadersMiddleware = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('X-Frame-Options', 'DENY');

  if (req.path.includes('/api/') && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }

  res.setHeader(
    'Permissions-Policy',
    'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()'
  );

  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  next();
};

/**
 * Middleware to block prototype pollution keys in query/body payloads.
 */
const suspiciousActivityDetectionMiddleware = (req, res, next) => {
  const dangerousKeys = new Set(['__proto__', 'constructor', 'prototype']);

  const hasDangerousKey = (value) => {
    if (!value || typeof value !== 'object') return false;
    if (Array.isArray(value)) {
      return value.some((item) => hasDangerousKey(item));
    }

    for (const key of Object.keys(value)) {
      if (dangerousKeys.has(key) || hasDangerousKey(value[key])) {
        return true;
      }
    }
    return false;
  };

  if (hasDangerousKey(req.query) || hasDangerousKey(req.body)) {
    logger.warn('Blocked request containing dangerous object keys', {
      path: req.path,
      method: req.method,
      ip: req.ip,
    });
    return res.status(400).json({
      error: true,
      message: 'Invalid request payload',
    });
  }

  next();
};

module.exports = {
  csrfProtectionMiddleware,
  additionalSecurityHeadersMiddleware,
  suspiciousActivityDetectionMiddleware,
};
