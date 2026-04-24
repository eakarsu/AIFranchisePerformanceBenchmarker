const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MarketingCampaign = sequelize.define('MarketingCampaign', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  channel: { type: DataTypes.STRING },
  budget: { type: DataTypes.DECIMAL(10, 2) },
  spent: { type: DataTypes.DECIMAL(10, 2) },
  impressions: { type: DataTypes.INTEGER },
  clicks: { type: DataTypes.INTEGER },
  conversions: { type: DataTypes.INTEGER },
  roi: { type: DataTypes.DECIMAL(5, 2) },
  startDate: { type: DataTypes.DATEONLY },
  endDate: { type: DataTypes.DATEONLY },
  status: { type: DataTypes.ENUM('planned', 'active', 'paused', 'completed'), defaultValue: 'planned' },
  targetAudience: { type: DataTypes.STRING }
});

module.exports = MarketingCampaign;
