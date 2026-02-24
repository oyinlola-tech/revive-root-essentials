const buckets = new Map();

const rateLimit = ({ windowMs, max, message }) => (req, res, next) => {
  const key = `${req.ip}:${req.baseUrl || req.path}`;
  const now = Date.now();
  const current = buckets.get(key);

  if (!current || current.expiresAt < now) {
    buckets.set(key, { count: 1, expiresAt: now + windowMs });
    return next();
  }

  if (current.count >= max) {
    return res.status(429).json({
      error: true,
      message: message || 'Too many requests. Please try again later.',
    });
  }

  current.count += 1;
  return next();
};

module.exports = rateLimit;

