const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Goal = sequelize.define('Goal', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  unit_id: { type: DataTypes.INTEGER, allowNull: true },
  objective: { type: DataTypes.STRING, allowNull: false },
  key_result: { type: DataTypes.STRING, allowNull: false },
  target_value: { type: DataTypes.FLOAT, allowNull: true },
  current_value: { type: DataTypes.FLOAT, allowNull: true, defaultValue: 0 },
  unit_of_measure: { type: DataTypes.STRING, allowNull: true },
  due_date: { type: DataTypes.DATEONLY, allowNull: true },
  owner: { type: DataTypes.STRING, allowNull: true },
  status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'in_progress' },
  weekly_narrative: { type: DataTypes.TEXT, allowNull: true },
  last_narrative_at: { type: DataTypes.DATE, allowNull: true },
}, {
  tableName: 'goals',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Goal;
