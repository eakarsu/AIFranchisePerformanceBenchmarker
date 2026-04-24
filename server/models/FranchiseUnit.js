const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const FranchiseUnit = sequelize.define('FranchiseUnit', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  location: { type: DataTypes.STRING, allowNull: false },
  region: { type: DataTypes.STRING },
  owner: { type: DataTypes.STRING },
  openDate: { type: DataTypes.DATEONLY },
  status: { type: DataTypes.ENUM('active', 'inactive', 'pending'), defaultValue: 'active' },
  monthlyRevenue: { type: DataTypes.DECIMAL(12, 2) },
  employeeCount: { type: DataTypes.INTEGER },
  customerRating: { type: DataTypes.DECIMAL(3, 2) },
  performanceScore: { type: DataTypes.DECIMAL(5, 2) },
  sqFootage: { type: DataTypes.INTEGER },
  franchiseType: { type: DataTypes.STRING }
});

module.exports = FranchiseUnit;
