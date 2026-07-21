const { Sequelize } = require('sequelize');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const isProduction = process.env.NODE_ENV === 'production';
if (isProduction && (!process.env.DB_NAME || !process.env.DB_USER || !process.env.DB_PASSWORD)) {
  throw new Error('DB_NAME, DB_USER, and DB_PASSWORD are required in production');
}

const options = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
    dialectOptions: process.env.DB_SSL === 'true' ? { ssl: { require: true, rejectUnauthorized: true } } : {},
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  };
const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, options)
  : new Sequelize(process.env.DB_NAME || 'franchise_benchmarker', process.env.DB_USER || 'postgres', process.env.DB_PASSWORD || '', options);

module.exports = sequelize;
