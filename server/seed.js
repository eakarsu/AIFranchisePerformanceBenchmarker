require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const {
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
} = require('./models');

async function seed() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Database connected.');

    console.log('Syncing database (force: true)...');
    await sequelize.sync({ force: true });
    console.log('Database synced.');

    // ===== 1. Users (16) =====
    console.log('Seeding Users...');
    await User.bulkCreate([
      { email: 'admin@franchise.com', password: 'password123', name: 'Admin User', role: 'admin' },
      { email: 'jthompson@franchise.com', password: 'password123', name: 'James Thompson', role: 'operator' },
      { email: 'mgarcia@franchise.com', password: 'password123', name: 'Maria Garcia', role: 'operator' },
      { email: 'rjohnson@franchise.com', password: 'password123', name: 'Robert Johnson', role: 'manager' },
      { email: 'achen@franchise.com', password: 'password123', name: 'Angela Chen', role: 'manager' },
      { email: 'dwilliams@franchise.com', password: 'password123', name: 'David Williams', role: 'operator' },
      { email: 'spatel@franchise.com', password: 'password123', name: 'Sanjay Patel', role: 'operator' },
      { email: 'lbrown@franchise.com', password: 'password123', name: 'Linda Brown', role: 'analyst' },
      { email: 'kmiller@franchise.com', password: 'password123', name: 'Kevin Miller', role: 'analyst' },
      { email: 'jlee@franchise.com', password: 'password123', name: 'Jennifer Lee', role: 'operator' },
      { email: 'tharris@franchise.com', password: 'password123', name: 'Thomas Harris', role: 'manager' },
      { email: 'nwilson@franchise.com', password: 'password123', name: 'Nancy Wilson', role: 'operator' },
      { email: 'cmartin@franchise.com', password: 'password123', name: 'Carlos Martin', role: 'operator' },
      { email: 'eroberts@franchise.com', password: 'password123', name: 'Emily Roberts', role: 'analyst' },
      { email: 'bclark@franchise.com', password: 'password123', name: 'Brian Clark', role: 'manager' },
      { email: 'akim@franchise.com', password: 'password123', name: 'Amy Kim', role: 'operator' }
    ], { individualHooks: true });
    console.log('Users seeded.');

    // ===== 2. Franchise Units (16) =====
    console.log('Seeding FranchiseUnits...');
    await FranchiseUnit.bulkCreate([
      { name: 'Downtown Dallas Grill', location: 'Dallas, TX', region: 'South', owner: 'James Thompson', openDate: '2019-03-15', status: 'active', monthlyRevenue: 185000.00, employeeCount: 32, customerRating: 4.50, performanceScore: 88.50, sqFootage: 3200, franchiseType: 'Restaurant' },
      { name: 'Miami Beach Burgers', location: 'Miami, FL', region: 'Southeast', owner: 'Maria Garcia', openDate: '2020-06-01', status: 'active', monthlyRevenue: 210000.00, employeeCount: 28, customerRating: 4.70, performanceScore: 92.30, sqFootage: 2800, franchiseType: 'Restaurant' },
      { name: 'Chicago Loop Eatery', location: 'Chicago, IL', region: 'Midwest', owner: 'Robert Johnson', openDate: '2018-09-20', status: 'active', monthlyRevenue: 195000.00, employeeCount: 35, customerRating: 4.30, performanceScore: 85.10, sqFootage: 3500, franchiseType: 'Restaurant' },
      { name: 'Seattle Pike Cafe', location: 'Seattle, WA', region: 'Northwest', owner: 'Angela Chen', openDate: '2021-01-10', status: 'active', monthlyRevenue: 145000.00, employeeCount: 22, customerRating: 4.60, performanceScore: 90.20, sqFootage: 2200, franchiseType: 'Cafe' },
      { name: 'Phoenix Sunburst Grill', location: 'Phoenix, AZ', region: 'Southwest', owner: 'David Williams', openDate: '2020-11-05', status: 'active', monthlyRevenue: 165000.00, employeeCount: 26, customerRating: 4.20, performanceScore: 82.70, sqFootage: 2900, franchiseType: 'Restaurant' },
      { name: 'Atlanta Peachtree Diner', location: 'Atlanta, GA', region: 'Southeast', owner: 'Sanjay Patel', openDate: '2019-07-22', status: 'active', monthlyRevenue: 178000.00, employeeCount: 30, customerRating: 4.40, performanceScore: 86.90, sqFootage: 3100, franchiseType: 'Restaurant' },
      { name: 'Denver Mountain Bistro', location: 'Denver, CO', region: 'West', owner: 'Linda Brown', openDate: '2022-02-14', status: 'active', monthlyRevenue: 132000.00, employeeCount: 20, customerRating: 4.80, performanceScore: 93.50, sqFootage: 2400, franchiseType: 'Bistro' },
      { name: 'Boston Harbor Grill', location: 'Boston, MA', region: 'Northeast', owner: 'Kevin Miller', openDate: '2017-05-30', status: 'active', monthlyRevenue: 225000.00, employeeCount: 38, customerRating: 4.10, performanceScore: 81.40, sqFootage: 3800, franchiseType: 'Restaurant' },
      { name: 'Nashville Hot Kitchen', location: 'Nashville, TN', region: 'South', owner: 'Jennifer Lee', openDate: '2021-08-18', status: 'active', monthlyRevenue: 155000.00, employeeCount: 24, customerRating: 4.50, performanceScore: 87.60, sqFootage: 2600, franchiseType: 'Restaurant' },
      { name: 'Portland Rose Cafe', location: 'Portland, OR', region: 'Northwest', owner: 'Thomas Harris', openDate: '2022-04-01', status: 'active', monthlyRevenue: 118000.00, employeeCount: 18, customerRating: 4.70, performanceScore: 91.80, sqFootage: 2000, franchiseType: 'Cafe' },
      { name: 'Austin Ranch House', location: 'Austin, TX', region: 'South', owner: 'Nancy Wilson', openDate: '2020-03-12', status: 'active', monthlyRevenue: 198000.00, employeeCount: 34, customerRating: 4.60, performanceScore: 89.40, sqFootage: 3400, franchiseType: 'Restaurant' },
      { name: 'San Diego Coastal Grill', location: 'San Diego, CA', region: 'West', owner: 'Carlos Martin', openDate: '2019-10-08', status: 'active', monthlyRevenue: 205000.00, employeeCount: 31, customerRating: 4.40, performanceScore: 86.20, sqFootage: 3000, franchiseType: 'Restaurant' },
      { name: 'Minneapolis North Star', location: 'Minneapolis, MN', region: 'Midwest', owner: 'Emily Roberts', openDate: '2021-12-01', status: 'active', monthlyRevenue: 125000.00, employeeCount: 21, customerRating: 4.30, performanceScore: 83.90, sqFootage: 2500, franchiseType: 'Restaurant' },
      { name: 'Las Vegas Strip Diner', location: 'Las Vegas, NV', region: 'West', owner: 'Brian Clark', openDate: '2018-06-15', status: 'active', monthlyRevenue: 275000.00, employeeCount: 42, customerRating: 4.00, performanceScore: 79.50, sqFootage: 4200, franchiseType: 'Restaurant' },
      { name: 'New York Midtown Express', location: 'New York, NY', region: 'Northeast', owner: 'Amy Kim', openDate: '2017-01-20', status: 'active', monthlyRevenue: 320000.00, employeeCount: 45, customerRating: 4.20, performanceScore: 84.70, sqFootage: 2800, franchiseType: 'Restaurant' },
      { name: 'Orlando Sunshine Grill', location: 'Orlando, FL', region: 'Southeast', owner: 'James Thompson', openDate: '2023-01-05', status: 'pending', monthlyRevenue: 0.00, employeeCount: 0, customerRating: 0.00, performanceScore: 0.00, sqFootage: 3300, franchiseType: 'Restaurant' }
    ]);
    console.log('FranchiseUnits seeded.');

    // ===== 3. Revenue Records (18) =====
    console.log('Seeding RevenueRecords...');
    await RevenueRecord.bulkCreate([
      { franchiseUnitId: 1, month: 'January', year: 2025, revenue: 182000.00, expenses: 128000.00, profit: 54000.00, customerCount: 8200, averageTicket: 22.20, category: 'Dine-in' },
      { franchiseUnitId: 1, month: 'February', year: 2025, revenue: 175000.00, expenses: 125000.00, profit: 50000.00, customerCount: 7800, averageTicket: 22.44, category: 'Dine-in' },
      { franchiseUnitId: 2, month: 'January', year: 2025, revenue: 215000.00, expenses: 142000.00, profit: 73000.00, customerCount: 9500, averageTicket: 22.63, category: 'Dine-in' },
      { franchiseUnitId: 2, month: 'February', year: 2025, revenue: 208000.00, expenses: 138000.00, profit: 70000.00, customerCount: 9100, averageTicket: 22.86, category: 'Dine-in' },
      { franchiseUnitId: 3, month: 'January', year: 2025, revenue: 198000.00, expenses: 145000.00, profit: 53000.00, customerCount: 8800, averageTicket: 22.50, category: 'Dine-in' },
      { franchiseUnitId: 3, month: 'February', year: 2025, revenue: 190000.00, expenses: 140000.00, profit: 50000.00, customerCount: 8400, averageTicket: 22.62, category: 'Takeout' },
      { franchiseUnitId: 4, month: 'January', year: 2025, revenue: 148000.00, expenses: 98000.00, profit: 50000.00, customerCount: 6200, averageTicket: 23.87, category: 'Cafe' },
      { franchiseUnitId: 5, month: 'January', year: 2025, revenue: 168000.00, expenses: 118000.00, profit: 50000.00, customerCount: 7500, averageTicket: 22.40, category: 'Dine-in' },
      { franchiseUnitId: 6, month: 'January', year: 2025, revenue: 180000.00, expenses: 130000.00, profit: 50000.00, customerCount: 8000, averageTicket: 22.50, category: 'Dine-in' },
      { franchiseUnitId: 7, month: 'January', year: 2025, revenue: 135000.00, expenses: 88000.00, profit: 47000.00, customerCount: 5500, averageTicket: 24.55, category: 'Bistro' },
      { franchiseUnitId: 8, month: 'January', year: 2025, revenue: 228000.00, expenses: 168000.00, profit: 60000.00, customerCount: 10200, averageTicket: 22.35, category: 'Dine-in' },
      { franchiseUnitId: 9, month: 'January', year: 2025, revenue: 158000.00, expenses: 110000.00, profit: 48000.00, customerCount: 7000, averageTicket: 22.57, category: 'Dine-in' },
      { franchiseUnitId: 10, month: 'January', year: 2025, revenue: 120000.00, expenses: 82000.00, profit: 38000.00, customerCount: 5000, averageTicket: 24.00, category: 'Cafe' },
      { franchiseUnitId: 11, month: 'January', year: 2025, revenue: 200000.00, expenses: 140000.00, profit: 60000.00, customerCount: 9000, averageTicket: 22.22, category: 'Dine-in' },
      { franchiseUnitId: 12, month: 'January', year: 2025, revenue: 208000.00, expenses: 148000.00, profit: 60000.00, customerCount: 9200, averageTicket: 22.61, category: 'Dine-in' },
      { franchiseUnitId: 13, month: 'January', year: 2025, revenue: 128000.00, expenses: 95000.00, profit: 33000.00, customerCount: 5800, averageTicket: 22.07, category: 'Dine-in' },
      { franchiseUnitId: 14, month: 'January', year: 2025, revenue: 280000.00, expenses: 205000.00, profit: 75000.00, customerCount: 12500, averageTicket: 22.40, category: 'Dine-in' },
      { franchiseUnitId: 15, month: 'January', year: 2025, revenue: 325000.00, expenses: 248000.00, profit: 77000.00, customerCount: 14000, averageTicket: 23.21, category: 'Dine-in' }
    ]);
    console.log('RevenueRecords seeded.');

    // ===== 4. Competitors (16) =====
    console.log('Seeding Competitors...');
    await Competitor.bulkCreate([
      { name: "McDonald's", location: 'Nationwide', marketShare: 21.50, strengths: 'Global brand recognition, massive supply chain, low prices', weaknesses: 'Perceived low quality, health criticism', priceRange: '$5-$12', category: 'Fast Food', rating: 3.80, estimatedRevenue: 23000000000.00, threatLevel: 'high' },
      { name: "Wendy's", location: 'Nationwide', marketShare: 8.20, strengths: 'Fresh beef messaging, strong social media', weaknesses: 'Smaller footprint than competitors', priceRange: '$5-$14', category: 'Fast Food', rating: 4.00, estimatedRevenue: 11500000000.00, threatLevel: 'high' },
      { name: 'Chick-fil-A', location: 'Nationwide', marketShare: 11.30, strengths: 'Customer service, brand loyalty, consistent quality', weaknesses: 'Closed Sundays, limited menu', priceRange: '$6-$15', category: 'Fast Casual', rating: 4.50, estimatedRevenue: 18000000000.00, threatLevel: 'high' },
      { name: 'Five Guys', location: 'Nationwide', marketShare: 3.40, strengths: 'Quality ingredients, customizable burgers', weaknesses: 'Higher prices, limited menu', priceRange: '$10-$20', category: 'Fast Casual', rating: 4.30, estimatedRevenue: 3500000000.00, threatLevel: 'medium' },
      { name: 'Shake Shack', location: 'Major Cities', marketShare: 1.80, strengths: 'Premium positioning, strong urban presence', weaknesses: 'Limited suburban reach, higher prices', priceRange: '$8-$18', category: 'Fast Casual', rating: 4.40, estimatedRevenue: 900000000.00, threatLevel: 'medium' },
      { name: 'Chipotle', location: 'Nationwide', marketShare: 7.60, strengths: 'Fresh ingredients, customization, speed', weaknesses: 'Food safety history, rising prices', priceRange: '$8-$16', category: 'Fast Casual', rating: 4.10, estimatedRevenue: 9800000000.00, threatLevel: 'high' },
      { name: 'Panera Bread', location: 'Nationwide', marketShare: 4.50, strengths: 'Healthy image, bakery selection, wifi/atmosphere', weaknesses: 'Slow service, high prices for portions', priceRange: '$8-$16', category: 'Fast Casual', rating: 4.00, estimatedRevenue: 5800000000.00, threatLevel: 'medium' },
      { name: 'Sweetgreen', location: 'Major Cities', marketShare: 0.90, strengths: 'Health-focused, tech-forward ordering', weaknesses: 'Limited locations, expensive', priceRange: '$12-$20', category: 'Fast Casual', rating: 4.20, estimatedRevenue: 500000000.00, threatLevel: 'low' },
      { name: 'In-N-Out Burger', location: 'Western US', marketShare: 2.80, strengths: 'Cult following, consistent quality, affordable', weaknesses: 'Limited geographic reach', priceRange: '$4-$10', category: 'Fast Food', rating: 4.60, estimatedRevenue: 1200000000.00, threatLevel: 'medium' },
      { name: 'Wingstop', location: 'Nationwide', marketShare: 2.10, strengths: 'Focused menu, delivery-first model', weaknesses: 'Single category, volatile wing prices', priceRange: '$8-$18', category: 'Fast Casual', rating: 4.00, estimatedRevenue: 2800000000.00, threatLevel: 'medium' },
      { name: 'Popeyes', location: 'Nationwide', marketShare: 4.90, strengths: 'Chicken sandwich hype, bold flavors', weaknesses: 'Inconsistent service, older locations', priceRange: '$5-$14', category: 'Fast Food', rating: 3.90, estimatedRevenue: 5500000000.00, threatLevel: 'medium' },
      { name: 'Raising Canes', location: 'Expanding', marketShare: 2.50, strengths: 'Hyper-focused menu, fast service, loyal fans', weaknesses: 'Extremely limited menu', priceRange: '$6-$14', category: 'Fast Food', rating: 4.50, estimatedRevenue: 3200000000.00, threatLevel: 'medium' },
      { name: 'CAVA', location: 'East Coast & Expanding', marketShare: 0.70, strengths: 'Mediterranean niche, IPO momentum, fresh concept', weaknesses: 'Small footprint, regional', priceRange: '$10-$18', category: 'Fast Casual', rating: 4.30, estimatedRevenue: 700000000.00, threatLevel: 'low' },
      { name: 'Taco Bell', location: 'Nationwide', marketShare: 9.10, strengths: 'Value menu, late night, innovation', weaknesses: 'Quality perception, health concerns', priceRange: '$3-$12', category: 'Fast Food', rating: 3.70, estimatedRevenue: 14000000000.00, threatLevel: 'high' },
      { name: 'Culvers', location: 'Midwest', marketShare: 1.60, strengths: 'Butterburgers, frozen custard, friendly service', weaknesses: 'Regional only, slower expansion', priceRange: '$6-$14', category: 'Fast Casual', rating: 4.50, estimatedRevenue: 2000000000.00, threatLevel: 'low' },
      { name: 'Noodles & Company', location: 'Nationwide', marketShare: 0.50, strengths: 'Unique niche, varied menu', weaknesses: 'Low brand awareness, declining traffic', priceRange: '$8-$15', category: 'Fast Casual', rating: 3.80, estimatedRevenue: 460000000.00, threatLevel: 'low' }
    ]);
    console.log('Competitors seeded.');

    // ===== 5. Market Expansions (16) =====
    console.log('Seeding MarketExpansions...');
    await MarketExpansion.bulkCreate([
      { targetCity: 'Charlotte', state: 'NC', population: 897720, medianIncome: 65000.00, competitorCount: 12, demandScore: 82.50, investmentRequired: 450000.00, projectedROI: 18.50, riskLevel: 'low', status: 'approved' },
      { targetCity: 'Raleigh', state: 'NC', population: 474069, medianIncome: 70200.00, competitorCount: 8, demandScore: 78.30, investmentRequired: 380000.00, projectedROI: 22.00, riskLevel: 'low', status: 'in_progress' },
      { targetCity: 'Salt Lake City', state: 'UT', population: 200133, medianIncome: 60500.00, competitorCount: 6, demandScore: 74.80, investmentRequired: 350000.00, projectedROI: 19.70, riskLevel: 'medium', status: 'researching' },
      { targetCity: 'Tampa', state: 'FL', population: 403364, medianIncome: 55800.00, competitorCount: 15, demandScore: 85.10, investmentRequired: 520000.00, projectedROI: 15.30, riskLevel: 'medium', status: 'approved' },
      { targetCity: 'Sacramento', state: 'CA', population: 528001, medianIncome: 67200.00, competitorCount: 11, demandScore: 79.60, investmentRequired: 580000.00, projectedROI: 14.80, riskLevel: 'medium', status: 'researching' },
      { targetCity: 'Kansas City', state: 'MO', population: 508090, medianIncome: 57400.00, competitorCount: 9, demandScore: 76.40, investmentRequired: 340000.00, projectedROI: 21.50, riskLevel: 'low', status: 'approved' },
      { targetCity: 'Columbus', state: 'OH', population: 913175, medianIncome: 58900.00, competitorCount: 10, demandScore: 80.20, investmentRequired: 400000.00, projectedROI: 20.10, riskLevel: 'low', status: 'in_progress' },
      { targetCity: 'San Antonio', state: 'TX', population: 1547253, medianIncome: 53400.00, competitorCount: 14, demandScore: 88.70, investmentRequired: 460000.00, projectedROI: 17.90, riskLevel: 'medium', status: 'researching' },
      { targetCity: 'Pittsburgh', state: 'PA', population: 302971, medianIncome: 52800.00, competitorCount: 7, demandScore: 71.30, investmentRequired: 370000.00, projectedROI: 16.40, riskLevel: 'medium', status: 'researching' },
      { targetCity: 'Indianapolis', state: 'IN', population: 887642, medianIncome: 55100.00, competitorCount: 8, demandScore: 77.90, investmentRequired: 360000.00, projectedROI: 20.80, riskLevel: 'low', status: 'approved' },
      { targetCity: 'Cincinnati', state: 'OH', population: 309317, medianIncome: 50300.00, competitorCount: 7, demandScore: 72.10, investmentRequired: 330000.00, projectedROI: 19.20, riskLevel: 'low', status: 'researching' },
      { targetCity: 'Richmond', state: 'VA', population: 226610, medianIncome: 53200.00, competitorCount: 5, demandScore: 68.50, investmentRequired: 310000.00, projectedROI: 23.40, riskLevel: 'low', status: 'in_progress' },
      { targetCity: 'Boise', state: 'ID', population: 235684, medianIncome: 61000.00, competitorCount: 3, demandScore: 65.80, investmentRequired: 290000.00, projectedROI: 25.60, riskLevel: 'low', status: 'researching' },
      { targetCity: 'Tucson', state: 'AZ', population: 542629, medianIncome: 47500.00, competitorCount: 9, demandScore: 73.40, investmentRequired: 320000.00, projectedROI: 17.10, riskLevel: 'medium', status: 'researching' },
      { targetCity: 'Omaha', state: 'NE', population: 486051, medianIncome: 62700.00, competitorCount: 5, demandScore: 70.90, investmentRequired: 310000.00, projectedROI: 22.80, riskLevel: 'low', status: 'approved' },
      { targetCity: 'Milwaukee', state: 'WI', population: 577222, medianIncome: 46300.00, competitorCount: 8, demandScore: 74.20, investmentRequired: 350000.00, projectedROI: 16.90, riskLevel: 'medium', status: 'researching' }
    ]);
    console.log('MarketExpansions seeded.');

    // ===== 6. Staff Members (18) =====
    console.log('Seeding StaffMembers...');
    await StaffMember.bulkCreate([
      { name: 'Marcus Johnson', franchiseUnitId: 1, role: 'General Manager', department: 'Management', salary: 72000.00, hireDate: '2019-03-15', performanceRating: 4.50, hoursPerWeek: 45, certifications: 'ServSafe Manager, Food Safety Level 3', status: 'active' },
      { name: 'Sofia Ramirez', franchiseUnitId: 1, role: 'Shift Supervisor', department: 'Operations', salary: 42000.00, hireDate: '2020-01-10', performanceRating: 4.20, hoursPerWeek: 40, certifications: 'ServSafe, First Aid', status: 'active' },
      { name: 'Derek Washington', franchiseUnitId: 2, role: 'General Manager', department: 'Management', salary: 78000.00, hireDate: '2020-06-01', performanceRating: 4.70, hoursPerWeek: 48, certifications: 'ServSafe Manager, HACCP', status: 'active' },
      { name: 'Ashley Nguyen', franchiseUnitId: 2, role: 'Head Chef', department: 'Kitchen', salary: 55000.00, hireDate: '2020-07-15', performanceRating: 4.60, hoursPerWeek: 42, certifications: 'Culinary Arts Degree, ServSafe', status: 'active' },
      { name: 'Tyler Brooks', franchiseUnitId: 3, role: 'General Manager', department: 'Management', salary: 70000.00, hireDate: '2018-09-20', performanceRating: 3.90, hoursPerWeek: 45, certifications: 'ServSafe Manager', status: 'active' },
      { name: 'Rachel Kim', franchiseUnitId: 4, role: 'Cafe Manager', department: 'Management', salary: 58000.00, hireDate: '2021-01-10', performanceRating: 4.80, hoursPerWeek: 42, certifications: 'Barista Level 2, ServSafe', status: 'active' },
      { name: 'Jordan Davis', franchiseUnitId: 5, role: 'Shift Supervisor', department: 'Operations', salary: 38000.00, hireDate: '2021-03-01', performanceRating: 3.70, hoursPerWeek: 38, certifications: 'ServSafe', status: 'active' },
      { name: 'Megan O\'Brien', franchiseUnitId: 6, role: 'General Manager', department: 'Management', salary: 68000.00, hireDate: '2019-07-22', performanceRating: 4.30, hoursPerWeek: 44, certifications: 'ServSafe Manager, Leadership Certificate', status: 'active' },
      { name: 'Chris Martinez', franchiseUnitId: 7, role: 'Sous Chef', department: 'Kitchen', salary: 48000.00, hireDate: '2022-03-01', performanceRating: 4.40, hoursPerWeek: 40, certifications: 'Culinary Certificate, Food Handlers', status: 'active' },
      { name: 'Samantha Taylor', franchiseUnitId: 8, role: 'General Manager', department: 'Management', salary: 82000.00, hireDate: '2017-05-30', performanceRating: 4.10, hoursPerWeek: 50, certifications: 'ServSafe Manager, MBA', status: 'active' },
      { name: 'Jason Patel', franchiseUnitId: 9, role: 'Kitchen Manager', department: 'Kitchen', salary: 52000.00, hireDate: '2021-09-01', performanceRating: 4.00, hoursPerWeek: 42, certifications: 'ServSafe, HACCP', status: 'active' },
      { name: 'Brittany Collins', franchiseUnitId: 10, role: 'Barista Lead', department: 'Operations', salary: 36000.00, hireDate: '2022-04-15', performanceRating: 4.60, hoursPerWeek: 35, certifications: 'Barista Level 3', status: 'active' },
      { name: 'Terrence White', franchiseUnitId: 11, role: 'General Manager', department: 'Management', salary: 74000.00, hireDate: '2020-03-12', performanceRating: 4.40, hoursPerWeek: 45, certifications: 'ServSafe Manager, Six Sigma Green Belt', status: 'active' },
      { name: 'Laura Fernandez', franchiseUnitId: 12, role: 'Front of House Manager', department: 'Operations', salary: 46000.00, hireDate: '2020-01-15', performanceRating: 4.30, hoursPerWeek: 40, certifications: 'ServSafe, Customer Service Excellence', status: 'active' },
      { name: 'Nathan Lee', franchiseUnitId: 13, role: 'General Manager', department: 'Management', salary: 62000.00, hireDate: '2022-01-05', performanceRating: 3.80, hoursPerWeek: 44, certifications: 'ServSafe Manager', status: 'active' },
      { name: 'Diana Morales', franchiseUnitId: 14, role: 'General Manager', department: 'Management', salary: 88000.00, hireDate: '2018-06-15', performanceRating: 4.00, hoursPerWeek: 50, certifications: 'ServSafe Manager, Hospitality Diploma', status: 'active' },
      { name: 'Ryan Scott', franchiseUnitId: 15, role: 'General Manager', department: 'Management', salary: 95000.00, hireDate: '2017-01-20', performanceRating: 4.20, hoursPerWeek: 52, certifications: 'ServSafe Manager, MBA, HACCP', status: 'active' },
      { name: 'Kayla Robinson', franchiseUnitId: 1, role: 'Line Cook', department: 'Kitchen', salary: 32000.00, hireDate: '2023-06-01', performanceRating: 3.50, hoursPerWeek: 35, certifications: 'Food Handlers', status: 'on_leave' }
    ]);
    console.log('StaffMembers seeded.');

    // ===== 7. Customer Reviews (18) =====
    console.log('Seeding CustomerReviews...');
    await CustomerReview.bulkCreate([
      { franchiseUnitId: 1, customerName: 'John M.', rating: 5, reviewText: 'Best burger I have had in Dallas. The fries were perfectly crispy and the service was fast and friendly.', sentiment: 'positive', category: 'Food Quality', source: 'Google', reviewDate: '2025-01-15', responseStatus: 'responded' },
      { franchiseUnitId: 1, customerName: 'Sarah L.', rating: 3, reviewText: 'Food was decent but the wait time was about 25 minutes even though the restaurant was half empty.', sentiment: 'neutral', category: 'Service', source: 'Yelp', reviewDate: '2025-02-02', responseStatus: 'responded' },
      { franchiseUnitId: 2, customerName: 'Mike R.', rating: 5, reviewText: 'Amazing ocean views and even better food. The fish tacos are a must-try. Will definitely come back.', sentiment: 'positive', category: 'Food Quality', source: 'Google', reviewDate: '2025-01-20', responseStatus: 'responded' },
      { franchiseUnitId: 2, customerName: 'Patricia K.', rating: 2, reviewText: 'Overpriced for what you get. The portion sizes have decreased significantly since my last visit.', sentiment: 'negative', category: 'Value', source: 'Yelp', reviewDate: '2025-02-10', responseStatus: 'escalated' },
      { franchiseUnitId: 3, customerName: 'David W.', rating: 4, reviewText: 'Solid food in a great location downtown. The deep dish special was excellent but took 40 minutes.', sentiment: 'positive', category: 'Food Quality', source: 'TripAdvisor', reviewDate: '2025-01-25', responseStatus: 'responded' },
      { franchiseUnitId: 4, customerName: 'Emily T.', rating: 5, reviewText: 'Perfect spot for a morning coffee and pastry. The latte art alone is worth the visit. Cozy atmosphere.', sentiment: 'positive', category: 'Atmosphere', source: 'Google', reviewDate: '2025-02-05', responseStatus: 'responded' },
      { franchiseUnitId: 5, customerName: 'Robert G.', rating: 3, reviewText: 'The food was okay but nothing special. I expected more from the reviews. Average experience overall.', sentiment: 'neutral', category: 'Food Quality', source: 'Yelp', reviewDate: '2025-01-18', responseStatus: 'pending' },
      { franchiseUnitId: 6, customerName: 'Lisa H.', rating: 4, reviewText: 'Great Southern comfort food. The fried chicken was crispy and juicy. Sides were generous portions.', sentiment: 'positive', category: 'Food Quality', source: 'Google', reviewDate: '2025-02-12', responseStatus: 'responded' },
      { franchiseUnitId: 7, customerName: 'James F.', rating: 5, reviewText: 'Hidden gem in Denver! The seasonal menu is creative and everything tastes farm-fresh. Loved it.', sentiment: 'positive', category: 'Food Quality', source: 'TripAdvisor', reviewDate: '2025-01-30', responseStatus: 'responded' },
      { franchiseUnitId: 8, customerName: 'Karen A.', rating: 1, reviewText: 'Terrible experience. Found a hair in my soup and the manager was dismissive about it. Never coming back.', sentiment: 'negative', category: 'Cleanliness', source: 'Yelp', reviewDate: '2025-02-08', responseStatus: 'escalated' },
      { franchiseUnitId: 9, customerName: 'Brian N.', rating: 4, reviewText: 'The hot chicken sandwich lives up to the hype. Great heat level options. Side of mac and cheese was solid.', sentiment: 'positive', category: 'Food Quality', source: 'Google', reviewDate: '2025-01-22', responseStatus: 'responded' },
      { franchiseUnitId: 10, customerName: 'Amanda S.', rating: 5, reviewText: 'Best coffee shop in Portland, which is saying something! The pour-over is exceptional and the pastries are baked fresh.', sentiment: 'positive', category: 'Beverages', source: 'Google', reviewDate: '2025-02-14', responseStatus: 'responded' },
      { franchiseUnitId: 11, customerName: 'Steve C.', rating: 4, reviewText: 'Solid Texas BBQ vibes. Brisket was tender and smoky. Portions are big. Good value for money.', sentiment: 'positive', category: 'Value', source: 'Yelp', reviewDate: '2025-01-28', responseStatus: 'responded' },
      { franchiseUnitId: 12, customerName: 'Nicole P.', rating: 2, reviewText: 'Was excited to try this place but the AC was broken and it was sweltering inside. Food came out cold ironically.', sentiment: 'negative', category: 'Facilities', source: 'Google', reviewDate: '2025-02-03', responseStatus: 'escalated' },
      { franchiseUnitId: 13, customerName: 'Andrew B.', rating: 3, reviewText: 'Standard franchise fare. Nothing wrong with it but nothing memorable either. Fine for a quick lunch.', sentiment: 'neutral', category: 'Food Quality', source: 'Yelp', reviewDate: '2025-02-06', responseStatus: 'pending' },
      { franchiseUnitId: 14, customerName: 'Jessica V.', rating: 4, reviewText: 'Open late which is a huge plus in Vegas. The loaded fries are incredible after a night out. Quick service.', sentiment: 'positive', category: 'Convenience', source: 'Google', reviewDate: '2025-01-12', responseStatus: 'responded' },
      { franchiseUnitId: 15, customerName: 'William D.', rating: 3, reviewText: 'Very busy, very loud, very New York. Food is solid but expect to wait. Prices are steep for what it is.', sentiment: 'neutral', category: 'Value', source: 'TripAdvisor', reviewDate: '2025-02-15', responseStatus: 'pending' },
      { franchiseUnitId: 3, customerName: 'Olivia R.', rating: 1, reviewText: 'Order was completely wrong and staff seemed annoyed when I asked them to fix it. Really disappointing.', sentiment: 'negative', category: 'Service', source: 'Yelp', reviewDate: '2025-02-18', responseStatus: 'escalated' }
    ]);
    console.log('CustomerReviews seeded.');

    // ===== 8. Supply Chain Items (16) =====
    console.log('Seeding SupplyChainItems...');
    await SupplyChainItem.bulkCreate([
      { itemName: 'Ground Beef Patties (80/20)', supplier: 'National Beef Co.', category: 'Protein', unitCost: 4.85, monthlyUsage: 12000, leadTimeDays: 3, stockLevel: 8500, reorderPoint: 3000, qualityScore: 4.50, status: 'in_stock' },
      { itemName: 'Brioche Burger Buns', supplier: 'Artisan Bakery Supply', category: 'Bakery', unitCost: 0.65, monthlyUsage: 15000, leadTimeDays: 2, stockLevel: 12000, reorderPoint: 4000, qualityScore: 4.30, status: 'in_stock' },
      { itemName: 'Idaho Russet Potatoes (50lb)', supplier: 'Idaho Harvest Farms', category: 'Produce', unitCost: 22.50, monthlyUsage: 800, leadTimeDays: 4, stockLevel: 350, reorderPoint: 200, qualityScore: 4.60, status: 'in_stock' },
      { itemName: 'Cheddar Cheese Slices', supplier: 'Dairy Fresh Inc.', category: 'Dairy', unitCost: 2.20, monthlyUsage: 10000, leadTimeDays: 3, stockLevel: 2800, reorderPoint: 2500, qualityScore: 4.40, status: 'low_stock' },
      { itemName: 'Iceberg Lettuce (case)', supplier: 'Green Valley Produce', category: 'Produce', unitCost: 28.00, monthlyUsage: 600, leadTimeDays: 2, stockLevel: 420, reorderPoint: 150, qualityScore: 4.10, status: 'in_stock' },
      { itemName: 'Roma Tomatoes (25lb)', supplier: 'Green Valley Produce', category: 'Produce', unitCost: 18.75, monthlyUsage: 500, leadTimeDays: 2, stockLevel: 180, reorderPoint: 125, qualityScore: 4.20, status: 'in_stock' },
      { itemName: 'Canola Frying Oil (35lb)', supplier: 'CulinaryOils Corp.', category: 'Cooking Supplies', unitCost: 32.00, monthlyUsage: 400, leadTimeDays: 5, stockLevel: 85, reorderPoint: 100, qualityScore: 4.00, status: 'low_stock' },
      { itemName: 'Chicken Breast (boneless)', supplier: 'Tyson Foods', category: 'Protein', unitCost: 3.95, monthlyUsage: 8000, leadTimeDays: 3, stockLevel: 6200, reorderPoint: 2000, qualityScore: 4.30, status: 'in_stock' },
      { itemName: 'Coca-Cola Syrup (5gal)', supplier: 'Coca-Cola Bottling', category: 'Beverages', unitCost: 75.00, monthlyUsage: 120, leadTimeDays: 5, stockLevel: 90, reorderPoint: 30, qualityScore: 4.80, status: 'in_stock' },
      { itemName: 'To-Go Containers (compostable)', supplier: 'EcoPack Solutions', category: 'Packaging', unitCost: 0.35, monthlyUsage: 20000, leadTimeDays: 7, stockLevel: 15000, reorderPoint: 5000, qualityScore: 3.90, status: 'in_stock' },
      { itemName: 'Bacon Strips (pre-cooked)', supplier: 'Smithfield Farms', category: 'Protein', unitCost: 5.50, monthlyUsage: 6000, leadTimeDays: 4, stockLevel: 1200, reorderPoint: 1500, qualityScore: 4.40, status: 'low_stock' },
      { itemName: 'Sandwich Pickles (gallon)', supplier: 'Vlasic Food Service', category: 'Condiments', unitCost: 8.25, monthlyUsage: 200, leadTimeDays: 6, stockLevel: 150, reorderPoint: 50, qualityScore: 4.20, status: 'in_stock' },
      { itemName: 'Ketchup Packets (1000ct)', supplier: 'Heinz Food Service', category: 'Condiments', unitCost: 38.00, monthlyUsage: 80, leadTimeDays: 5, stockLevel: 0, reorderPoint: 20, qualityScore: 4.70, status: 'out_of_stock' },
      { itemName: 'Coffee Beans (5lb Arabica)', supplier: 'Blue Mountain Roasters', category: 'Beverages', unitCost: 42.00, monthlyUsage: 300, leadTimeDays: 7, stockLevel: 220, reorderPoint: 75, qualityScore: 4.90, status: 'in_stock' },
      { itemName: 'Paper Napkins (6000ct)', supplier: 'Georgia-Pacific', category: 'Supplies', unitCost: 45.00, monthlyUsage: 50, leadTimeDays: 10, stockLevel: 35, reorderPoint: 12, qualityScore: 3.80, status: 'in_stock' },
      { itemName: 'Flour Tortillas (12in, 144ct)', supplier: 'Mission Foods', category: 'Bakery', unitCost: 18.50, monthlyUsage: 250, leadTimeDays: 4, stockLevel: 60, reorderPoint: 60, qualityScore: 4.30, status: 'on_order' }
    ]);
    console.log('SupplyChainItems seeded.');

    // ===== 9. Training Programs (16) =====
    console.log('Seeding TrainingPrograms...');
    await TrainingProgram.bulkCreate([
      { title: 'New Hire Orientation', description: 'Comprehensive introduction to company culture, policies, safety procedures, and job expectations for all new team members.', department: 'All', duration: '8 hours', skillLevel: 'beginner', completionRate: 98.50, effectiveness: 82.00, cost: 150.00, enrolledCount: 120, status: 'active' },
      { title: 'Food Safety & Hygiene Certification', description: 'ServSafe-aligned food safety training covering temperature control, cross-contamination prevention, and sanitation practices.', department: 'Kitchen', duration: '16 hours', skillLevel: 'beginner', completionRate: 95.20, effectiveness: 91.00, cost: 350.00, enrolledCount: 85, status: 'active' },
      { title: 'Advanced Grill Techniques', description: 'Master the art of grilling including temperature management, sear techniques, and timing for consistent quality.', department: 'Kitchen', duration: '12 hours', skillLevel: 'intermediate', completionRate: 88.00, effectiveness: 87.50, cost: 275.00, enrolledCount: 40, status: 'active' },
      { title: 'Customer Service Excellence', description: 'Training on handling complaints, upselling, creating memorable guest experiences, and building loyalty.', department: 'Front of House', duration: '6 hours', skillLevel: 'beginner', completionRate: 92.30, effectiveness: 85.00, cost: 120.00, enrolledCount: 95, status: 'active' },
      { title: 'Shift Leadership Bootcamp', description: 'Develop leadership skills for supervisors including scheduling, conflict resolution, team motivation, and operational management.', department: 'Management', duration: '24 hours', skillLevel: 'intermediate', completionRate: 85.60, effectiveness: 89.20, cost: 800.00, enrolledCount: 28, status: 'active' },
      { title: 'POS System Mastery', description: 'Complete training on point-of-sale operations including order entry, payment processing, refunds, and reporting.', department: 'Front of House', duration: '4 hours', skillLevel: 'beginner', completionRate: 97.00, effectiveness: 90.00, cost: 75.00, enrolledCount: 110, status: 'active' },
      { title: 'Inventory Management Fundamentals', description: 'Learn best practices for stock counting, waste tracking, FIFO rotation, and reorder point calculations.', department: 'Operations', duration: '8 hours', skillLevel: 'intermediate', completionRate: 82.40, effectiveness: 84.00, cost: 200.00, enrolledCount: 35, status: 'active' },
      { title: 'Financial Reporting for Managers', description: 'Understanding P&L statements, food cost analysis, labor cost management, and budget variance reporting.', department: 'Management', duration: '20 hours', skillLevel: 'advanced', completionRate: 78.00, effectiveness: 88.50, cost: 1200.00, enrolledCount: 18, status: 'active' },
      { title: 'Allergen Awareness Program', description: 'Identifying and managing common food allergens, cross-contact prevention, and emergency response procedures.', department: 'All', duration: '3 hours', skillLevel: 'beginner', completionRate: 96.80, effectiveness: 93.00, cost: 50.00, enrolledCount: 130, status: 'active' },
      { title: 'Barista Skills Workshop', description: 'Espresso extraction, milk steaming, latte art, cold brew techniques, and drink consistency standards.', department: 'Kitchen', duration: '10 hours', skillLevel: 'intermediate', completionRate: 90.10, effectiveness: 86.00, cost: 300.00, enrolledCount: 22, status: 'active' },
      { title: 'HACCP Compliance Training', description: 'Hazard Analysis and Critical Control Points training for kitchen managers and lead cooks.', department: 'Kitchen', duration: '16 hours', skillLevel: 'advanced', completionRate: 80.50, effectiveness: 92.50, cost: 500.00, enrolledCount: 15, status: 'active' },
      { title: 'Franchise Operations Mastery', description: 'Deep dive into franchise standards, brand guidelines, audit preparation, and performance benchmarking.', department: 'Management', duration: '32 hours', skillLevel: 'advanced', completionRate: 72.00, effectiveness: 90.80, cost: 1500.00, enrolledCount: 12, status: 'active' },
      { title: 'Digital Marketing for Local Stores', description: 'Social media management, local SEO, Google Business optimization, and running promotional campaigns.', department: 'Marketing', duration: '12 hours', skillLevel: 'intermediate', completionRate: 84.20, effectiveness: 78.50, cost: 400.00, enrolledCount: 20, status: 'active' },
      { title: 'Workplace Safety & Emergency Response', description: 'Fire safety, slip/fall prevention, equipment safety, first aid basics, and emergency evacuation procedures.', department: 'All', duration: '4 hours', skillLevel: 'beginner', completionRate: 99.00, effectiveness: 88.00, cost: 80.00, enrolledCount: 140, status: 'active' },
      { title: 'Delivery Operations Optimization', description: 'Efficient order packaging, driver coordination, third-party platform management, and delivery time targets.', department: 'Operations', duration: '6 hours', skillLevel: 'beginner', completionRate: 91.50, effectiveness: 81.00, cost: 100.00, enrolledCount: 55, status: 'active' },
      { title: 'Advanced Menu Engineering', description: 'Using data analytics to optimize menu layout, pricing strategy, item profitability, and seasonal menu planning.', department: 'Management', duration: '14 hours', skillLevel: 'advanced', completionRate: 68.00, effectiveness: 85.00, cost: 900.00, enrolledCount: 10, status: 'draft' }
    ]);
    console.log('TrainingPrograms seeded.');

    // ===== 10. Menu Items (18) =====
    console.log('Seeding MenuItems...');
    await MenuItem.bulkCreate([
      { name: 'Classic Smash Burger', category: 'Burgers', price: 12.99, cost: 4.20, profitMargin: 67.67, popularity: 95, calories: 680, isActive: true, description: 'Double smashed patties with American cheese, pickles, onions, and special sauce on a brioche bun.', monthlySales: 8500 },
      { name: 'BBQ Bacon Burger', category: 'Burgers', price: 14.99, cost: 5.10, profitMargin: 65.98, popularity: 88, calories: 820, isActive: true, description: 'Angus patty topped with crispy bacon, cheddar, onion rings, and smoky BBQ sauce.', monthlySales: 6200 },
      { name: 'Crispy Chicken Sandwich', category: 'Chicken', price: 11.99, cost: 3.80, profitMargin: 68.31, popularity: 90, calories: 590, isActive: true, description: 'Hand-breaded chicken breast with coleslaw, pickles, and buttermilk ranch on a toasted bun.', monthlySales: 7800 },
      { name: 'Nashville Hot Chicken', category: 'Chicken', price: 13.49, cost: 4.00, profitMargin: 70.35, popularity: 85, calories: 640, isActive: true, description: 'Spicy cayenne-glazed fried chicken with pickles and comeback sauce.', monthlySales: 5400 },
      { name: 'Loaded Cheese Fries', category: 'Sides', price: 8.99, cost: 2.40, profitMargin: 73.30, popularity: 82, calories: 720, isActive: true, description: 'Crispy fries topped with melted cheddar, bacon crumbles, jalapenos, and ranch drizzle.', monthlySales: 6800 },
      { name: 'Sweet Potato Fries', category: 'Sides', price: 5.99, cost: 1.60, profitMargin: 73.29, popularity: 72, calories: 380, isActive: true, description: 'Hand-cut sweet potato fries lightly seasoned and served with honey mustard dip.', monthlySales: 4100 },
      { name: 'Caesar Salad', category: 'Salads', price: 9.99, cost: 2.80, profitMargin: 71.97, popularity: 58, calories: 350, isActive: true, description: 'Crisp romaine, parmesan, croutons, and creamy Caesar dressing.', monthlySales: 2200 },
      { name: 'Grilled Chicken Wrap', category: 'Wraps', price: 10.99, cost: 3.50, profitMargin: 68.15, popularity: 65, calories: 480, isActive: true, description: 'Grilled chicken, mixed greens, tomato, avocado, and chipotle mayo in a flour tortilla.', monthlySales: 3100 },
      { name: 'Fish Tacos (3 pc)', category: 'Tacos', price: 13.99, cost: 4.50, profitMargin: 67.83, popularity: 78, calories: 520, isActive: true, description: 'Beer-battered cod with cabbage slaw, pico de gallo, and lime crema on corn tortillas.', monthlySales: 4600 },
      { name: 'Onion Rings', category: 'Sides', price: 6.49, cost: 1.40, profitMargin: 78.43, popularity: 70, calories: 450, isActive: true, description: 'Thick-cut onion rings in a crunchy beer batter with spicy ketchup.', monthlySales: 3500 },
      { name: 'Vanilla Milkshake', category: 'Beverages', price: 6.99, cost: 1.80, profitMargin: 74.25, popularity: 75, calories: 550, isActive: true, description: 'Hand-spun vanilla bean milkshake with whipped cream.', monthlySales: 4300 },
      { name: 'Chocolate Brownie Sundae', category: 'Desserts', price: 7.99, cost: 2.10, profitMargin: 73.72, popularity: 68, calories: 680, isActive: true, description: 'Warm chocolate brownie topped with vanilla ice cream, hot fudge, and whipped cream.', monthlySales: 2800 },
      { name: 'Veggie Beyond Burger', category: 'Burgers', price: 13.99, cost: 4.80, profitMargin: 65.69, popularity: 52, calories: 510, isActive: true, description: 'Plant-based Beyond patty with lettuce, tomato, avocado, and vegan garlic aioli.', monthlySales: 1800 },
      { name: 'Kids Cheeseburger Meal', category: 'Kids', price: 7.49, cost: 2.50, profitMargin: 66.62, popularity: 60, calories: 420, isActive: true, description: 'Single patty cheeseburger with fries and choice of small drink or milk.', monthlySales: 3200 },
      { name: 'Iced Coffee (large)', category: 'Beverages', price: 4.49, cost: 0.90, profitMargin: 79.96, popularity: 80, calories: 120, isActive: true, description: 'Cold-brewed iced coffee served over ice. Available in regular, vanilla, or caramel.', monthlySales: 5900 },
      { name: 'House Lemonade', category: 'Beverages', price: 3.99, cost: 0.60, profitMargin: 84.96, popularity: 74, calories: 180, isActive: true, description: 'Freshly squeezed lemonade with a hint of mint. Seasonal berry options available.', monthlySales: 4700 },
      { name: 'Mushroom Swiss Burger', category: 'Burgers', price: 14.49, cost: 4.90, profitMargin: 66.18, popularity: 62, calories: 740, isActive: true, description: 'Angus patty with sauteed mushrooms, Swiss cheese, and truffle aioli.', monthlySales: 2600 },
      { name: 'Seasonal Soup (Bowl)', category: 'Soups', price: 6.99, cost: 1.50, profitMargin: 78.54, popularity: 48, calories: 280, isActive: false, description: 'Rotating seasonal soup - currently tomato basil bisque. Available October through March.', monthlySales: 900 }
    ]);
    console.log('MenuItems seeded.');

    // ===== 11. Financial Records (16) =====
    console.log('Seeding FinancialRecords...');
    await FinancialRecord.bulkCreate([
      { franchiseUnitId: 1, period: 'Q4 2024', totalRevenue: 558000.00, totalExpenses: 392000.00, netIncome: 166000.00, cashFlow: 142000.00, debtRatio: 0.35, currentRatio: 2.10, category: 'Quarterly', notes: 'Strong holiday season performance. Revenue up 8% YoY.' },
      { franchiseUnitId: 2, period: 'Q4 2024', totalRevenue: 645000.00, totalExpenses: 430000.00, netIncome: 215000.00, cashFlow: 198000.00, debtRatio: 0.28, currentRatio: 2.50, category: 'Quarterly', notes: 'Highest performing quarter since opening. Tourist season boost.' },
      { franchiseUnitId: 3, period: 'Q4 2024', totalRevenue: 582000.00, totalExpenses: 432000.00, netIncome: 150000.00, cashFlow: 128000.00, debtRatio: 0.42, currentRatio: 1.80, category: 'Quarterly', notes: 'Labor costs higher than expected due to overtime during holidays.' },
      { franchiseUnitId: 4, period: 'Q4 2024', totalRevenue: 438000.00, totalExpenses: 295000.00, netIncome: 143000.00, cashFlow: 135000.00, debtRatio: 0.22, currentRatio: 2.80, category: 'Quarterly', notes: 'Cafe model continues to show strong margins. Low overhead.' },
      { franchiseUnitId: 5, period: 'Q4 2024', totalRevenue: 498000.00, totalExpenses: 358000.00, netIncome: 140000.00, cashFlow: 118000.00, debtRatio: 0.38, currentRatio: 1.90, category: 'Quarterly', notes: 'Slight dip due to AC repair costs. Otherwise steady performance.' },
      { franchiseUnitId: 6, period: 'Q4 2024', totalRevenue: 540000.00, totalExpenses: 395000.00, netIncome: 145000.00, cashFlow: 130000.00, debtRatio: 0.33, currentRatio: 2.00, category: 'Quarterly', notes: 'Consistent performer. Catering revenue growing.' },
      { franchiseUnitId: 7, period: 'Q4 2024', totalRevenue: 402000.00, totalExpenses: 268000.00, netIncome: 134000.00, cashFlow: 125000.00, debtRatio: 0.20, currentRatio: 3.10, category: 'Quarterly', notes: 'Best profit margin in the network. Premium pricing working well.' },
      { franchiseUnitId: 8, period: 'Q4 2024', totalRevenue: 690000.00, totalExpenses: 510000.00, netIncome: 180000.00, cashFlow: 155000.00, debtRatio: 0.45, currentRatio: 1.60, category: 'Quarterly', notes: 'High revenue but elevated costs. Lease renewal pending negotiation.' },
      { franchiseUnitId: 9, period: 'Q4 2024', totalRevenue: 468000.00, totalExpenses: 332000.00, netIncome: 136000.00, cashFlow: 120000.00, debtRatio: 0.30, currentRatio: 2.20, category: 'Quarterly', notes: 'Music city tourism driving foot traffic. Weekends at capacity.' },
      { franchiseUnitId: 10, period: 'Q4 2024', totalRevenue: 360000.00, totalExpenses: 248000.00, netIncome: 112000.00, cashFlow: 105000.00, debtRatio: 0.18, currentRatio: 3.40, category: 'Quarterly', notes: 'Lowest debt ratio in network. Conservative growth approach.' },
      { franchiseUnitId: 11, period: 'Q4 2024', totalRevenue: 600000.00, totalExpenses: 420000.00, netIncome: 180000.00, cashFlow: 162000.00, debtRatio: 0.32, currentRatio: 2.30, category: 'Quarterly', notes: 'Austin growth continues. Tech worker lunch crowd is strong.' },
      { franchiseUnitId: 12, period: 'Q4 2024', totalRevenue: 618000.00, totalExpenses: 445000.00, netIncome: 173000.00, cashFlow: 150000.00, debtRatio: 0.36, currentRatio: 2.00, category: 'Quarterly', notes: 'Steady performance. Beach location premium worth the cost.' },
      { franchiseUnitId: 13, period: 'Q4 2024', totalRevenue: 378000.00, totalExpenses: 288000.00, netIncome: 90000.00, cashFlow: 78000.00, debtRatio: 0.40, currentRatio: 1.70, category: 'Quarterly', notes: 'Underperforming vs targets. Marketing push planned for Q1.' },
      { franchiseUnitId: 14, period: 'Q4 2024', totalRevenue: 840000.00, totalExpenses: 625000.00, netIncome: 215000.00, cashFlow: 190000.00, debtRatio: 0.48, currentRatio: 1.50, category: 'Quarterly', notes: 'Highest revenue unit. High rent partially offsets strong sales.' },
      { franchiseUnitId: 15, period: 'Q4 2024', totalRevenue: 975000.00, totalExpenses: 752000.00, netIncome: 223000.00, cashFlow: 200000.00, debtRatio: 0.50, currentRatio: 1.40, category: 'Quarterly', notes: 'NYC flagship. Highest gross but also highest cost structure.' },
      { franchiseUnitId: 1, period: 'FY 2024', totalRevenue: 2180000.00, totalExpenses: 1540000.00, netIncome: 640000.00, cashFlow: 580000.00, debtRatio: 0.35, currentRatio: 2.10, category: 'Annual', notes: 'Full year performance. Met revenue targets, exceeded profit goals by 5%.' }
    ]);
    console.log('FinancialRecords seeded.');

    // ===== 12. Marketing Campaigns (16) =====
    console.log('Seeding MarketingCampaigns...');
    await MarketingCampaign.bulkCreate([
      { name: 'Summer Sizzle Burger Fest', channel: 'Social Media', budget: 25000.00, spent: 23500.00, impressions: 850000, clicks: 42500, conversions: 3200, roi: 3.80, startDate: '2025-06-01', endDate: '2025-08-31', status: 'completed', targetAudience: 'Families 25-45' },
      { name: 'Grand Opening Orlando', channel: 'Multi-channel', budget: 50000.00, spent: 48200.00, impressions: 1200000, clicks: 68000, conversions: 5100, roi: 2.50, startDate: '2025-01-05', endDate: '2025-02-28', status: 'completed', targetAudience: 'Local Residents 18-55' },
      { name: 'Loyalty App Launch', channel: 'Email/Push', budget: 15000.00, spent: 14800.00, impressions: 320000, clicks: 48000, conversions: 12000, roi: 5.20, startDate: '2025-03-01', endDate: '2025-04-30', status: 'completed', targetAudience: 'Existing Customers' },
      { name: 'Game Day Specials', channel: 'TV/Radio', budget: 35000.00, spent: 34500.00, impressions: 2100000, clicks: 0, conversions: 8500, roi: 4.10, startDate: '2025-09-01', endDate: '2025-02-15', status: 'active', targetAudience: 'Sports Fans 21-50' },
      { name: 'Valentines Date Night', channel: 'Instagram', budget: 8000.00, spent: 7800.00, impressions: 280000, clicks: 18200, conversions: 1400, roi: 3.20, startDate: '2025-02-01', endDate: '2025-02-14', status: 'completed', targetAudience: 'Couples 25-40' },
      { name: 'Back to School Deals', channel: 'Social Media', budget: 12000.00, spent: 11500.00, impressions: 450000, clicks: 27000, conversions: 2100, roi: 3.50, startDate: '2025-08-15', endDate: '2025-09-15', status: 'completed', targetAudience: 'Families with Kids' },
      { name: 'DoorDash Partnership Promo', channel: 'Delivery Platforms', budget: 20000.00, spent: 19800.00, impressions: 680000, clicks: 54000, conversions: 6800, roi: 4.60, startDate: '2025-01-15', endDate: '2025-03-15', status: 'completed', targetAudience: 'Delivery Customers 18-35' },
      { name: 'Nashville Hot Launch', channel: 'Multi-channel', budget: 30000.00, spent: 28000.00, impressions: 920000, clicks: 46000, conversions: 3800, roi: 3.90, startDate: '2025-04-01', endDate: '2025-05-31', status: 'completed', targetAudience: 'Foodies 21-45' },
      { name: 'Holiday Catering Campaign', channel: 'Email/Direct Mail', budget: 18000.00, spent: 16500.00, impressions: 250000, clicks: 22000, conversions: 850, roi: 6.80, startDate: '2025-11-01', endDate: '2025-12-31', status: 'active', targetAudience: 'Corporate & Families' },
      { name: 'New Menu Item TikTok Blitz', channel: 'TikTok', budget: 10000.00, spent: 9200.00, impressions: 1500000, clicks: 95000, conversions: 4200, roi: 5.50, startDate: '2025-05-01', endDate: '2025-05-31', status: 'completed', targetAudience: 'Gen Z 16-24' },
      { name: 'Google Ads Local SEO', channel: 'Google Ads', budget: 40000.00, spent: 38500.00, impressions: 3200000, clicks: 128000, conversions: 9600, roi: 4.20, startDate: '2025-01-01', endDate: '2025-12-31', status: 'active', targetAudience: 'Local Searchers' },
      { name: 'Employee Referral Social', channel: 'LinkedIn/Social', budget: 5000.00, spent: 3200.00, impressions: 120000, clicks: 8500, conversions: 340, roi: 2.80, startDate: '2025-06-01', endDate: '2025-07-31', status: 'completed', targetAudience: 'Job Seekers 18-30' },
      { name: 'Weekend Brunch Launch', channel: 'Instagram/Facebook', budget: 12000.00, spent: 10800.00, impressions: 380000, clicks: 24000, conversions: 1800, roi: 3.60, startDate: '2025-03-15', endDate: '2025-05-15', status: 'completed', targetAudience: 'Brunch Crowd 25-40' },
      { name: 'Spring Refresh Menu Tease', channel: 'Social Media', budget: 8000.00, spent: 0.00, impressions: 0, clicks: 0, conversions: 0, roi: 0.00, startDate: '2026-03-01', endDate: '2026-04-30', status: 'planned', targetAudience: 'All Demographics' },
      { name: 'Community Sponsorship Program', channel: 'Events/Sponsorship', budget: 22000.00, spent: 20000.00, impressions: 180000, clicks: 0, conversions: 1200, roi: 2.10, startDate: '2025-01-01', endDate: '2025-12-31', status: 'active', targetAudience: 'Local Community' },
      { name: 'Late Night Munchies Promo', channel: 'Snapchat/TikTok', budget: 6000.00, spent: 5800.00, impressions: 620000, clicks: 38000, conversions: 2800, roi: 4.90, startDate: '2025-07-01', endDate: '2025-08-31', status: 'completed', targetAudience: 'Night Owls 18-28' }
    ]);
    console.log('MarketingCampaigns seeded.');

    // ===== 13. Compliance Records (16) =====
    console.log('Seeding ComplianceRecords...');
    await ComplianceRecord.bulkCreate([
      { franchiseUnitId: 1, category: 'Food Safety', requirement: 'ServSafe Certification for all kitchen staff', status: 'compliant', lastAuditDate: '2025-01-10', nextAuditDate: '2025-07-10', severity: 'critical', notes: 'All 8 kitchen staff certified. Next renewal cycle in July.', assignedTo: 'Marcus Johnson' },
      { franchiseUnitId: 1, category: 'Health Inspection', requirement: 'Annual health department inspection score above 90', status: 'compliant', lastAuditDate: '2025-02-15', nextAuditDate: '2026-02-15', severity: 'critical', notes: 'Scored 96/100. Minor deduction for storage labeling.', assignedTo: 'Marcus Johnson' },
      { franchiseUnitId: 2, category: 'Fire Safety', requirement: 'Fire suppression system inspection', status: 'compliant', lastAuditDate: '2024-11-20', nextAuditDate: '2025-11-20', severity: 'critical', notes: 'All systems passed. Extinguishers replaced on schedule.', assignedTo: 'Derek Washington' },
      { franchiseUnitId: 3, category: 'Health Inspection', requirement: 'Annual health department inspection score above 90', status: 'non_compliant', lastAuditDate: '2025-01-25', nextAuditDate: '2025-04-25', severity: 'critical', notes: 'Scored 84/100. Issues with temperature logging and handwashing station. Re-inspection required.', assignedTo: 'Tyler Brooks' },
      { franchiseUnitId: 4, category: 'Labor Law', requirement: 'Break time compliance for shifts over 6 hours', status: 'compliant', lastAuditDate: '2025-02-01', nextAuditDate: '2025-08-01', severity: 'major', notes: 'All break records in compliance. Digital tracking system implemented.', assignedTo: 'Rachel Kim' },
      { franchiseUnitId: 5, category: 'ADA Compliance', requirement: 'Accessible restroom and entrance compliance', status: 'in_progress', lastAuditDate: '2025-01-15', nextAuditDate: '2025-06-15', severity: 'major', notes: 'Restroom door width needs adjustment. Contractor scheduled for March.', assignedTo: 'Jordan Davis' },
      { franchiseUnitId: 6, category: 'Brand Standards', requirement: 'Quarterly brand standards audit', status: 'compliant', lastAuditDate: '2025-01-30', nextAuditDate: '2025-04-30', severity: 'minor', notes: 'Passed all 42 checklist items. Signage and uniforms up to standard.', assignedTo: 'Megan O\'Brien' },
      { franchiseUnitId: 7, category: 'Food Safety', requirement: 'Temperature monitoring logs maintained daily', status: 'compliant', lastAuditDate: '2025-02-10', nextAuditDate: '2025-05-10', severity: 'critical', notes: 'Digital monitoring system in place. All readings within range.', assignedTo: 'Chris Martinez' },
      { franchiseUnitId: 8, category: 'Labor Law', requirement: 'Overtime pay compliance', status: 'pending_review', lastAuditDate: '2024-12-15', nextAuditDate: '2025-06-15', severity: 'major', notes: 'Review flagged potential overtime miscalculations for 3 employees. HR investigating.', assignedTo: 'Samantha Taylor' },
      { franchiseUnitId: 9, category: 'Alcohol License', requirement: 'Valid liquor license and responsible service', status: 'compliant', lastAuditDate: '2025-01-20', nextAuditDate: '2026-01-20', severity: 'critical', notes: 'License renewed. All bar staff completed TIPS certification.', assignedTo: 'Jason Patel' },
      { franchiseUnitId: 10, category: 'Environmental', requirement: 'Grease trap maintenance and disposal', status: 'compliant', lastAuditDate: '2025-02-05', nextAuditDate: '2025-05-05', severity: 'minor', notes: 'Quarterly pump completed. Disposal records filed with city.', assignedTo: 'Brittany Collins' },
      { franchiseUnitId: 11, category: 'Insurance', requirement: 'General liability insurance current', status: 'compliant', lastAuditDate: '2025-01-01', nextAuditDate: '2026-01-01', severity: 'critical', notes: 'Policy renewed with increased coverage to $2M. Workers comp also current.', assignedTo: 'Terrence White' },
      { franchiseUnitId: 12, category: 'Health Inspection', requirement: 'Annual health department inspection score above 90', status: 'compliant', lastAuditDate: '2025-02-20', nextAuditDate: '2026-02-20', severity: 'critical', notes: 'Scored 92/100. Minor issue with pest control documentation resolved on site.', assignedTo: 'Laura Fernandez' },
      { franchiseUnitId: 13, category: 'Brand Standards', requirement: 'Quarterly brand standards audit', status: 'non_compliant', lastAuditDate: '2025-01-28', nextAuditDate: '2025-03-28', severity: 'major', notes: 'Failed on 6 items: outdated menu boards, worn seating, exterior paint. Improvement plan required.', assignedTo: 'Nathan Lee' },
      { franchiseUnitId: 14, category: 'Fire Safety', requirement: 'Maximum occupancy compliance', status: 'pending_review', lastAuditDate: '2025-02-12', nextAuditDate: '2025-05-12', severity: 'critical', notes: 'Weekend peak hours may exceed posted capacity. Monitoring system being evaluated.', assignedTo: 'Diana Morales' },
      { franchiseUnitId: 15, category: 'Labor Law', requirement: 'NYC Fair Workweek scheduling compliance', status: 'in_progress', lastAuditDate: '2025-01-18', nextAuditDate: '2025-04-18', severity: 'major', notes: 'Implementing new scheduling software to comply with 72-hour advance notice requirement.', assignedTo: 'Ryan Scott' }
    ]);
    console.log('ComplianceRecords seeded.');

    // ===== 14. Trip Plans (16) =====
    console.log('Seeding TripPlans...');
    await TripPlan.bulkCreate([
      { title: 'Q1 Southern Region Audit Tour', destination: 'Dallas, TX & Atlanta, GA', purpose: 'Quarterly performance audit', startDate: '2025-03-10', endDate: '2025-03-14', totalBudget: 4500.00, estimatedCost: 4200.00, franchiseUnitsToVisit: 'Downtown Dallas Grill, Atlanta Peachtree Diner', status: 'completed', travelerName: 'Admin User', notes: 'Both units performing well. Dallas needs kitchen equipment update.' },
      { title: 'Miami & Orlando Expansion Review', destination: 'Miami, FL & Orlando, FL', purpose: 'New unit inspection and existing audit', startDate: '2025-04-05', endDate: '2025-04-08', totalBudget: 3800.00, estimatedCost: 3500.00, franchiseUnitsToVisit: 'Miami Beach Burgers, Orlando Sunshine Grill', status: 'approved', travelerName: 'Admin User', notes: 'Orlando build-out inspection. Miami quarterly review.' },
      { title: 'Midwest Performance Review', destination: 'Chicago, IL & Minneapolis, MN', purpose: 'Performance benchmarking', startDate: '2025-05-12', endDate: '2025-05-15', totalBudget: 3200.00, estimatedCost: 3000.00, franchiseUnitsToVisit: 'Chicago Loop Eatery, Minneapolis North Star', status: 'approved', travelerName: 'Robert Johnson', notes: 'Chicago health score follow-up. Minneapolis underperformance review.' },
      { title: 'Northwest Cafe Expansion Scouting', destination: 'Seattle, WA & Portland, OR', purpose: 'Market research and unit visits', startDate: '2025-06-02', endDate: '2025-06-05', totalBudget: 3600.00, estimatedCost: 3400.00, franchiseUnitsToVisit: 'Seattle Pike Cafe, Portland Rose Cafe', status: 'draft', travelerName: 'Angela Chen', notes: 'Evaluate cafe model scalability in Pacific NW market.' },
      { title: 'Texas Tri-City Tour', destination: 'Dallas, TX & Austin, TX & San Antonio, TX', purpose: 'Regional strategy alignment', startDate: '2025-04-20', endDate: '2025-04-24', totalBudget: 5200.00, estimatedCost: 4800.00, franchiseUnitsToVisit: 'Downtown Dallas Grill, Austin Ranch House', status: 'approved', travelerName: 'Thomas Harris', notes: 'San Antonio scouting for potential new unit. Review existing TX operations.' },
      { title: 'Boston Lease Negotiation Trip', destination: 'Boston, MA', purpose: 'Lease renewal meeting', startDate: '2025-03-25', endDate: '2025-03-26', totalBudget: 1800.00, estimatedCost: 1500.00, franchiseUnitsToVisit: 'Boston Harbor Grill', status: 'completed', travelerName: 'Brian Clark', notes: 'Negotiate lease renewal. Current terms expire June 2025.' },
      { title: 'Nashville Training Program Launch', destination: 'Nashville, TN', purpose: 'Training program rollout', startDate: '2025-05-05', endDate: '2025-05-07', totalBudget: 2400.00, estimatedCost: 2200.00, franchiseUnitsToVisit: 'Nashville Hot Kitchen', status: 'draft', travelerName: 'Emily Roberts', notes: 'Launch new Shift Leadership Bootcamp at Nashville location.' },
      { title: 'Denver Best Practices Study', destination: 'Denver, CO', purpose: 'Best practices documentation', startDate: '2025-04-14', endDate: '2025-04-15', totalBudget: 1600.00, estimatedCost: 1400.00, franchiseUnitsToVisit: 'Denver Mountain Bistro', status: 'approved', travelerName: 'Linda Brown', notes: 'Document best practices from highest-scoring unit for network-wide sharing.' },
      { title: 'Phoenix Compliance Remediation', destination: 'Phoenix, AZ', purpose: 'ADA compliance follow-up', startDate: '2025-03-18', endDate: '2025-03-19', totalBudget: 1400.00, estimatedCost: 1200.00, franchiseUnitsToVisit: 'Phoenix Sunburst Grill', status: 'completed', travelerName: 'Kevin Miller', notes: 'Verify ADA compliance improvements are on track.' },
      { title: 'Las Vegas Revenue Optimization', destination: 'Las Vegas, NV', purpose: 'Revenue and cost analysis', startDate: '2025-05-20', endDate: '2025-05-22', totalBudget: 2800.00, estimatedCost: 2600.00, franchiseUnitsToVisit: 'Las Vegas Strip Diner', status: 'draft', travelerName: 'Admin User', notes: 'Highest revenue but high costs. On-site analysis to identify savings.' },
      { title: 'NYC Flagship Annual Review', destination: 'New York, NY', purpose: 'Annual comprehensive review', startDate: '2025-06-15', endDate: '2025-06-18', totalBudget: 5500.00, estimatedCost: 5200.00, franchiseUnitsToVisit: 'New York Midtown Express', status: 'draft', travelerName: 'Admin User', notes: 'Annual deep-dive review of flagship location. Meeting with NYC partners.' },
      { title: 'San Diego Menu Testing Trip', destination: 'San Diego, CA', purpose: 'New menu item pilot testing', startDate: '2025-04-28', endDate: '2025-04-29', totalBudget: 1800.00, estimatedCost: 1600.00, franchiseUnitsToVisit: 'San Diego Coastal Grill', status: 'approved', travelerName: 'Jennifer Lee', notes: 'Test new fish taco recipe and seasonal cocktail menu.' },
      { title: 'Charlotte Market Entry Scouting', destination: 'Charlotte, NC', purpose: 'New market evaluation', startDate: '2025-05-28', endDate: '2025-05-30', totalBudget: 2200.00, estimatedCost: 2000.00, franchiseUnitsToVisit: 'N/A - New Market', status: 'approved', travelerName: 'Sanjay Patel', notes: 'Meet with realtors. Visit 3 potential locations. Competitor analysis.' },
      { title: 'Minneapolis Turnaround Plan', destination: 'Minneapolis, MN', purpose: 'Underperformance intervention', startDate: '2025-04-07', endDate: '2025-04-09', totalBudget: 2000.00, estimatedCost: 1800.00, franchiseUnitsToVisit: 'Minneapolis North Star', status: 'approved', travelerName: 'Emily Roberts', notes: 'Develop 90-day turnaround plan with local management team.' },
      { title: 'National Franchise Convention', destination: 'Orlando, FL', purpose: 'Industry conference attendance', startDate: '2025-10-15', endDate: '2025-10-18', totalBudget: 6000.00, estimatedCost: 5500.00, franchiseUnitsToVisit: 'Orlando Sunshine Grill', status: 'draft', travelerName: 'Admin User', notes: 'Annual IFA convention. Also inspect Orlando build-out progress.' },
      { title: 'Kansas City Expansion Groundwork', destination: 'Kansas City, MO', purpose: 'New location setup', startDate: '2025-07-01', endDate: '2025-07-03', totalBudget: 2600.00, estimatedCost: 2400.00, franchiseUnitsToVisit: 'N/A - New Market', status: 'draft', travelerName: 'David Williams', notes: 'Meet with contractors, sign lease, begin permit applications.' }
    ]);
    console.log('TripPlans seeded.');

    // ===== 15. Benchmark Reports (16) =====
    console.log('Seeding BenchmarkReports...');
    await BenchmarkReport.bulkCreate([
      { title: 'Q4 2024 Overall Performance Rankings', franchiseUnitId: 1, reportType: 'Quarterly Performance', period: 'Q4 2024', overallScore: 88.50, industryAvg: 75.00, ranking: 4, totalUnitsCompared: 15, keyFindings: 'Above average revenue growth. Customer satisfaction improved 5% QoQ. Labor costs slightly above benchmark.', status: 'published' },
      { title: 'Q4 2024 Overall Performance Rankings', franchiseUnitId: 2, reportType: 'Quarterly Performance', period: 'Q4 2024', overallScore: 92.30, industryAvg: 75.00, ranking: 1, totalUnitsCompared: 15, keyFindings: 'Top performing unit. Highest revenue per square foot. Customer rating leads the network.', status: 'published' },
      { title: 'Q4 2024 Overall Performance Rankings', franchiseUnitId: 3, reportType: 'Quarterly Performance', period: 'Q4 2024', overallScore: 85.10, industryAvg: 75.00, ranking: 8, totalUnitsCompared: 15, keyFindings: 'Health inspection score drag on overall rating. Revenue strong but margins below target.', status: 'published' },
      { title: 'Q4 2024 Overall Performance Rankings', franchiseUnitId: 7, reportType: 'Quarterly Performance', period: 'Q4 2024', overallScore: 93.50, industryAvg: 75.00, ranking: 2, totalUnitsCompared: 15, keyFindings: 'Highest customer rating and best profit margins. Small format model is highly efficient.', status: 'published' },
      { title: 'Annual Revenue Benchmark 2024', franchiseUnitId: 15, reportType: 'Annual Revenue', period: 'FY 2024', overallScore: 84.70, industryAvg: 72.00, ranking: 3, totalUnitsCompared: 15, keyFindings: 'Highest gross revenue in network. Cost structure needs optimization. NYC rent impacts net margins.', status: 'published' },
      { title: 'Customer Satisfaction Benchmark Q4', franchiseUnitId: 4, reportType: 'Customer Satisfaction', period: 'Q4 2024', overallScore: 90.20, industryAvg: 78.00, ranking: 3, totalUnitsCompared: 15, keyFindings: 'Cafe format drives higher satisfaction. Wait times lowest in network. Repeat customer rate at 68%.', status: 'published' },
      { title: 'Food Cost Efficiency Report', franchiseUnitId: 6, reportType: 'Cost Analysis', period: 'Q4 2024', overallScore: 86.90, industryAvg: 80.00, ranking: 5, totalUnitsCompared: 15, keyFindings: 'Food cost at 28.5% of revenue vs 31% industry average. Waste management program showing results.', status: 'published' },
      { title: 'Labor Efficiency Benchmark', franchiseUnitId: 8, reportType: 'Labor Analysis', period: 'Q4 2024', overallScore: 81.40, industryAvg: 77.00, ranking: 11, totalUnitsCompared: 15, keyFindings: 'Overtime hours 15% above network average. Scheduling optimization recommended. Revenue per labor hour at $42.', status: 'published' },
      { title: 'New Unit Ramp-Up Benchmark', franchiseUnitId: 9, reportType: 'Growth Analysis', period: 'Q4 2024', overallScore: 87.60, industryAvg: 70.00, ranking: 2, totalUnitsCompared: 8, keyFindings: 'Fastest ramp-up to profitability among units opened since 2021. Reached breakeven in month 8.', status: 'published' },
      { title: 'Compliance Score Report', franchiseUnitId: 11, reportType: 'Compliance', period: 'Q4 2024', overallScore: 89.40, industryAvg: 82.00, ranking: 4, totalUnitsCompared: 15, keyFindings: 'Strong compliance across all categories. Early adopter of digital compliance tracking system.', status: 'published' },
      { title: 'Marketing ROI Benchmark', franchiseUnitId: 5, reportType: 'Marketing Analysis', period: 'Q4 2024', overallScore: 82.70, industryAvg: 76.00, ranking: 9, totalUnitsCompared: 15, keyFindings: 'Local marketing spend below network average. Social media engagement lagging. Recommend increased digital budget.', status: 'published' },
      { title: 'Delivery Performance Benchmark', franchiseUnitId: 14, reportType: 'Delivery Analysis', period: 'Q4 2024', overallScore: 79.50, industryAvg: 74.00, ranking: 12, totalUnitsCompared: 15, keyFindings: 'Delivery times averaging 38 minutes vs 32 minute target. Packaging quality issues reported. Vegas traffic a factor.', status: 'published' },
      { title: 'Sustainability Benchmark', franchiseUnitId: 10, reportType: 'Sustainability', period: 'FY 2024', overallScore: 91.80, industryAvg: 65.00, ranking: 1, totalUnitsCompared: 15, keyFindings: 'Portland cafe leads in sustainability. Compostable packaging, local sourcing at 80%, energy efficient equipment.', status: 'published' },
      { title: 'Q1 2025 Preliminary Rankings', franchiseUnitId: 2, reportType: 'Quarterly Performance', period: 'Q1 2025', overallScore: 91.00, industryAvg: 75.00, ranking: 1, totalUnitsCompared: 15, keyFindings: 'Preliminary data shows continued strong performance. Spring break tourism boost in March.', status: 'draft' },
      { title: 'Minneapolis Turnaround Tracking', franchiseUnitId: 13, reportType: 'Turnaround Analysis', period: 'Q4 2024', overallScore: 83.90, industryAvg: 75.00, ranking: 10, totalUnitsCompared: 15, keyFindings: 'Improvement from Q3 score of 78.2. Marketing investment beginning to show returns. Brand standards still need work.', status: 'published' },
      { title: 'Network-Wide Annual Summary', franchiseUnitId: 1, reportType: 'Annual Summary', period: 'FY 2024', overallScore: 86.80, industryAvg: 74.00, ranking: 1, totalUnitsCompared: 1, keyFindings: 'Network average score of 86.8 vs industry 74.0. 13 of 15 active units profitable. Total network revenue $28.4M.', status: 'published' }
    ]);
    console.log('BenchmarkReports seeded.');

    // ===== 16. Franchise Valuations (16) =====
    console.log('Seeding FranchiseValuations...');
    await FranchiseValuation.bulkCreate([
      { franchiseUnitId: 1, valuationDate: '2025-01-15', estimatedValue: 1450000.00, methodology: 'Discounted Cash Flow', revenueMultiple: 2.60, assetValue: 420000.00, goodwillValue: 380000.00, marketCondition: 'balanced', confidence: 85.00, notes: 'Stable cash flows support DCF valuation. Equipment in good condition.' },
      { franchiseUnitId: 2, valuationDate: '2025-01-15', estimatedValue: 1820000.00, methodology: 'Discounted Cash Flow', revenueMultiple: 2.90, assetValue: 380000.00, goodwillValue: 520000.00, marketCondition: 'sellers', confidence: 90.00, notes: 'Premium valuation justified by top performance and prime Miami location.' },
      { franchiseUnitId: 3, valuationDate: '2025-01-15', estimatedValue: 1380000.00, methodology: 'Comparable Sales', revenueMultiple: 2.40, assetValue: 450000.00, goodwillValue: 290000.00, marketCondition: 'balanced', confidence: 80.00, notes: 'Health inspection issues create minor discount. Strong downtown location.' },
      { franchiseUnitId: 4, valuationDate: '2025-01-15', estimatedValue: 980000.00, methodology: 'Discounted Cash Flow', revenueMultiple: 2.70, assetValue: 240000.00, goodwillValue: 310000.00, marketCondition: 'sellers', confidence: 88.00, notes: 'Cafe model commands premium multiple. Lower capex requirements.' },
      { franchiseUnitId: 5, valuationDate: '2025-01-15', estimatedValue: 1180000.00, methodology: 'Comparable Sales', revenueMultiple: 2.40, assetValue: 350000.00, goodwillValue: 260000.00, marketCondition: 'balanced', confidence: 78.00, notes: 'Phoenix market growing but compliance issues add uncertainty.' },
      { franchiseUnitId: 6, valuationDate: '2025-01-15', estimatedValue: 1320000.00, methodology: 'Discounted Cash Flow', revenueMultiple: 2.50, assetValue: 400000.00, goodwillValue: 320000.00, marketCondition: 'balanced', confidence: 82.00, notes: 'Consistent performer. Catering business adds diversified revenue stream.' },
      { franchiseUnitId: 7, valuationDate: '2025-01-15', estimatedValue: 1050000.00, methodology: 'Earnings Multiple', revenueMultiple: 3.20, assetValue: 280000.00, goodwillValue: 420000.00, marketCondition: 'sellers', confidence: 92.00, notes: 'Highest margins in network justify premium multiple. Strong brand in Denver market.' },
      { franchiseUnitId: 8, valuationDate: '2025-01-15', estimatedValue: 1680000.00, methodology: 'Discounted Cash Flow', revenueMultiple: 2.50, assetValue: 520000.00, goodwillValue: 350000.00, marketCondition: 'buyers', confidence: 75.00, notes: 'Lease uncertainty creates buyer leverage. Strong revenue but high cost structure.' },
      { franchiseUnitId: 9, valuationDate: '2025-01-15', estimatedValue: 1120000.00, methodology: 'Earnings Multiple', revenueMultiple: 2.80, assetValue: 320000.00, goodwillValue: 340000.00, marketCondition: 'balanced', confidence: 83.00, notes: 'Nashville market hot. Strong ramp-up trajectory supports growth premium.' },
      { franchiseUnitId: 10, valuationDate: '2025-01-15', estimatedValue: 820000.00, methodology: 'Discounted Cash Flow', revenueMultiple: 2.80, assetValue: 200000.00, goodwillValue: 290000.00, marketCondition: 'balanced', confidence: 86.00, notes: 'Small but highly profitable. Sustainability reputation adds intangible value.' },
      { franchiseUnitId: 11, valuationDate: '2025-01-15', estimatedValue: 1520000.00, methodology: 'Comparable Sales', revenueMultiple: 2.60, assetValue: 430000.00, goodwillValue: 380000.00, marketCondition: 'sellers', confidence: 87.00, notes: 'Austin real estate market hot. Comparable franchise sales support valuation.' },
      { franchiseUnitId: 12, valuationDate: '2025-01-15', estimatedValue: 1480000.00, methodology: 'Discounted Cash Flow', revenueMultiple: 2.40, assetValue: 410000.00, goodwillValue: 340000.00, marketCondition: 'balanced', confidence: 81.00, notes: 'San Diego tourism provides stable demand. Beach location is unique asset.' },
      { franchiseUnitId: 13, valuationDate: '2025-01-15', estimatedValue: 780000.00, methodology: 'Comparable Sales', revenueMultiple: 2.10, assetValue: 320000.00, goodwillValue: 150000.00, marketCondition: 'buyers', confidence: 70.00, notes: 'Underperformance reflected in lower multiple. Turnaround plan may improve value.' },
      { franchiseUnitId: 14, valuationDate: '2025-01-15', estimatedValue: 2250000.00, methodology: 'Discounted Cash Flow', revenueMultiple: 2.70, assetValue: 580000.00, goodwillValue: 450000.00, marketCondition: 'balanced', confidence: 79.00, notes: 'High revenue offsets high costs. Strip location is irreplaceable but expensive.' },
      { franchiseUnitId: 15, valuationDate: '2025-01-15', estimatedValue: 2850000.00, methodology: 'Discounted Cash Flow', revenueMultiple: 2.90, assetValue: 620000.00, goodwillValue: 680000.00, marketCondition: 'sellers', confidence: 84.00, notes: 'NYC flagship. Highest valuation in network. Midtown Manhattan location premium.' },
      { franchiseUnitId: 2, valuationDate: '2024-07-15', estimatedValue: 1650000.00, methodology: 'Discounted Cash Flow', revenueMultiple: 2.70, assetValue: 370000.00, goodwillValue: 460000.00, marketCondition: 'balanced', confidence: 85.00, notes: 'Mid-year valuation showing growth trajectory. Value increased 10% in 6 months.' }
    ]);
    console.log('FranchiseValuations seeded.');

    console.log('\n========================================');
    console.log('Database seeded successfully!');
    console.log('========================================\n');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
