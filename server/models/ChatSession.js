const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ChatSession = sequelize.define('ChatSession', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  session_id: { type: DataTypes.STRING(64), allowNull: false, unique: true },
  user_id: { type: DataTypes.INTEGER },
  title: { type: DataTypes.STRING(255) },
  message_count: { type: DataTypes.INTEGER, defaultValue: 0 },
  last_active: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'chat_sessions', timestamps: true });

const ChatMessage = sequelize.define('ChatMessage', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  session_id: { type: DataTypes.STRING(64), allowNull: false },
  role: { type: DataTypes.ENUM('user', 'assistant', 'system'), allowNull: false },
  content: { type: DataTypes.TEXT, allowNull: false },
  model: { type: DataTypes.STRING(100) },
}, { tableName: 'chat_messages', timestamps: true, updatedAt: false });

module.exports = { ChatSession, ChatMessage };
