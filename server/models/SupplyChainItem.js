const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SupplyChainItem = sequelize.define('SupplyChainItem', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  itemName: { type: DataTypes.STRING, allowNull: false },
  supplier: { type: DataTypes.STRING },
  category: { type: DataTypes.STRING },
  unitCost: { type: DataTypes.DECIMAL(10, 2) },
  monthlyUsage: { type: DataTypes.INTEGER },
  leadTimeDays: { type: DataTypes.INTEGER },
  stockLevel: { type: DataTypes.INTEGER },
  reorderPoint: { type: DataTypes.INTEGER },
  qualityScore: { type: DataTypes.DECIMAL(3, 2) },
  status: { type: DataTypes.ENUM('in_stock', 'low_stock', 'out_of_stock', 'on_order'), defaultValue: 'in_stock' }
});

module.exports = SupplyChainItem;
