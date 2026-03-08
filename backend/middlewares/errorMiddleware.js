const AppError = require('../utils/AppError');

const normalizeStatusCode = (statusCode) => {
  const code = Number(statusCode);
  if (!Number.isInteger(code) || code < 400 || code > 599) {
    return 500;
  }
  return code;
};

const sendErrorDev = (err, res) => {
  res.status(normalizeStatusCode(err.statusCode)).json({
    error: true,
    message: err.message,
    stack: err.stack,
    err,
  });
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(normalizeStatusCode(err.statusCode)).json({
      error: true,
      message: err.message,
    });
  } else {
    // Programming or unknown error: don't leak details
    console.error('ERROR', err);
    res.status(500).json({
      error: true,
      message: 'Something went wrong!',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = normalizeStatusCode(err.statusCode);

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    // You can also handle specific errors like Sequelize validation errors
    let error = { ...err };
    error.message = err.message;

    if (err.name === 'SequelizeValidationError') {
      error = new AppError(err.errors.map(e => e.message).join(', '), 400);
    }
    if (err.name === 'SequelizeUniqueConstraintError') {
      error = new AppError('Duplicate field value: already exists', 409);
    }
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      error = new AppError('The requested action references invalid related data.', 400);
    }
    if (err.name === 'SequelizeDatabaseError') {
      error = new AppError('The request could not be completed.', 400);
    }
    if (err.name === 'JsonWebTokenError') {
      error = new AppError('Invalid token', 401);
    }
    if (err.name === 'TokenExpiredError') {
      error = new AppError('Token expired', 401);
    }
    if (err.message === 'Not allowed by CORS') {
      error = new AppError('Origin is not allowed to access this resource.', 403);
    }

    sendErrorProd(error, res);
  }
};
