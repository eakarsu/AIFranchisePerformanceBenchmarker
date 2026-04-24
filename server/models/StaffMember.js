const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const StaffMember = sequelize.define('StaffMember', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  franchiseUnitId: { type: DataTypes.INTEGER },
  role: { type: DataTypes.STRING },
  department: { type: DataTypes.STRING },
  salary: { type: DataTypes.DECIMAL(10, 2) },
  hireDate: { type: DataTypes.DATEONLY },
  performanceRating: { type: DataTypes.DECIMAL(3, 2) },
  hoursPerWeek: { type: DataTypes.INTEGER },
  certifications: { type: DataTypes.TEXT },
  status: { type: DataTypes.ENUM('active', 'on_leave', 'terminated'), defaultValue: 'active' }
});

module.exports = StaffMember;
