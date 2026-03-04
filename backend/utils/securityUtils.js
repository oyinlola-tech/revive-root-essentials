const crypto = require('crypto');
const { ensureRedisConnection } = require('../config/redis');
const Logger = require('./Logger');

const logger = new Logger('SecurityUtils');

/**
 * Generate a secure random token
 * @param {number} bytes - Number of bytes for the token (default: 32)
 * @returns {string} Hex-encoded random token
 */
const generateSecureToken = (bytes = 32) => {
  return crypto.randomBytes(bytes).toString('hex');
};

/**
 * Hash a password using bcrypt (note: requires bcryptjs)
 * @param {string} password - Plain text password
 * @param {number} saltRounds - Salt rounds for bcrypt (default: 12)
 * @returns {Promise<string>} Hashed password
 */
const hashPassword = async (password, saltRounds = 12) => {
  const bcrypt = require('bcryptjs');
  return bcrypt.hash(password, saltRounds);
};

/**
 * Compare a plain text password with a hash
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {Promise<boolean>} True if password matches hash
 */
const comparePassword = async (password, hash) => {
  const bcrypt = require('bcryptjs');
  return bcrypt.compare(password, hash);
};

/**
 * Sanitize user input to prevent XSS
 * @param {string} input - User input
 * @returns {string} Sanitized input
 */
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .trim()
    .slice(0, 5000); // Limit length
};

/**
 * Validate and sanitize email
 * @param {string} email - Email to validate
 * @returns {string|null} Validated email or null if invalid
 */
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return null;
  return email.toLowerCase().trim();
};

/**
 * Create a timing-safe comparison for sensitive strings
 * @param {string} a - First string
 * @param {string} b - Second string
 * @returns {boolean} True if strings match
 */
const timingSafeEqual = (a, b) => {
  try {
    const bufferA = Buffer.from(String(a || ''));
    const bufferB = Buffer.from(String(b || ''));
    if (bufferA.length !== bufferB.length) return false;
    return crypto.timingSafeEqual(bufferA, bufferB);
  } catch {
    return false;
  }
};

/**
 * Generate CSRF token
 * @returns {string} CSRF token
 */
const generateCsrfToken = () => {
  return generateSecureToken(32);
};

/**
 * Validate IP address format
 * @param {string} ip - IP address to validate
 * @returns {boolean} True if valid IPv4 or IPv6
 */
const validateIp = (ip) => {
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  const ipv6Regex = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/;
  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
};

/**
 * Generate request fingerprint for security
 * @param {object} req - Express request object
 * @returns {string} Fingerprint hash
 */
const generateRequestFingerprint = (req) => {
  const userAgent = req.get('user-agent') || '';
  const acceptLanguage = req.get('accept-language') || '';
  const ip = req.ip || '';
  const fingerprint = `${userAgent}|${acceptLanguage}|${ip}`;
  return crypto.createHash('sha256').update(fingerprint).digest('hex');
};

/**
 * Brute force protection for login attempts
 * Tracks failed attempts per email and locks account after threshold
 */
class BruteForceProtector {
  constructor() {
    this.redis = null;
    this.maxAttempts = 5;
    this.lockoutDuration = 15 * 60 * 1000; // 15 minutes
  }

  async init() {
    this.redis = await ensureRedisConnection();
  }

  /**
   * Record a failed login attempt
   */
  async recordFailedAttempt(email) {
    if (!this.redis) return false;

    const key = `login:attempts:${email}`;
    const lockKey = `login:locked:${email}`;

    try {
      const attempts = await this.redis.incr(key);
      await this.redis.expire(key, 900); // 15 minutes

      if (attempts >= this.maxAttempts) {
        await this.redis.setex(lockKey, Math.ceil(this.lockoutDuration / 1000), '1');
        logger.warn(`Account locked due to brute force: ${email}`, { attempts });
        return { locked: true, attempts };
      }

      return { locked: false, attempts, remaining: this.maxAttempts - attempts };
    } catch (error) {
      logger.error('Failed to record login attempt', error, { email });
      return false;
    }
  }

  /**
   * Check if account is locked
   */
  async isLocked(email) {
    if (!this.redis) return false;

    const lockKey = `login:locked:${email}`;
    try {
      const locked = await this.redis.exists(lockKey);
      return Boolean(locked);
    } catch (error) {
      logger.error('Failed to check account lock status', error, { email });
      return false;
    }
  }

  /**
   * Reset failed attempts on successful login
   */
  async resetAttempts(email) {
    if (!this.redis) return false;

    const key = `login:attempts:${email}`;
    try {
      await this.redis.del(key);
      return true;
    } catch (error) {
      logger.error('Failed to reset login attempts', error, { email });
      return false;
    }
  }

  /**
   * Clear lock
   */
  async clearLock(email) {
    if (!this.redis) return false;

    const lockKey = `login:locked:${email}`;
    try {
      await this.redis.del(lockKey);
      return true;
    } catch (error) {
      logger.error('Failed to clear account lock', error, { email });
      return false;
    }
  }

  /**
   * Get attempt information
   */
  async getAttempts(email) {
    if (!this.redis) return null;

    const key = `login:attempts:${email}`;
    try {
      const attempts = await this.redis.get(key);
      return attempts ? parseInt(attempts, 10) : 0;
    } catch (error) {
      logger.error('Failed to get login attempts', error, { email });
      return null;
    }
  }
}

/**
 * Token blacklist for logout
 * Stores tokens that should be considered invalid
 */
class TokenBlacklist {
  constructor() {
    this.redis = null;
  }

  async init() {
    this.redis = await ensureRedisConnection();
  }

  /**
   * Add token to blacklist
   */
  async blacklistToken(token, expiresIn) {
    if (!this.redis || !token) return false;

    try {
      const key = `token:blacklist:${token}`;
      const ttl = Math.ceil(expiresIn / 1000); // Convert to seconds
      await this.redis.setex(key, ttl, '1');
      logger.debug('Token blacklisted', { expiresIn });
      return true;
    } catch (error) {
      logger.error('Failed to blacklist token', error);
      return false;
    }
  }

  /**
   * Check if token is blacklisted
   */
  async isBlacklisted(token) {
    if (!this.redis || !token) return false;

    try {
      const key = `token:blacklist:${token}`;
      const exists = await this.redis.exists(key);
      return Boolean(exists);
    } catch (error) {
      logger.error('Failed to check token blacklist', error);
      return false;
    }
  }
}

/**
 * Validate phone number (basic)
 */
const isValidPhone = (phone) => {
  const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
  return phoneRegex.test(String(phone || '').replace(/\s/g, ''));
};

/**
 * Validate URL
 */
const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate file upload
 */
const isValidFileUpload = (file, options = {}) => {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  } = options;

  if (!file) return false;
  if (file.size > maxSize) return false;
  if (!allowedMimes.includes(file.mimetype)) return false;

  return true;
};

// Initialize singletons on module load
const bruteForceProtector = new BruteForceProtector();
const tokenBlacklist = new TokenBlacklist();

bruteForceProtector.init().catch((error) => {
  logger.error('Failed to initialize brute force protector', error);
});

tokenBlacklist.init().catch((error) => {
  logger.error('Failed to initialize token blacklist', error);
});

module.exports = {
  generateSecureToken,
  hashPassword,
  comparePassword,
  sanitizeInput,
  validateEmail,
  timingSafeEqual,
  generateCsrfToken,
  validateIp,
  generateRequestFingerprint,
  isValidPhone,
  isValidUrl,
  isValidFileUpload,
  bruteForceProtector,
  tokenBlacklist,
};
