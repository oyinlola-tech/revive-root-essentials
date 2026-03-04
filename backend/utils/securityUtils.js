const crypto = require('crypto');

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
};
