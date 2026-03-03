const Redis = require('ioredis');

const redisUrl = String(process.env.REDIS_URL || '').trim();
const redisHost = String(process.env.REDIS_HOST || '').trim();
const redisPort = Number(process.env.REDIS_PORT || 6379);
const redisPassword = String(process.env.REDIS_PASSWORD || '').trim();
const redisDb = Number(process.env.REDIS_DB || 0);

let redisClient = null;
let connectPromise = null;

const isConfigured = () => Boolean(redisUrl || redisHost);

const buildClient = () => {
  if (redisClient || !isConfigured()) return redisClient;

  redisClient = redisUrl
    ? new Redis(redisUrl, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
    })
    : new Redis({
      host: redisHost,
      port: redisPort,
      password: redisPassword || undefined,
      db: Number.isNaN(redisDb) ? 0 : redisDb,
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
    });

  redisClient.on('error', (error) => {
    if (process.env.NODE_ENV !== 'test') {
      console.warn('Redis unavailable, using fallback memory stores:', error.message);
    }
  });

  return redisClient;
};

const ensureRedisConnection = async () => {
  const client = buildClient();
  if (!client) return null;

  if (client.status === 'ready') return client;
  if (client.status === 'connecting' && connectPromise) return connectPromise;

  connectPromise = client.connect()
    .then(() => client)
    .catch(() => null)
    .finally(() => {
      connectPromise = null;
    });
  return connectPromise;
};

module.exports = {
  ensureRedisConnection,
  isRedisConfigured: isConfigured,
};
