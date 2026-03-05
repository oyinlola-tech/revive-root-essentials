// ============================================================================
// REDIS PRODUCT CACHING SERVICE
// ============================================================================
// Purpose: Cache products and related data to reduce database hits
// Usage: Use in product controller to cache queries
// 
// Cache Strategy:
// - All products cached for 1 hour
// - Individual product cached for 24 hours
// - Category products cached for 30 minutes
// - Product search results cached for 10 minutes
// - Cache invalidated on product create/update/delete
// ============================================================================

const redis = require('redis');
const Logger = require('../utils/Logger');

// Cache TTL (Time To Live) in seconds
const CACHE_TTL = {
  ALL_PRODUCTS: 3600,         // 1 hour
  SINGLE_PRODUCT: 86400,      // 24 hours
  CATEGORY_PRODUCTS: 1800,    // 30 minutes
  SEARCH_RESULTS: 600,        // 10 minutes
  BESTSELLERS: 3600,          // 1 hour
  FEATURED: 3600,             // 1 hour
  FLASH_SALE: 1800,           // 30 minutes
  PRODUCT_COUNT: 3600         // 1 hour
};

// Cache key prefixes for organization
const CACHE_KEYS = {
  ALL_PRODUCTS: 'products:all',
  PRODUCT: 'product:',
  CATEGORY: 'category:products:',
  SEARCH: 'search:products:',
  BESTSELLERS: 'products:bestsellers',
  FEATURED: 'products:featured',
  FLASH_SALE: 'products:flashsale',
  PRODUCT_COUNT: 'products:count',
  CATEGORY_COUNT: 'category:count:'
};

// Redis client configuration
let redisClient = null;
let cacheEnabled = false;

// ============================================================================
// REDIS CONNECTION MANAGEMENT
// ============================================================================

/**
 * Initialize Redis connection
 * @returns {Promise<void>}
 */
async function initializeRedis() {
  try {
    if (!process.env.REDIS_ENABLED || process.env.REDIS_ENABLED === 'false') {
      Logger.info('Redis caching disabled. Using in-memory fallback.');
      cacheEnabled = false;
      return;
    }

    redisClient = redis.createClient({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      db: parseInt(process.env.REDIS_DB || '0'),
      socket: {
        reconnectStrategy: (retries) => {
          const delay = Math.min(retries * 50, 500);
          return delay;
        },
        connectTimeout: 10000
      }
    });

    // Handle connection events
    redisClient.on('error', (err) => {
      Logger.error('Redis Client Error:', err);
      cacheEnabled = false;
    });

    redisClient.on('connect', () => {
      Logger.info('Redis connected successfully');
      cacheEnabled = true;
    });

    redisClient.on('reconnecting', () => {
      Logger.warn('Redis reconnecting...');
    });

    // Connect to Redis
    await redisClient.connect();
    Logger.info('Redis cache initialized');
    cacheEnabled = true;
  } catch (error) {
    Logger.error('Failed to initialize Redis:', error);
    Logger.warn('Falling back to in-memory caching');
    cacheEnabled = false;
  }
}

/**
 * Close Redis connection
 * @returns {Promise<void>}
 */
async function closeRedis() {
  if (redisClient && cacheEnabled) {
    try {
      await redisClient.quit();
      Logger.info('Redis connection closed');
    } catch (error) {
      Logger.error('Error closing Redis connection:', error);
    }
  }
}

/**
 * Check if Redis is enabled and connected
 * @returns {boolean}
 */
function isRedisEnabled() {
  return cacheEnabled && redisClient !== null;
}

// ============================================================================
// GENERIC CACHE OPERATIONS
// ============================================================================

/**
 * Get value from cache
 * @param {string} key - Cache key
 * @returns {Promise<any>}
 */
async function getCache(key) {
  if (!isRedisEnabled()) {
    return null;
  }

  try {
    const cached = await redisClient.get(key);
    if (cached) {
      Logger.debug(`Cache HIT: ${key}`);
      return JSON.parse(cached);
    }
    Logger.debug(`Cache MISS: ${key}`);
    return null;
  } catch (error) {
    Logger.error(`Error getting cache for ${key}:`, error);
    return null;
  }
}

/**
 * Set value in cache with TTL
 * @param {string} key - Cache key
 * @param {any} value - Value to cache
 * @param {number} ttl - Time to live in seconds
 * @returns {Promise<boolean>}
 */
async function setCache(key, value, ttl) {
  if (!isRedisEnabled()) {
    return false;
  }

  try {
    await redisClient.setEx(key, ttl, JSON.stringify(value));
    Logger.debug(`Cache SET: ${key} (TTL: ${ttl}s)`);
    return true;
  } catch (error) {
    Logger.error(`Error setting cache for ${key}:`, error);
    return false;
  }
}

/**
 * Delete cache key
 * @param {string} key - Cache key to delete
 * @returns {Promise<boolean>}
 */
async function deleteCache(key) {
  if (!isRedisEnabled()) {
    return false;
  }

  try {
    await redisClient.del(key);
    Logger.debug(`Cache DELETE: ${key}`);
    return true;
  } catch (error) {
    Logger.error(`Error deleting cache for ${key}:`, error);
    return false;
  }
}

/**
 * Delete multiple cache keys by pattern
 * @param {string} pattern - Key pattern (e.g., "product:*")
 * @returns {Promise<number>}
 */
async function deleteCachePattern(pattern) {
  if (!isRedisEnabled()) {
    return 0;
  }

  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
      Logger.debug(`Cache DELETE PATTERN: ${pattern} (${keys.length} keys)`);
    }
    return keys.length;
  } catch (error) {
    Logger.error(`Error deleting cache pattern ${pattern}:`, error);
    return 0;
  }
}

/**
 * Clear all cache
 * @returns {Promise<boolean>}
 */
async function clearAllCache() {
  if (!isRedisEnabled()) {
    return false;
  }

  try {
    await redisClient.flushDb();
    Logger.info('All cache cleared');
    return true;
  } catch (error) {
    Logger.error('Error clearing all cache:', error);
    return false;
  }
}

/**
 * Get cache statistics
 * @returns {Promise<object>}
 */
async function getCacheStats() {
  if (!isRedisEnabled()) {
    return {
      enabled: false,
      status: 'Redis disabled or not connected'
    };
  }

  try {
    const info = await redisClient.info('stats');
    const keys = await redisClient.dbSize();

    return {
      enabled: true,
      connectedClients: info.connected_clients,
      totalKeys: keys,
      memoryUsage: info.used_memory_human,
      hitRate: info.keyspace_hits && info.keyspace_misses 
        ? ((info.keyspace_hits / (info.keyspace_hits + info.keyspace_misses)) * 100).toFixed(2)
        : 'N/A'
    };
  } catch (error) {
    Logger.error('Error getting cache stats:', error);
    return {
      enabled: true,
      status: 'Error retrieving stats'
    };
  }
}

// ============================================================================
// PRODUCT-SPECIFIC CACHE OPERATIONS
// ============================================================================

/**
 * Get all products from cache or database
 * @param {Function} dbQuery - Database query function
 * @param {object} options - Query options (pagination, filters)
 * @returns {Promise<array>}
 */
async function getAllProducts(dbQuery, options = {}) {
  const cacheKey = CACHE_KEYS.ALL_PRODUCTS;

  // Try to get from cache
  const cached = await getCache(cacheKey);
  if (cached) {
    return cached;
  }

  // Get from database
  const products = await dbQuery(options);

  // Cache the result
  await setCache(cacheKey, products, CACHE_TTL.ALL_PRODUCTS);

  return products;
}

/**
 * Get single product by ID from cache or database
 * @param {number} productId - Product ID
 * @param {Function} dbQuery - Database query function
 * @returns {Promise<object>}
 */
async function getProductById(productId, dbQuery) {
  const cacheKey = `${CACHE_KEYS.PRODUCT}${productId}`;

  // Try to get from cache
  const cached = await getCache(cacheKey);
  if (cached) {
    return cached;
  }

  // Get from database
  const product = await dbQuery(productId);

  // Cache the result
  if (product) {
    await setCache(cacheKey, product, CACHE_TTL.SINGLE_PRODUCT);
  }

  return product;
}

/**
 * Get products by category from cache or database
 * @param {number} categoryId - Category ID
 * @param {Function} dbQuery - Database query function
 * @param {object} options - Query options
 * @returns {Promise<array>}
 */
async function getProductsByCategory(categoryId, dbQuery, options = {}) {
  const cacheKey = `${CACHE_KEYS.CATEGORY}${categoryId}`;

  // Try to get from cache
  const cached = await getCache(cacheKey);
  if (cached) {
    return cached;
  }

  // Get from database
  const products = await dbQuery(categoryId, options);

  // Cache the result
  await setCache(cacheKey, products, CACHE_TTL.CATEGORY_PRODUCTS);

  return products;
}

/**
 * Search products with caching
 * @param {string} query - Search query
 * @param {Function} dbQuery - Database query function
 * @returns {Promise<array>}
 */
async function searchProducts(query, dbQuery) {
  const cacheKey = `${CACHE_KEYS.SEARCH}${query.toLowerCase()}`;

  // Try to get from cache
  const cached = await getCache(cacheKey);
  if (cached) {
    return cached;
  }

  // Get from database
  const results = await dbQuery(query);

  // Cache the result
  await setCache(cacheKey, results, CACHE_TTL.SEARCH_RESULTS);

  return results;
}

/**
 * Get bestselling products with caching
 * @param {Function} dbQuery - Database query function
 * @param {number} limit - Number of products
 * @returns {Promise<array>}
 */
async function getBestsellers(dbQuery, limit = 10) {
  const cacheKey = CACHE_KEYS.BESTSELLERS;

  // Try to get from cache
  const cached = await getCache(cacheKey);
  if (cached) {
    return cached;
  }

  // Get from database
  const products = await dbQuery(limit);

  // Cache the result
  await setCache(cacheKey, products, CACHE_TTL.BESTSELLERS);

  return products;
}

/**
 * Get featured products with caching
 * @param {Function} dbQuery - Database query function
 * @param {number} limit - Number of products
 * @returns {Promise<array>}
 */
async function getFeaturedProducts(dbQuery, limit = 10) {
  const cacheKey = CACHE_KEYS.FEATURED;

  // Try to get from cache
  const cached = await getCache(cacheKey);
  if (cached) {
    return cached;
  }

  // Get from database
  const products = await dbQuery(limit);

  // Cache the result
  await setCache(cacheKey, products, CACHE_TTL.FEATURED);

  return products;
}

/**
 * Get flash sale products with caching
 * @param {Function} dbQuery - Database query function
 * @returns {Promise<array>}
 */
async function getFlashSaleProducts(dbQuery) {
  const cacheKey = CACHE_KEYS.FLASH_SALE;

  // Try to get from cache
  const cached = await getCache(cacheKey);
  if (cached) {
    return cached;
  }

  // Get from database
  const products = await dbQuery();

  // Cache the result
  await setCache(cacheKey, products, CACHE_TTL.FLASH_SALE);

  return products;
}

// ============================================================================
// CACHE INVALIDATION
// ============================================================================

/**
 * Invalidate all product-related caches
 * @returns {Promise<void>}
 */
async function invalidateAllProductCaches() {
  Logger.info('Invalidating all product caches...');

  const keysToDelete = [
    CACHE_KEYS.ALL_PRODUCTS,
    CACHE_KEYS.BESTSELLERS,
    CACHE_KEYS.FEATURED,
    CACHE_KEYS.FLASH_SALE,
    CACHE_KEYS.PRODUCT_COUNT,
    `${CACHE_KEYS.PRODUCT}*`,
    `${CACHE_KEYS.CATEGORY}*`,
    `${CACHE_KEYS.SEARCH}*`
  ];

  for (const key of keysToDelete) {
    if (key.includes('*')) {
      await deleteCachePattern(key);
    } else {
      await deleteCache(key);
    }
  }

  Logger.info('All product caches invalidated');
}

/**
 * Invalidate product cache for a specific product
 * @param {number} productId - Product ID
 * @returns {Promise<void>}
 */
async function invalidateProductCache(productId) {
  Logger.info(`Invalidating cache for product ${productId}`);

  await deleteCache(`${CACHE_KEYS.PRODUCT}${productId}`);

  // Also invalidate category caches since product might belong to multiple categories
  await deleteCachePattern(`${CACHE_KEYS.CATEGORY}*`);
  
  // Invalidate search caches
  await deleteCachePattern(`${CACHE_KEYS.SEARCH}*`);
  
  // Invalidate bestsellers and featured
  await deleteCache(CACHE_KEYS.BESTSELLERS);
  await deleteCache(CACHE_KEYS.FEATURED);
  await deleteCache(CACHE_KEYS.ALL_PRODUCTS);
}

/**
 * Invalidate category caches
 * @param {number} categoryId - Category ID (optional, invalidates all if not provided)
 * @returns {Promise<void>}
 */
async function invalidateCategoryCaches(categoryId = null) {
  Logger.info('Invalidating category caches...');

  if (categoryId) {
    await deleteCache(`${CACHE_KEYS.CATEGORY}${categoryId}`);
  } else {
    await deleteCachePattern(`${CACHE_KEYS.CATEGORY}*`);
  }

  // Also invalidate all products cache
  await deleteCache(CACHE_KEYS.ALL_PRODUCTS);
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  // Connection management
  initializeRedis,
  closeRedis,
  isRedisEnabled,

  // Generic cache operations
  getCache,
  setCache,
  deleteCache,
  deleteCachePattern,
  clearAllCache,
  getCacheStats,

  // Product cache operations
  getAllProducts,
  getProductById,
  getProductsByCategory,
  searchProducts,
  getBestsellers,
  getFeaturedProducts,
  getFlashSaleProducts,

  // Cache invalidation
  invalidateAllProductCaches,
  invalidateProductCache,
  invalidateCategoryCaches,

  // Cache keys and TTL
  CACHE_KEYS,
  CACHE_TTL
};
