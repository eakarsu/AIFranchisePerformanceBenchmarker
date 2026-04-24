const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MarketExpansion = sequelize.define('MarketExpansion', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  targetCity: { type: DataTypes.STRING, allowNull: false },
  state: { type: DataTypes.STRING },
  population: { type: DataTypes.INTEGER },
  medianIncome: { type: DataTypes.DECIMAL(10, 2) },
  competitorCount: { type: DataTypes.INTEGER },
  demandScore: { type: DataTypes.DECIMAL(5, 2) },
  investmentRequired: { type: DataTypes.DECIMAL(12, 2) },
  projectedROI: { type: DataTypes.DECIMAL(5, 2) },
  riskLevel: { type: DataTypes.ENUM('low', 'medium', 'high'), defaultValue: 'medium' },
  status: { type: DataTypes.ENUM('researching', 'approved', 'in_progress', 'completed'), defaultValue: 'researching' }
});

module.exports = MarketExpansion;
