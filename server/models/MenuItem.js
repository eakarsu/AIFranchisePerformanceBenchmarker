const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MenuItem = sequelize.define('MenuItem', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  category: { type: DataTypes.STRING },
  price: { type: DataTypes.DECIMAL(8, 2) },
  cost: { type: DataTypes.DECIMAL(8, 2) },
  profitMargin: { type: DataTypes.DECIMAL(5, 2) },
  popularity: { type: DataTypes.INTEGER },
  calories: { type: DataTypes.INTEGER },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  description: { type: DataTypes.TEXT },
  monthlySales: { type: DataTypes.INTEGER }
});

module.exports = MenuItem;
