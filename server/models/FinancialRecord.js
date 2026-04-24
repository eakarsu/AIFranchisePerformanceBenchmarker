const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const FinancialRecord = sequelize.define('FinancialRecord', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  franchiseUnitId: { type: DataTypes.INTEGER },
  period: { type: DataTypes.STRING },
  totalRevenue: { type: DataTypes.DECIMAL(12, 2) },
  totalExpenses: { type: DataTypes.DECIMAL(12, 2) },
  netIncome: { type: DataTypes.DECIMAL(12, 2) },
  cashFlow: { type: DataTypes.DECIMAL(12, 2) },
  debtRatio: { type: DataTypes.DECIMAL(5, 2) },
  currentRatio: { type: DataTypes.DECIMAL(5, 2) },
  category: { type: DataTypes.STRING },
  notes: { type: DataTypes.TEXT }
});

module.exports = FinancialRecord;
