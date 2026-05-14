const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AiResult = sequelize.define('AiResult', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  entity_type: { type: DataTypes.STRING, allowNull: false },
  entity_id: { type: DataTypes.INTEGER, allowNull: true },
  analysis_type: { type: DataTypes.STRING, allowNull: false },
  raw_response: { type: DataTypes.TEXT, allowNull: false },
  parsed_data: { type: DataTypes.JSONB, allowNull: true },
  model: { type: DataTypes.STRING, allowNull: true },
  user_id: { type: DataTypes.INTEGER, allowNull: true },
}, {
  tableName: 'ai_results',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

module.exports = AiResult;
