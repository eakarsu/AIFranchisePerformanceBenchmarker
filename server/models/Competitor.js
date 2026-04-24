const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Competitor = sequelize.define('Competitor', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  location: { type: DataTypes.STRING },
  marketShare: { type: DataTypes.DECIMAL(5, 2) },
  strengths: { type: DataTypes.TEXT },
  weaknesses: { type: DataTypes.TEXT },
  priceRange: { type: DataTypes.STRING },
  category: { type: DataTypes.STRING },
  rating: { type: DataTypes.DECIMAL(3, 2) },
  estimatedRevenue: { type: DataTypes.DECIMAL(15, 2) },
  threatLevel: { type: DataTypes.ENUM('low', 'medium', 'high'), defaultValue: 'medium' }
});

module.exports = Competitor;
