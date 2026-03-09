const app = require('./app');
const { sequelize } = require('./models');
const seedSuperadmin = require('./utils/seedSuperadmin');
const { startNewsletterScheduler } = require('./services/newsletterScheduler');
const redisProductCacheService = require('./services/redisProductCacheService');
const { startOrderAutomation } = require('./services/orderAutomationService');

const PORT = Number(process.env.PORT) || 3000;
const requiredEnvVars = [
  'DB_HOST',
  'DB_USER',
  'DB_NAME',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'FLW_PUBLIC_KEY',
  'FLW_SECRET_KEY',
];
const optionalEnvVars = ['EMAIL_HOST', 'EMAIL_USER', 'EMAIL_PASS', 'REDIS_URL', 'FLW_WEBHOOK_SECRET_HASH'];
const shouldSyncDatabase = process.env.DB_SYNC_ON_BOOT === 'true' || process.env.NODE_ENV !== 'production';
const shouldStartNewsletterScheduler = process.env.ENABLE_NEWSLETTER_SCHEDULER === 'true';

// COOKIE_SECRET is optional but recommended when signing cookies
optionalEnvVars.push('COOKIE_SECRET');
let server;

const missingEnvVars = requiredEnvVars.filter((key) => !process.env[key]);
if (missingEnvVars.length > 0) {
  console.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

const missingOptionalVars = optionalEnvVars.filter((key) => !process.env[key]);
if (missingOptionalVars.length > 0) {
  console.warn(`Missing optional environment variables (email notifications may be disabled): ${missingOptionalVars.join(', ')}`);
}

if (process.env.NODE_ENV === 'production' && !process.env.COOKIE_SECRET) {
  console.error('COOKIE_SECRET is required in production to sign auth and CSRF cookies.');
  process.exit(1);
}

// Initialize Redis caching
const initializeRedisCache = async () => {
  try {
    await redisProductCacheService.initializeRedis();
    if (redisProductCacheService.isRedisEnabled()) {
      console.log('✅ Redis caching initialized successfully');
      const stats = await redisProductCacheService.getCacheStats();
      console.log('Cache Stats:', stats);
    } else {
      console.warn('⚠️  Redis caching disabled - using database queries only');
    }
  } catch (error) {
    console.error('⚠️  Failed to initialize Redis:', error.message);
    console.warn('Continuing without Redis caching...');
  }
};

if (process.env.SKIP_DB === 'true') {
  console.warn('SKIP_DB is true - skipping database initialization (development/test mode)');
  initializeRedisCache().then(() => {
    server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} (DB skipped)`);
    });
  });
} else {
  sequelize
    .ensureDatabase()
    .then(() => sequelize.authenticate())
    .then(() => {
      console.log('Database connected...');
      if (!shouldSyncDatabase) {
        console.log('Database sync skipped in production. Set DB_SYNC_ON_BOOT=true to enable it.');
        return null;
      }
      // Create tables if they don't exist. Do not alter existing schema.
      return sequelize.sync();
    })
    .then(() => seedSuperadmin())
    .then(() => initializeRedisCache())
    .then(() => {
      server = app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        startOrderAutomation();
        if (shouldStartNewsletterScheduler) {
          startNewsletterScheduler();
        }
      });
    })
    .catch((err) => {
      console.error('Unable to connect to the database:', err);
      process.exit(1);
    });
}

process.on('unhandledRejection', (error) => {
  console.error('UNHANDLED_REJECTION', error);
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});

process.on('uncaughtException', (error) => {
  console.error('UNCAUGHT_EXCEPTION', error);
  process.exit(1);
});
