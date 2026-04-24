const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TripPlan = sequelize.define('TripPlan', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  destination: { type: DataTypes.STRING },
  purpose: { type: DataTypes.STRING },
  startDate: { type: DataTypes.DATEONLY },
  endDate: { type: DataTypes.DATEONLY },
  totalBudget: { type: DataTypes.DECIMAL(10, 2) },
  estimatedCost: { type: DataTypes.DECIMAL(10, 2) },
  franchiseUnitsToVisit: { type: DataTypes.TEXT },
  status: { type: DataTypes.ENUM('draft', 'approved', 'in_progress', 'completed'), defaultValue: 'draft' },
  travelerName: { type: DataTypes.STRING },
  notes: { type: DataTypes.TEXT }
});

module.exports = TripPlan;
