const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RevenueRecord = sequelize.define('RevenueRecord', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  franchiseUnitId: { type: DataTypes.INTEGER, allowNull: false },
  month: { type: DataTypes.STRING, allowNull: false },
  year: { type: DataTypes.INTEGER, allowNull: false },
  revenue: { type: DataTypes.DECIMAL(12, 2) },
  expenses: { type: DataTypes.DECIMAL(12, 2) },
  profit: { type: DataTypes.DECIMAL(12, 2) },
  customerCount: { type: DataTypes.INTEGER },
  averageTicket: { type: DataTypes.DECIMAL(8, 2) },
  category: { type: DataTypes.STRING }
});

module.exports = RevenueRecord;
