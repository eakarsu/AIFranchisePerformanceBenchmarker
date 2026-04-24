const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BenchmarkReport = sequelize.define('BenchmarkReport', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  franchiseUnitId: { type: DataTypes.INTEGER },
  reportType: { type: DataTypes.STRING },
  period: { type: DataTypes.STRING },
  overallScore: { type: DataTypes.DECIMAL(5, 2) },
  industryAvg: { type: DataTypes.DECIMAL(5, 2) },
  ranking: { type: DataTypes.INTEGER },
  totalUnitsCompared: { type: DataTypes.INTEGER },
  keyFindings: { type: DataTypes.TEXT },
  status: { type: DataTypes.ENUM('draft', 'published', 'archived'), defaultValue: 'draft' }
});

module.exports = BenchmarkReport;
