const requireStrongSecret = (name, fallbackValue) => {
  const value = String(process.env[name] || fallbackValue || '').trim();
  if (!value) {
    throw new Error(`${name} is required`);
  }
  if (process.env.NODE_ENV === 'production' && value.length < 32) {
    throw new Error(`${name} must be at least 32 characters in production`);
  }
  return value;
};

module.exports = {
  jwtSecret: requireStrongSecret('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  jwtRefreshSecret: requireStrongSecret('JWT_REFRESH_SECRET'),
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
};
