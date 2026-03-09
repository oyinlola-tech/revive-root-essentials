const app = require('./app');
const { sequelize } = require('./models');
const { ensureRedisConnection, isRedisConfigured } = require('./config/redis');

const PORT = Number(process.env.PORT || 3000);

let server;

const startServer = async () => {
  try {
    if (typeof sequelize.ensureDatabase === 'function') {
      await sequelize.ensureDatabase();
    }

    await sequelize.authenticate();
    await sequelize.sync();

    if (isRedisConfigured()) {
      await ensureRedisConnection();
    }

    server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

const shutdown = async (signal) => {
  console.log(`Received ${signal}. Shutting down gracefully...`);

  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }

  try {
    await sequelize.close();
  } catch (error) {
    console.error('Error closing database connection:', error.message);
  } finally {
    process.exit(0);
  }
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

startServer();
