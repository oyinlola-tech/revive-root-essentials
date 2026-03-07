const Logger = require('../utils/Logger');

const logger = new Logger('Middleware:RequestLogging');

/**
 * Middleware to log incoming requests
 */
const requestLoggingMiddleware = (req, res, next) => {
  const startTime = Date.now();

  logger.debug(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });

  const originalJson = res.json.bind(res);
  res.json = function (data) {
    const duration = Date.now() - startTime;

    logger.debug(`${req.method} ${req.path} ${res.statusCode}`, {
      duration: `${duration}ms`,
      statusCode: res.statusCode,
    });

    return originalJson(data);
  };

  next();
};

module.exports = requestLoggingMiddleware;
