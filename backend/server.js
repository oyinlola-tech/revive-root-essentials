const app = require('./app');
const { sequelize } = require('./models');
const seedSuperadmin = require('./utils/seedSuperadmin');
const { startNewsletterScheduler } = require('./services/newsletterScheduler');

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

sequelize
  .ensureDatabase()
  .then(() => sequelize.authenticate())
  .then(() => {
    console.log('Database connected...');
    // Create tables if they don't exist. Do not alter existing schema.
    return sequelize.sync();
  })
  .then(() => seedSuperadmin())
  .then(() => {
    server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      startNewsletterScheduler();
    });
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
    process.exit(1);
  });

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
