const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TrainingProgram = sequelize.define('TrainingProgram', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  department: { type: DataTypes.STRING },
  duration: { type: DataTypes.STRING },
  skillLevel: { type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'), defaultValue: 'beginner' },
  completionRate: { type: DataTypes.DECIMAL(5, 2) },
  effectiveness: { type: DataTypes.DECIMAL(5, 2) },
  cost: { type: DataTypes.DECIMAL(10, 2) },
  enrolledCount: { type: DataTypes.INTEGER },
  status: { type: DataTypes.ENUM('active', 'draft', 'archived'), defaultValue: 'active' }
});

module.exports = TrainingProgram;
