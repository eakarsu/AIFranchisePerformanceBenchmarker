const sequelize = require('../config/database');
const User = require('./User');
const FranchiseUnit = require('./FranchiseUnit');
const RevenueRecord = require('./RevenueRecord');
const Competitor = require('./Competitor');
const MarketExpansion = require('./MarketExpansion');
const StaffMember = require('./StaffMember');
const CustomerReview = require('./CustomerReview');
const SupplyChainItem = require('./SupplyChainItem');
const TrainingProgram = require('./TrainingProgram');
const MenuItem = require('./MenuItem');
const FinancialRecord = require('./FinancialRecord');
const MarketingCampaign = require('./MarketingCampaign');
const ComplianceRecord = require('./ComplianceRecord');
const TripPlan = require('./TripPlan');
const BenchmarkReport = require('./BenchmarkReport');
const FranchiseValuation = require('./FranchiseValuation');

// Associations
FranchiseUnit.hasMany(RevenueRecord, { foreignKey: 'franchiseUnitId' });
RevenueRecord.belongsTo(FranchiseUnit, { foreignKey: 'franchiseUnitId' });

FranchiseUnit.hasMany(StaffMember, { foreignKey: 'franchiseUnitId' });
StaffMember.belongsTo(FranchiseUnit, { foreignKey: 'franchiseUnitId' });

FranchiseUnit.hasMany(CustomerReview, { foreignKey: 'franchiseUnitId' });
CustomerReview.belongsTo(FranchiseUnit, { foreignKey: 'franchiseUnitId' });

FranchiseUnit.hasMany(FinancialRecord, { foreignKey: 'franchiseUnitId' });
FinancialRecord.belongsTo(FranchiseUnit, { foreignKey: 'franchiseUnitId' });

FranchiseUnit.hasMany(ComplianceRecord, { foreignKey: 'franchiseUnitId' });
ComplianceRecord.belongsTo(FranchiseUnit, { foreignKey: 'franchiseUnitId' });

FranchiseUnit.hasMany(BenchmarkReport, { foreignKey: 'franchiseUnitId' });
BenchmarkReport.belongsTo(FranchiseUnit, { foreignKey: 'franchiseUnitId' });

FranchiseUnit.hasMany(FranchiseValuation, { foreignKey: 'franchiseUnitId' });
FranchiseValuation.belongsTo(FranchiseUnit, { foreignKey: 'franchiseUnitId' });

module.exports = {
  sequelize,
  User,
  FranchiseUnit,
  RevenueRecord,
  Competitor,
  MarketExpansion,
  StaffMember,
  CustomerReview,
  SupplyChainItem,
  TrainingProgram,
  MenuItem,
  FinancialRecord,
  MarketingCampaign,
  ComplianceRecord,
  TripPlan,
  BenchmarkReport,
  FranchiseValuation
};
