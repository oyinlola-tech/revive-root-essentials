const { ensureRedisConnection } = require('../config/redis');
const Logger = require('./Logger');

const logger = new Logger('CacheService');

const CACHE_KEYS = {
  PRODUCTS: 'cache:products:',
  PRODUCT_DETAIL: 'cache:product:detail:',
  FEATURED_PRODUCTS: 'cache:featured:products',
  CATEGORIES: 'cache:categories',
  CART: 'cache:cart:',
  WISHLIST: 'cache:wishlist:',
  USER: 'cache:user:',
  ORDERS: 'cache:orders:',
  DASHBOARD_STATS: 'cache:dashboard:stats',
  CURRENCY_RATES: 'cache:currency:rates',
  REVIEWS: 'cache:reviews:',
};

const CACHE_TTL = {
  SHORT: 300, // 5 minutes
  MEDIUM: 3600, // 1 hour
  LONG: 86400, // 24 hours
  VERY_LONG: 604800, // 7 days
};

class CacheService {
  constructor() {
    this.redis = null;
  }

  async init() {
    this.redis = await ensureRedisConnection();
    if (this.redis) {
      logger.info('Cache service initialized with Redis');
    } else {
      logger.warn('Cache service running without Redis - using in-memory fallback');
    }
  }

  async get(key) {
    if (!this.redis) return null;
    
    try {
      const cached = await this.redis.get(key);
      if (cached) {
        logger.debug(`Cache HIT for key: ${key}`);
        return JSON.parse(cached);
      }
      logger.debug(`Cache MISS for key: ${key}`);
      return null;
    } catch (error) {
      logger.error('Cache get error', error, { key });
      return null;
    }
  }

  async set(key, value, ttl = CACHE_TTL.MEDIUM) {
    if (!this.redis) return false;
    
    try {
      await this.redis.setex(key, ttl, JSON.stringify(value));
      logger.debug(`Cache SET for key: ${key} with TTL: ${ttl}`);
      return true;
    } catch (error) {
      logger.error('Cache set error', error, { key, ttl });
      return false;
    }
  }

  async del(key) {
    if (!this.redis) return false;
    
    try {
      await this.redis.del(key);
      logger.debug(`Cache DELETE for key: ${key}`);
      return true;
    } catch (error) {
      logger.error('Cache delete error', error, { key });
      return false;
    }
  }

  async delPattern(pattern) {
    if (!this.redis) return 0;
    
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
        logger.debug(`Cache pattern DELETE: ${pattern} (${keys.length} keys)`);
      }
      return keys.length;
    } catch (error) {
      logger.error('Cache pattern delete error', error, { pattern });
      return 0;
    }
  }

  async clear() {
    if (!this.redis) return false;
    
    try {
      await this.redis.flushdb();
      logger.info('Cache completely cleared');
      return true;
    } catch (error) {
      logger.error('Cache clear error', error);
      return false;
    }
  }

  // Product caching
  async getCachedProducts(page = 1, limit = 20) {
    const key = `${CACHE_KEYS.PRODUCTS}${page}:${limit}`;
    return this.get(key);
  }

  async setCachedProducts(data, page = 1, limit = 20, ttl = CACHE_TTL.MEDIUM) {
    const key = `${CACHE_KEYS.PRODUCTS}${page}:${limit}`;
    return this.set(key, data, ttl);
  }

  async invalidateProducts() {
    return this.delPattern(`${CACHE_KEYS.PRODUCTS}*`);
  }

  // Product detail caching
  async getCachedProductDetail(productId) {
    const key = `${CACHE_KEYS.PRODUCT_DETAIL}${productId}`;
    return this.get(key);
  }

  async setCachedProductDetail(productId, data, ttl = CACHE_TTL.LONG) {
    const key = `${CACHE_KEYS.PRODUCT_DETAIL}${productId}`;
    return this.set(key, data, ttl);
  }

  async invalidateProductDetail(productId) {
    return this.del(`${CACHE_KEYS.PRODUCT_DETAIL}${productId}`);
  }

  // Featured products caching
  async getCachedFeaturedProducts() {
    return this.get(CACHE_KEYS.FEATURED_PRODUCTS);
  }

  async setCachedFeaturedProducts(data, ttl = CACHE_TTL.LONG) {
    return this.set(CACHE_KEYS.FEATURED_PRODUCTS, data, ttl);
  }

  async invalidateFeaturedProducts() {
    return this.del(CACHE_KEYS.FEATURED_PRODUCTS);
  }

  // Categories caching
  async getCachedCategories() {
    return this.get(CACHE_KEYS.CATEGORIES);
  }

  async setCachedCategories(data, ttl = CACHE_TTL.VERY_LONG) {
    return this.set(CACHE_KEYS.CATEGORIES, data, ttl);
  }

  async invalidateCategories() {
    return this.del(CACHE_KEYS.CATEGORIES);
  }

  // Cart caching
  async getCachedCart(userId) {
    const key = `${CACHE_KEYS.CART}${userId}`;
    return this.get(key);
  }

  async setCachedCart(userId, data, ttl = CACHE_TTL.SHORT) {
    const key = `${CACHE_KEYS.CART}${userId}`;
    return this.set(key, data, ttl);
  }

  async invalidateCart(userId) {
    return this.del(`${CACHE_KEYS.CART}${userId}`);
  }

  // Wishlist caching
  async getCachedWishlist(userId) {
    const key = `${CACHE_KEYS.WISHLIST}${userId}`;
    return this.get(key);
  }

  async setCachedWishlist(userId, data, ttl = CACHE_TTL.SHORT) {
    const key = `${CACHE_KEYS.WISHLIST}${userId}`;
    return this.set(key, data, ttl);
  }

  async invalidateWishlist(userId) {
    return this.del(`${CACHE_KEYS.WISHLIST}${userId}`);
  }

  // User caching
  async getCachedUser(userId) {
    const key = `${CACHE_KEYS.USER}${userId}`;
    return this.get(key);
  }

  async setCachedUser(userId, data, ttl = CACHE_TTL.MEDIUM) {
    const key = `${CACHE_KEYS.USER}${userId}`;
    return this.set(key, data, ttl);
  }

  async invalidateUser(userId) {
    return this.del(`${CACHE_KEYS.USER}${userId}`);
  }

  // Dashboard stats caching
  async getCachedDashboardStats() {
    return this.get(CACHE_KEYS.DASHBOARD_STATS);
  }

  async setCachedDashboardStats(data, ttl = CACHE_TTL.LONG) {
    return this.set(CACHE_KEYS.DASHBOARD_STATS, data, ttl);
  }

  async invalidateDashboardStats() {
    return this.del(CACHE_KEYS.DASHBOARD_STATS);
  }

  // Currency rates caching
  async getCachedCurrencyRates() {
    return this.get(CACHE_KEYS.CURRENCY_RATES);
  }

  async setCachedCurrencyRates(data, ttl = CACHE_TTL.LONG) {
    return this.set(CACHE_KEYS.CURRENCY_RATES, data, ttl);
  }

  async invalidateCurrencyRates() {
    return this.del(CACHE_KEYS.CURRENCY_RATES);
  }

  // Reviews caching
  async getCachedReviews(productId) {
    const key = `${CACHE_KEYS.REVIEWS}${productId}`;
    return this.get(key);
  }

  async setCachedReviews(productId, data, ttl = CACHE_TTL.MEDIUM) {
    const key = `${CACHE_KEYS.REVIEWS}${productId}`;
    return this.set(key, data, ttl);
  }

  async invalidateReviews(productId) {
    return this.del(`${CACHE_KEYS.REVIEWS}${productId}`);
  }
}

const cacheService = new CacheService();

// Initialize cache on module load
cacheService.init().catch((error) => {
  logger.error('Failed to initialize cache service', error);
});

module.exports = cacheService;
module.exports.CACHE_TTL = CACHE_TTL;
module.exports.CACHE_KEYS = CACHE_KEYS;
