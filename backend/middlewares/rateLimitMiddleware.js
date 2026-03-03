const { ensureRedisConnection } = require('../config/redis');

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

const rateLimit = ({ windowMs, max, message }) => async (req, res, next) => {
  const key = `${req.ip}:${req.baseUrl || req.path}`;
  const now = Date.now();
  const redis = await ensureRedisConnection();

  if (redis) {
    try {
      const redisKey = `rl:${key}`;
      const count = await redis.incr(redisKey);
      if (count === 1) {
        await redis.pexpire(redisKey, windowMs);
      }
      const ttlMs = Math.max(0, await redis.pttl(redisKey));

      res.setHeader('X-RateLimit-Limit', String(max));
      res.setHeader('X-RateLimit-Remaining', String(Math.max(0, max - count)));

      if (count > max) {
        const retryAfter = Math.max(1, Math.ceil(ttlMs / 1000));
        res.setHeader('Retry-After', String(retryAfter));
        return res.status(429).json({
          error: true,
          message: message || 'Too many requests. Please try again later.',
        });
      }

      return next();
    } catch (error) {
      // Fallback to in-process limiter on redis failures.
    }
  }

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
