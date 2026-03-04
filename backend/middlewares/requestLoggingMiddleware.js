const Logger = require('../utils/Logger');

const logger = new Logger('Middleware:RequestLogging');

/**
 * Middleware to log incoming requests
 */
const requestLoggingMiddleware = (req, res, next) => {
  const startTime = Date.now();
  
  // Log request
  logger.debug(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });

  // Override res.json to log response
  const originalJson = res.json.bind(res);
  res.json = function (data) {
    const duration = Date.now() - startTime;
    const sanitizedData = typeof data === 'object' && data.user 
      ? { ...data, user: { ...data.user, email: '***' } }
      : data;
    
    logger.debug(`${req.method} ${req.path} ${res.statusCode}`, {
      duration: `${duration}ms`,
      statusCode: res.statusCode,
    });

    return originalJson(data);
  };

  // Override res.status().json() for chaining
  const originalStatus = res.status.bind(res);
  res.status = function (code) {
    return originalStatus(code);
  };

  next();
};

module.exports = requestLoggingMiddleware;
