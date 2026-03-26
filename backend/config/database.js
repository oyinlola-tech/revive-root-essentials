const { Sequelize } = require('sequelize');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

const rootEnvPath = path.join(__dirname, '..', '..', '.env');
const backendEnvPath = path.join(__dirname, '..', '.env');
dotenv.config({ path: rootEnvPath });
dotenv.config({ path: backendEnvPath });

const dbName = process.env.DB_NAME || process.env.DB_DATABASE;
const requiredEnv = ['DB_USER', 'DB_PASSWORD', 'DB_HOST'];
const missing = requiredEnv.filter((key) => !process.env[key]);
if (!dbName) missing.push('DB_NAME or DB_DATABASE');
if (missing.length) {
  throw new Error(`Missing required database env vars: ${missing.join(', ')}`);
}

const sequelize = new Sequelize(
  dbName,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    define: {
      timestamps: true,
      underscored: true,
    },
  }
);

const ensureDatabase = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
  await connection.end();
};

sequelize.ensureDatabase = ensureDatabase;

module.exports = sequelize;
