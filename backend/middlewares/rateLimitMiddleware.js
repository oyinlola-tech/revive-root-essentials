const buckets = new Map();
let lastCleanup = 0;

const cleanupExpiredBuckets = (now) => {
  if (now - lastCleanup < 60 * 1000) return;
  lastCleanup = now;

  for (const [key, value] of buckets.entries()) {
    if (value.expiresAt <= now) {
      buckets.delete(key);
    }
  }
};

const rateLimit = ({ windowMs, max, message }) => (req, res, next) => {
  const key = `${req.ip}:${req.baseUrl || req.path}`;
  const now = Date.now();
  cleanupExpiredBuckets(now);

  const current = buckets.get(key);

  if (!current || current.expiresAt < now) {
    const expiresAt = now + windowMs;
    buckets.set(key, { count: 1, expiresAt });
    res.setHeader('X-RateLimit-Limit', String(max));
    res.setHeader('X-RateLimit-Remaining', String(max - 1));
    return next();
  }

  if (current.count >= max) {
    const retryAfter = Math.max(1, Math.ceil((current.expiresAt - now) / 1000));
    res.setHeader('Retry-After', String(retryAfter));
    res.setHeader('X-RateLimit-Limit', String(max));
    res.setHeader('X-RateLimit-Remaining', '0');
    return res.status(429).json({
      error: true,
      message: message || 'Too many requests. Please try again later.',
    });
  }

  current.count += 1;
  res.setHeader('X-RateLimit-Limit', String(max));
  res.setHeader('X-RateLimit-Remaining', String(Math.max(0, max - current.count)));
  return next();
};

module.exports = rateLimit;
