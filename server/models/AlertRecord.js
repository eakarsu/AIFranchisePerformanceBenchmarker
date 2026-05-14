const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AlertRecord = sequelize.define('AlertRecord', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  unit_id: { type: DataTypes.INTEGER, allowNull: true },
  unit_name: { type: DataTypes.STRING, allowNull: true },
  alert_type: { type: DataTypes.STRING, allowNull: false }, // anomaly|financial|compliance|combined|goal
  severity: { type: DataTypes.STRING, allowNull: false }, // critical|high|medium|low
  metric: { type: DataTypes.STRING, allowNull: true },
  observed_value: { type: DataTypes.FLOAT, allowNull: true },
  peer_median: { type: DataTypes.FLOAT, allowNull: true },
  delta_pct: { type: DataTypes.FLOAT, allowNull: true },
  ai_explanation: { type: DataTypes.TEXT, allowNull: true },
  status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'open' }, // open|ack|resolved
  payload: { type: DataTypes.JSONB, allowNull: true },
}, {
  tableName: 'alert_records',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = AlertRecord;
