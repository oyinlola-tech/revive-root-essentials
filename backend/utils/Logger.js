const fs = require('fs');
const path = require('path');

const LOGS_DIR = path.join(__dirname, '..', 'logs');

const ensureLogsDir = (cb) => {
  fs.mkdir(LOGS_DIR, { recursive: true }, (err) => {
    // ignore error if directory already exists
    if (cb) cb(err);
  });
};

const getTimeStamp = () => {
  return new Date().toISOString();
};

const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  
  const sanitized = { ...obj };
  const sensitiveKeys = ['password', 'token', 'secret', 'apiKey', 'refreshToken', 'creditCard', 'ssn', 'accessToken'];
  
  for (const key of sensitiveKeys) {
    if (key in sanitized) {
      sanitized[key] = '***REDACTED***';
    }
  }
  
  return sanitized;
};

const logToFile = (level, message, meta = {}) => {
  const timestamp = getTimeStamp();
  const logEntry = {
    timestamp,
    level,
    message,
    meta: sanitizeObject(meta),
  };

  const logLine = JSON.stringify(logEntry) + '\n';
  const filename = path.join(LOGS_DIR, `${level.toLowerCase()}-${new Date().toISOString().split('T')[0]}.log`);

  ensureLogsDir(() => {
    fs.appendFile(filename, logLine, { encoding: 'utf8' }, (err) => {
      if (err) {
        // Fallback to console error if file write fails
        console.error('[Logger] Failed to write log file', err);
      }
    });
  });
};

class Logger {
  constructor(context = '') {
    this.context = context;
  }

  info(message, meta = {}) {
    const logMessage = this.context ? `[${this.context}] ${message}` : message;
    console.log(`[INFO] ${getTimeStamp()} ${logMessage}`);
    logToFile('INFO', logMessage, meta);
  }

  warn(message, meta = {}) {
    const logMessage = this.context ? `[${this.context}] ${message}` : message;
    console.warn(`[WARN] ${getTimeStamp()} ${logMessage}`);
    logToFile('WARN', logMessage, meta);
  }

  error(message, error = null, meta = {}) {
    const logMessage = this.context ? `[${this.context}] ${message}` : message;
    console.error(`[ERROR] ${getTimeStamp()} ${logMessage}`);
    
    const errorMeta = {
      ...meta,
      ...(error ? {
        errorMessage: error.message,
        errorStack: error.stack,
        errorName: error.name,
      } : {}),
    };
    
    logToFile('ERROR', logMessage, errorMeta);
  }

  debug(message, meta = {}) {
    if (process.env.NODE_ENV === 'development') {
      const logMessage = this.context ? `[${this.context}] ${message}` : message;
      console.debug(`[DEBUG] ${getTimeStamp()} ${logMessage}`);
      logToFile('DEBUG', logMessage, meta);
    }
  }

  audit(action, userId, details = {}) {
    const auditEntry = {
      action,
      userId,
      timestamp: getTimeStamp(),
      details,
    };
    
    console.log(`[AUDIT] ${JSON.stringify(auditEntry)}`);
    const filename = path.join(LOGS_DIR, `audit-${new Date().toISOString().split('T')[0]}.log`);
    ensureLogsDir(() => {
      fs.appendFile(filename, JSON.stringify(auditEntry) + '\n', { encoding: 'utf8' }, (err) => {
        if (err) console.error('[Logger] Failed to write audit log', err);
      });
    });
  }
}

module.exports = Logger;