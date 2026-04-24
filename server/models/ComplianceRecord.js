const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ComplianceRecord = sequelize.define('ComplianceRecord', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  franchiseUnitId: { type: DataTypes.INTEGER },
  category: { type: DataTypes.STRING },
  requirement: { type: DataTypes.STRING, allowNull: false },
  status: { type: DataTypes.ENUM('compliant', 'non_compliant', 'pending_review', 'in_progress'), defaultValue: 'pending_review' },
  lastAuditDate: { type: DataTypes.DATEONLY },
  nextAuditDate: { type: DataTypes.DATEONLY },
  severity: { type: DataTypes.ENUM('critical', 'major', 'minor'), defaultValue: 'minor' },
  notes: { type: DataTypes.TEXT },
  assignedTo: { type: DataTypes.STRING }
});

module.exports = ComplianceRecord;
