const app = require('./app');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 3000;
const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_NAME', 'JWT_SECRET', 'JWT_REFRESH_SECRET', 'EMAIL_HOST', 'EMAIL_USER', 'EMAIL_PASS'];

const missingEnvVars = requiredEnvVars.filter((key) => !process.env[key]);
if (missingEnvVars.length > 0) {
  console.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

sequelize
  .authenticate()
  .then(() => {
    console.log('Database connected...');
    return sequelize.sync({ alter: process.env.NODE_ENV === 'development' }); // Be careful with alter in production
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
  });
