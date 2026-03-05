const Logger = require('../utils/Logger');
const { generateCsrfToken, timingSafeEqual } = require('../utils/securityUtils');

const logger = new Logger('Middleware:Security');

const CSRF_TOKEN_HEADER = 'x-csrf-token';
const CSRF_COOKIE_NAME = '__csrf_token';

// In-memory storage for CSRF tokens (in production, use Redis)
const csrfTokens = new Set();

/**
 * Middleware to generate CSRF tokens for protected operations
 */
const csrfProtectionMiddleware = (req, res, next) => {
  // Generate token for GET requests
  if (req.method === 'GET') {
    const token = generateCsrfToken();
    csrfTokens.add(token);
    res.setHeader('X-CSRF-Token', token);
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600000, // 1 hour
    };

    // If cookie signing is enabled, sign the CSRF cookie too.
    if (process.env.COOKIE_SECRET) cookieOptions.signed = true;

    res.cookie(CSRF_COOKIE_NAME, token, cookieOptions);
    return next();
  }

  // Verify token for unsafe methods
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    // Skip CSRF check for webhook endpoints
    if (req.path.includes('/webhook') || req.path.includes('/flutterwave')) {
      return next();
    }

    const token = req.get(CSRF_TOKEN_HEADER) || req.body._csrf;
    const cookieToken = req.cookies[CSRF_COOKIE_NAME];

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

    if (!timingSafeEqual(token, cookieToken) || !csrfTokens.has(token)) {
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

    csrfTokens.delete(token); // One-time use token
  }

  next();
};

/**
 * Middleware to add additional security headers
 */
const additionalSecurityHeadersMiddleware = (req, res, next) => {
  // Content Security Policy
  // Content Security Policy is handled by Helmet; don't set it here to avoid header conflicts.

  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Clickjacking protection
  res.setHeader('X-Frame-Options', 'DENY');

  // Disable client-side caching for sensitive content
  if (req.path.includes('/api/') && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }

  // Feature-Policy / Permissions-Policy
  res.setHeader(
    'Permissions-Policy',
    'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()'
  );

  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  next();
};

/**
 * Middleware to detect and log suspicious activity
 */
const suspiciousActivityDetectionMiddleware = (req, res, next) => {
  const suspiciousPatterns = [
    /('|"|;|--|\/\*|\*\/|xp_|sp_|exec|execute|script|javascript|onerror|onclick)/i, // SQL injection & XSS
    /\.\.\//g, // Path traversal
    /(<|>)/g, // HTML tags
  ];

  const checkString = (str) => {
    if (typeof str !== 'string') return false;
    return suspiciousPatterns.some(pattern => pattern.test(str));
  };

  // Check query string
  for (const key in req.query) {
    if (checkString(String(req.query[key]))) {
      logger.warn('Suspicious activity detected in query', {
        path: req.path,
        ip: req.ip,
        key,
      });
      return res.status(400).json({
        error: true,
        message: 'Invalid request parameters',
      });
    }
  }

  // Check request body
  if (req.body && typeof req.body === 'object') {
    const checkObject = (obj) => {
      for (const key in obj) {
        const value = obj[key];
        if (checkString(String(value))) {
          logger.warn('Suspicious activity detected in body', {
            path: req.path,
            ip: req.ip,
            key,
          });
          return true;
        }
        if (typeof value === 'object' && value !== null) {
          if (checkObject(value)) return true;
        }
      }
      return false;
    };

    if (checkObject(req.body)) {
      return res.status(400).json({
        error: true,
        message: 'Invalid request body',
      });
    }
  }

  next();
};

module.exports = {
  csrfProtectionMiddleware,
  additionalSecurityHeadersMiddleware,
  suspiciousActivityDetectionMiddleware,
};
