const app = require('./app');
const { sequelize } = require('./models');
const { ensureRedisConnection, isRedisConfigured } = require('./config/redis');
const { startOrderAutomation, stopOrderAutomation } = require('./services/orderAutomationService');

const rawPort = process.env.PORT || '3000';
const PORT = Number(rawPort);
const SHUTDOWN_TIMEOUT_MS = 10000;

if (!Number.isInteger(PORT) || PORT <= 0 || PORT > 65535) {
  console.error(`Invalid PORT value "${rawPort}". Expected an integer between 1 and 65535.`);
  process.exit(1);
}

let server;
let isShuttingDown = false;

const closeHttpServer = async () => {
  if (!server) return;

  await new Promise((resolve) => {
    const forceCloseTimer = setTimeout(() => {
      console.error('HTTP server shutdown timed out. Forcing process exit.');
      resolve();
    }, SHUTDOWN_TIMEOUT_MS);

    server.close(() => {
      clearTimeout(forceCloseTimer);
      resolve();
    });
  });
};

const shutdown = async (signal, exitCode = 0) => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`Received ${signal}. Shutting down gracefully...`);

  try {
    await closeHttpServer();
  } catch (error) {
    console.error('Error shutting down HTTP server:', error.message);
    exitCode = 1;
  }

  try {
    stopOrderAutomation();
    await sequelize.close();
  } catch (error) {
    console.error('Error closing database connection:', error.message);
    exitCode = 1;
  }

  process.exit(exitCode);
};

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
    startOrderAutomation();

    server.on('error', async (error) => {
      console.error('HTTP server failed:', error.message);
      await shutdown('SERVER_ERROR', 1);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

process.on('SIGINT', () => shutdown('SIGINT', 0));
process.on('SIGTERM', () => shutdown('SIGTERM', 0));
process.on('unhandledRejection', async (reason) => {
  console.error('Unhandled promise rejection:', reason);
  await shutdown('UNHANDLED_REJECTION', 1);
});
process.on('uncaughtException', async (error) => {
  console.error('Uncaught exception:', error);
  await shutdown('UNCAUGHT_EXCEPTION', 1);
});

startServer();
