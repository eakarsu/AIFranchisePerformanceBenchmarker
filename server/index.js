require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const { sequelize, FranchiseUnit, RevenueRecord, Competitor, MarketExpansion, StaffMember, CustomerReview, SupplyChainItem, TrainingProgram, MenuItem, FinancialRecord, MarketingCampaign, ComplianceRecord, TripPlan, BenchmarkReport, FranchiseValuation } = require('./models');
const ai = require('./services/openRouterService');
const createCrudRouter = require('./routes/crudFactory');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

app.use(cors());
app.use(express.json());

// Auth routes
app.use('/api/auth', authRoutes);

// CRUD + AI routes for each feature
app.use('/api/franchise-units', createCrudRouter(FranchiseUnit, ai.analyzePerformance));
app.use('/api/revenue-records', createCrudRouter(RevenueRecord, ai.forecastRevenue));
app.use('/api/competitors', createCrudRouter(Competitor, ai.analyzeCompetitor));
app.use('/api/market-expansion', createCrudRouter(MarketExpansion, ai.suggestExpansion));
app.use('/api/staff-members', createCrudRouter(StaffMember, ai.optimizeStaffing));
app.use('/api/customer-reviews', createCrudRouter(CustomerReview, ai.analyzeSentiment));
app.use('/api/supply-chain', createCrudRouter(SupplyChainItem, ai.optimizeSupplyChain));
app.use('/api/training-programs', createCrudRouter(TrainingProgram, ai.recommendTraining));
app.use('/api/menu-items', createCrudRouter(MenuItem, ai.optimizeMenu));
app.use('/api/financial-records', createCrudRouter(FinancialRecord, ai.auditFinancials));
app.use('/api/marketing-campaigns', createCrudRouter(MarketingCampaign, ai.generateCampaign));
app.use('/api/compliance-records', createCrudRouter(ComplianceRecord, ai.checkCompliance));
app.use('/api/trip-plans', createCrudRouter(TripPlan, ai.generateTripPlan));
app.use('/api/benchmark-reports', createCrudRouter(BenchmarkReport, ai.generateBenchmark));
app.use('/api/franchise-valuations', createCrudRouter(FranchiseValuation, ai.estimateValuation));

// AI Center - direct AI queries
const auth = require('./middleware/auth');
app.post('/api/ai/chat', auth, async (req, res) => {
  try {
    const { prompt, context } = req.body;
    const result = await ai.callAI(
      'You are an expert AI assistant for franchise business operations. Provide detailed, actionable insights. Format your response with clear sections using markdown-style headers and bullet points.',
      context ? `Context: ${JSON.stringify(context)}\n\nQuestion: ${prompt}` : prompt
    );
    res.json({ response: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Dashboard stats
app.get('/api/dashboard/stats', auth, async (req, res) => {
  try {
    const [units, revenue, staff, reviews] = await Promise.all([
      FranchiseUnit.count(),
      RevenueRecord.findAll(),
      StaffMember.count(),
      CustomerReview.findAll()
    ]);
    const totalRevenue = revenue.reduce((sum, r) => sum + parseFloat(r.revenue || 0), 0);
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
      : 0;
    res.json({ totalUnits: units, totalRevenue, totalStaff: staff, avgRating: avgRating.toFixed(2) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

async function start() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
