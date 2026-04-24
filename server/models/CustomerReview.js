const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CustomerReview = sequelize.define('CustomerReview', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  franchiseUnitId: { type: DataTypes.INTEGER },
  customerName: { type: DataTypes.STRING },
  rating: { type: DataTypes.INTEGER },
  reviewText: { type: DataTypes.TEXT },
  sentiment: { type: DataTypes.ENUM('positive', 'neutral', 'negative') },
  category: { type: DataTypes.STRING },
  source: { type: DataTypes.STRING },
  reviewDate: { type: DataTypes.DATEONLY },
  responseStatus: { type: DataTypes.ENUM('pending', 'responded', 'escalated'), defaultValue: 'pending' }
});

module.exports = CustomerReview;
