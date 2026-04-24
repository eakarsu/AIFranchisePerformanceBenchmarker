const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const FranchiseValuation = sequelize.define('FranchiseValuation', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  franchiseUnitId: { type: DataTypes.INTEGER },
  valuationDate: { type: DataTypes.DATEONLY },
  estimatedValue: { type: DataTypes.DECIMAL(14, 2) },
  methodology: { type: DataTypes.STRING },
  revenueMultiple: { type: DataTypes.DECIMAL(5, 2) },
  assetValue: { type: DataTypes.DECIMAL(12, 2) },
  goodwillValue: { type: DataTypes.DECIMAL(12, 2) },
  marketCondition: { type: DataTypes.ENUM('buyers', 'sellers', 'balanced'), defaultValue: 'balanced' },
  confidence: { type: DataTypes.DECIMAL(5, 2) },
  notes: { type: DataTypes.TEXT }
});

module.exports = FranchiseValuation;
