require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const {
  sequelize, FranchiseUnit, RevenueRecord, Competitor, MarketExpansion, StaffMember,
  CustomerReview, SupplyChainItem, TrainingProgram, MenuItem, FinancialRecord,
  MarketingCampaign, ComplianceRecord, TripPlan, BenchmarkReport, FranchiseValuation,
  AiResult, ChatSession, ChatMessage, AlertRecord, Goal
} = require('./models');
const ai = require('./services/openRouterService');
const createCrudRouter = require('./routes/crudFactory');
const { parseAIJson, persistAIResult } = createCrudRouter;
const authRoutes = require('./routes/auth');
const aiResultsRoutes = require('./routes/aiResults');
const extensionsRoutes = require('./routes/extensions'); // Apply pass 5
const auth = require('./middleware/auth');
const { aiRateLimiter } = require('./middleware/rateLimiter');
const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

// ── Production hardening ──
app.use(helmet({ contentSecurityPolicy: false }));

const allowedOrigins = (process.env.CORS_ORIGINS || process.env.CLIENT_URL || 'http://localhost:3000')
  .split(',').map(s => s.trim()).filter(Boolean);
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) return cb(null, true);
    return cb(new Error('CORS not allowed'));
  },
  credentials: true,
}));
app.use(express.json({ limit: '2mb' }));

// Boot-time validation
if (!process.env.OPENROUTER_API_KEY) {
  console.warn('[boot] WARNING: OPENROUTER_API_KEY missing — AI endpoints will return 500.');
}
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be configured with at least 32 characters');
}

// Auth routes
app.use('/api/auth', authRoutes);

// CRUD + AI routes for each feature
app.use('/api/franchise-units', createCrudRouter(FranchiseUnit, ai.analyzePerformance, ['name']));
app.use('/api/revenue-records', createCrudRouter(RevenueRecord, ai.forecastRevenue));
app.use('/api/competitors', createCrudRouter(Competitor, ai.analyzeCompetitor, ['name']));
app.use('/api/market-expansion', createCrudRouter(MarketExpansion, ai.suggestExpansion));
app.use('/api/staff-members', createCrudRouter(StaffMember, ai.optimizeStaffing, ['name']));
app.use('/api/customer-reviews', createCrudRouter(CustomerReview, ai.analyzeSentiment));
app.use('/api/supply-chain', createCrudRouter(SupplyChainItem, ai.optimizeSupplyChain));
app.use('/api/training-programs', createCrudRouter(TrainingProgram, ai.recommendTraining));
app.use('/api/menu-items', createCrudRouter(MenuItem, ai.optimizeMenu, ['name']));
app.use('/api/financial-records', createCrudRouter(FinancialRecord, ai.auditFinancials));
app.use('/api/marketing-campaigns', createCrudRouter(MarketingCampaign, ai.generateCampaign));
app.use('/api/compliance-records', createCrudRouter(ComplianceRecord, ai.checkCompliance));
app.use('/api/trip-plans', createCrudRouter(TripPlan, ai.generateTripPlan));
app.use('/api/benchmark-reports', createCrudRouter(BenchmarkReport, ai.generateBenchmark));
app.use('/api/franchise-valuations', createCrudRouter(FranchiseValuation, ai.estimateValuation));

// Alerts and Goals CRUD (no AI function required)
app.use('/api/alert-records', createCrudRouter(AlertRecord));
app.use('/api/goals', createCrudRouter(Goal, null, ['objective', 'key_result']));

// AI Results history
app.use('/api/ai-results', aiResultsRoutes);

// Apply pass 5 — backlog (POS, SOP RAG, P&L roll-up, messaging, audit, mentorship, supplier)
app.use('/api/extensions', extensionsRoutes);
app.use('/api/performance-workflow', auth, require('./routes/governedPerformance')(sequelize));

// ── Tool-calling enabled AI chat ──
const TOOL_REGISTRY = {
  query_franchise_units: async ({ metric = 'revenue', top_n = 10 }) => {
    if (metric === 'revenue') {
      const rows = await RevenueRecord.findAll({ order: [['revenue', 'DESC']], limit: top_n });
      return rows.map(r => r.toJSON());
    }
    const rows = await FranchiseUnit.findAll({ limit: top_n });
    return rows.map(r => r.toJSON());
  },
  query_financials: async ({ unit_id, limit = 20 }) => {
    const where = unit_id ? { franchiseUnitId: unit_id } : {};
    const rows = await FinancialRecord.findAll({ where, order: [['id', 'DESC']], limit });
    return rows.map(r => r.toJSON());
  },
  query_compliance: async ({ unit_id, limit = 20 }) => {
    const where = unit_id ? { franchiseUnitId: unit_id } : {};
    const rows = await ComplianceRecord.findAll({ where, order: [['id', 'DESC']], limit });
    return rows.map(r => r.toJSON());
  },
  query_reviews: async ({ unit_id, limit = 30 }) => {
    const where = unit_id ? { franchiseUnitId: unit_id } : {};
    const rows = await CustomerReview.findAll({ where, order: [['id', 'DESC']], limit });
    return rows.map(r => r.toJSON());
  },
};

const TOOL_DEFS = [
  {
    type: 'function',
    function: {
      name: 'query_franchise_units',
      description: 'Look up franchise units, optionally ranked by a metric (e.g. revenue).',
      parameters: { type: 'object', properties: { metric: { type: 'string' }, top_n: { type: 'integer' } } }
    }
  },
  {
    type: 'function',
    function: {
      name: 'query_financials',
      description: 'Get recent financial records, optionally filtered by unit_id.',
      parameters: { type: 'object', properties: { unit_id: { type: 'integer' }, limit: { type: 'integer' } } }
    }
  },
  {
    type: 'function',
    function: {
      name: 'query_compliance',
      description: 'Get recent compliance records, optionally filtered by unit_id.',
      parameters: { type: 'object', properties: { unit_id: { type: 'integer' }, limit: { type: 'integer' } } }
    }
  },
  {
    type: 'function',
    function: {
      name: 'query_reviews',
      description: 'Get recent customer reviews, optionally filtered by unit_id.',
      parameters: { type: 'object', properties: { unit_id: { type: 'integer' }, limit: { type: 'integer' } } }
    }
  }
];

app.post('/api/ai/chat', auth, aiRateLimiter, async (req, res) => {
  try {
    const { prompt, context, session_id, use_tools } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Missing required field: prompt' });

    const SYSTEM_PROMPT = use_tools
      ? 'You are an expert AI assistant for franchise operations with access to data tools. When you need data, call a tool. Then provide actionable insights formatted with markdown.'
      : 'You are an expert AI assistant for franchise business operations. Provide detailed, actionable insights. Format your response with clear sections using markdown-style headers and bullet points.';

    let sessionId = session_id;
    let conversationHistory = [];
    if (sessionId) {
      const priorMessages = await ChatMessage.findAll({
        where: { session_id: sessionId },
        order: [['createdAt', 'ASC']],
        limit: 20
      });
      conversationHistory = priorMessages.map(m => ({ role: m.role, content: m.content }));
      await ChatSession.update(
        { last_active: new Date(), message_count: conversationHistory.length + 1 },
        { where: { session_id: sessionId } }
      );
    } else {
      sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      await ChatSession.create({
        session_id: sessionId, user_id: req.user?.id || null,
        title: prompt.slice(0, 80), message_count: 1, last_active: new Date()
      });
    }

    const userMessage = context ? `Context: ${JSON.stringify(context)}\n\nQuestion: ${prompt}` : prompt;

    let assistantReply = '';
    if (use_tools) {
      // Tool-calling loop (max 4 rounds)
      let messages = [...conversationHistory, { role: 'user', content: userMessage }];
      for (let round = 0; round < 4; round++) {
        const msg = await ai.callAIWithTools(SYSTEM_PROMPT, messages, TOOL_DEFS);
        if (msg.tool_calls && msg.tool_calls.length > 0) {
          messages.push({ role: 'assistant', content: msg.content || '', tool_calls: msg.tool_calls });
          for (const tc of msg.tool_calls) {
            const fnName = tc.function.name;
            let fnArgs = {};
            try { fnArgs = JSON.parse(tc.function.arguments || '{}'); } catch (_) {}
            const fn = TOOL_REGISTRY[fnName];
            const result = fn ? await fn(fnArgs) : { error: 'Unknown tool' };
            messages.push({ role: 'tool', tool_call_id: tc.id, name: fnName, content: JSON.stringify(result).slice(0, 8000) });
          }
        } else {
          assistantReply = msg.content || 'No response generated.';
          break;
        }
      }
      if (!assistantReply) assistantReply = 'Tool-calling loop did not converge.';
    } else {
      const messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...conversationHistory,
        { role: 'user', content: userMessage }
      ];
      const response = await fetch(
        `${process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1'}/chat/completions`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://ai-franchise-performance-benchmarker.app',
            'X-Title': 'AI Franchise Performance Benchmarker'
          },
          body: JSON.stringify({
            model: process.env.OPENROUTER_MODEL || 'anthropic/claude-3-5-sonnet-20241022',
            messages, max_tokens: 4096
          })
        }
      );
      const data = await response.json();
      assistantReply = data.choices?.[0]?.message?.content || 'No response generated.';
    }

    await Promise.all([
      ChatMessage.create({ session_id: sessionId, role: 'user', content: userMessage }),
      ChatMessage.create({
        session_id: sessionId, role: 'assistant', content: assistantReply,
        model: process.env.OPENROUTER_MODEL || 'anthropic/claude-3-5-sonnet-20241022'
      })
    ]);

    res.json({
      response: assistantReply,
      session_id: sessionId,
      messages_in_session: conversationHistory.length + 2
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Streaming chat (SSE) ──
app.post('/api/ai/chat/stream', auth, aiRateLimiter, async (req, res) => {
  try {
    const { prompt, session_id } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Missing prompt' });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    let sessionId = session_id;
    let history = [];
    if (sessionId) {
      const prior = await ChatMessage.findAll({ where: { session_id: sessionId }, order: [['createdAt', 'ASC']], limit: 20 });
      history = prior.map(m => ({ role: m.role, content: m.content }));
    } else {
      sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      await ChatSession.create({ session_id: sessionId, user_id: req.user?.id || null, title: prompt.slice(0, 80), message_count: 1, last_active: new Date() });
    }

    const upstream = await fetch(`${process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1'}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://ai-franchise-performance-benchmarker.app',
        'X-Title': 'AI Franchise Performance Benchmarker'
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || 'anthropic/claude-3-5-sonnet-20241022',
        stream: true,
        messages: [
          { role: 'system', content: 'You are an expert franchise operations assistant.' },
          ...history,
          { role: 'user', content: prompt }
        ]
      })
    });

    if (!upstream.ok || !upstream.body) {
      const errorText = await upstream.text().catch(() => 'unknown');
      res.write(`data: ${JSON.stringify({ error: errorText })}\n\n`);
      res.end();
      return;
    }

    res.write(`data: ${JSON.stringify({ session_id: sessionId })}\n\n`);
    const reader = upstream.body.getReader();
    const decoder = new TextDecoder();
    let full = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');
      for (const line of lines) {
        if (line.startsWith('data:')) {
          const payload = line.slice(5).trim();
          if (payload === '[DONE]') continue;
          try {
            const j = JSON.parse(payload);
            const delta = j.choices?.[0]?.delta?.content || '';
            if (delta) {
              full += delta;
              res.write(`data: ${JSON.stringify({ delta })}\n\n`);
            }
          } catch (_) {}
        }
      }
    }

    await Promise.all([
      ChatMessage.create({ session_id: sessionId, role: 'user', content: prompt }),
      ChatMessage.create({ session_id: sessionId, role: 'assistant', content: full, model: process.env.OPENROUTER_MODEL })
    ]);

    res.write(`data: [DONE]\n\n`);
    res.end();
  } catch (err) {
    try { res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`); res.end(); } catch (_) {}
  }
});

app.get('/api/ai/chat/sessions', auth, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;
    const { count, rows } = await ChatSession.findAndCountAll({
      where: req.user?.id ? { user_id: req.user.id } : {},
      order: [['last_active', 'DESC']], limit, offset
    });
    res.json({ data: rows, pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/ai/chat/sessions/:session_id/messages', auth, async (req, res) => {
  try {
    const messages = await ChatMessage.findAll({
      where: { session_id: req.params.session_id },
      order: [['createdAt', 'ASC']]
    });
    res.json(messages);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Cross-entity AI alert scan ──
app.post('/api/ai/alert-scan', auth, aiRateLimiter, async (req, res) => {
  try {
    const threshold = parseFloat(req.query.threshold) || 60;
    const [financialRecords, complianceRecords, franchiseUnits] = await Promise.all([
      FinancialRecord.findAll({ order: [['id', 'DESC']], limit: 50 }),
      ComplianceRecord.findAll({ order: [['id', 'DESC']], limit: 50 }),
      FranchiseUnit.findAll()
    ]);

    if (financialRecords.length === 0 && complianceRecords.length === 0) {
      return res.json({ alerts: [], message: 'No records to analyze.' });
    }

    const systemPrompt = `You are a franchise operations risk analyst. Return ONLY valid JSON: {alerts: [{unit_id, unit_name, alert_type, severity (critical|high|medium), description, recommended_action, estimated_impact}], units_at_risk (number), overall_portfolio_health (critical|at_risk|healthy), summary}.`;
    const userPrompt = `Scan for franchise units below ${threshold}% performance threshold.\n\nFranchise Units (${franchiseUnits.length}): ${JSON.stringify(franchiseUnits.map(u => u.toJSON()))}\nFinancial Records: ${JSON.stringify(financialRecords.map(f => f.toJSON()))}\nCompliance Records: ${JSON.stringify(complianceRecords.map(c => c.toJSON()))}`;

    const rawResult = await ai.callAI(systemPrompt, userPrompt);
    const parsed = parseAIJson(rawResult);

    // Persist each alert as AlertRecord
    if (parsed?.alerts && Array.isArray(parsed.alerts)) {
      for (const a of parsed.alerts) {
        try {
          await AlertRecord.create({
            unit_id: a.unit_id || null, unit_name: a.unit_name || null,
            alert_type: a.alert_type || 'combined', severity: a.severity || 'medium',
            ai_explanation: a.description, payload: a, status: 'open'
          });
        } catch (_) {}
      }
    }

    await persistAIResult('AlertScan', null, 'alert-scan', rawResult, parsed,
      process.env.OPENROUTER_MODEL, req.user?.id);

    res.json({
      alerts: parsed?.alerts || [],
      units_at_risk: parsed?.units_at_risk || 0,
      overall_portfolio_health: parsed?.overall_portfolio_health || 'unknown',
      summary: parsed?.summary || rawResult,
      threshold_used: threshold,
      records_analyzed: financialRecords.length + complianceRecords.length
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── NEW: Anomaly auto-flagger (peer-median revenue drop detection) ──
app.post('/api/ai/anomaly-scan', auth, aiRateLimiter, async (req, res) => {
  try {
    const dropThresholdPct = parseFloat(req.body?.drop_threshold_pct) || 20;
    const records = await RevenueRecord.findAll({ order: [['id', 'DESC']], limit: 500 });
    if (records.length === 0) return res.json({ flagged: [], message: 'No revenue data.' });

    // Group by unit
    const byUnit = {};
    for (const r of records) {
      const j = r.toJSON();
      const u = j.franchiseUnitId || 'unknown';
      if (!byUnit[u]) byUnit[u] = [];
      byUnit[u].push(parseFloat(j.revenue || 0));
    }
    const unitMedians = Object.entries(byUnit).map(([u, vals]) => {
      const s = [...vals].sort((a, b) => a - b);
      const med = s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
      return { unit_id: u, median: med, latest: vals[0] };
    });
    const allMedians = unitMedians.map(u => u.median).sort((a, b) => a - b);
    const peerMedian = allMedians[Math.floor(allMedians.length / 2)] || 0;

    const flagged = unitMedians.filter(u => peerMedian > 0 && ((peerMedian - u.latest) / peerMedian) * 100 >= dropThresholdPct)
      .map(u => ({ ...u, drop_pct: ((peerMedian - u.latest) / peerMedian) * 100 }));

    // Generate AI explanations + persist alerts
    const created = [];
    for (const f of flagged) {
      const explanation = await ai.callAI(
        'You are an AI franchise risk analyst. Briefly explain (3 sentences) why this revenue drop is concerning and recommend an action. Return ONLY valid JSON: {explanation, recommended_action, severity (critical|high|medium)}.',
        JSON.stringify({ unit_id: f.unit_id, latest_revenue: f.latest, peer_median: peerMedian, drop_pct: f.drop_pct })
      );
      const parsed = parseAIJson(explanation);
      const alert = await AlertRecord.create({
        unit_id: parseInt(f.unit_id) || null,
        alert_type: 'anomaly',
        severity: parsed?.severity || 'high',
        metric: 'revenue',
        observed_value: f.latest,
        peer_median: peerMedian,
        delta_pct: -f.drop_pct,
        ai_explanation: parsed?.explanation || explanation,
        payload: parsed || { raw: explanation },
        status: 'open'
      });
      created.push(alert);
    }
    res.json({ flagged: created, peer_median: peerMedian, threshold_pct: dropThresholdPct });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── NEW: Real-time benchmark recompute trigger (used by webhook / WS pub) ──
app.post('/api/ai/benchmark-recompute', auth, aiRateLimiter, async (req, res) => {
  try {
    const units = await FranchiseUnit.findAll({ limit: 100 });
    const revenue = await RevenueRecord.findAll({ limit: 500 });
    const reviews = await CustomerReview.findAll({ limit: 500 });
    const financials = await FinancialRecord.findAll({ limit: 500 });

    const result = await ai.generateBenchmark({ units, revenue, reviews, financials });
    const parsed = parseAIJson(result);
    await persistAIResult('Benchmark', null, 'benchmark-recompute', result, parsed, process.env.OPENROUTER_MODEL, req.user?.id);
    res.json({ analysis: result, parsed, units_compared: units.length });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── NEW: OKR weekly progress narrative ──
app.post('/api/goals/:id/weekly-narrative', auth, aiRateLimiter, async (req, res) => {
  try {
    const goal = await Goal.findByPk(req.params.id);
    if (!goal) return res.status(404).json({ error: 'Goal not found' });
    const j = goal.toJSON();
    const progressPct = j.target_value ? ((j.current_value || 0) / j.target_value * 100) : null;
    const result = await ai.callAI(
      'You are a franchise OKR coach. Write a concise weekly progress narrative (2-3 paragraphs) and a JSON action plan. Return ONLY JSON: {narrative, sentiment (positive|neutral|at_risk|critical), recommended_actions (array), eta_days (number)}.',
      JSON.stringify({ goal: j, progress_pct: progressPct })
    );
    const parsed = parseAIJson(result);
    await goal.update({ weekly_narrative: parsed?.narrative || result, last_narrative_at: new Date() });
    await persistAIResult('Goal', goal.id, 'weekly-narrative', result, parsed, process.env.OPENROUTER_MODEL, req.user?.id);
    res.json({ goal, narrative: parsed?.narrative || result, parsed });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── NEW: Unit performance comparison & ranking ──
app.post('/api/ai/unit-rank', auth, aiRateLimiter, async (req, res) => {
  try {
    const { metric = 'composite' } = req.body || {};
    const units = await FranchiseUnit.findAll({ limit: 200 });
    const revenue = await RevenueRecord.findAll({ limit: 1000 });
    const reviews = await CustomerReview.findAll({ limit: 1000 });
    const financials = await FinancialRecord.findAll({ limit: 1000 });

    // Aggregate per unit
    const unitMap = new Map();
    for (const u of units) unitMap.set(u.id, { unit: u.toJSON(), revenue: 0, profit: 0, ratings: [], expenses: 0 });

    for (const r of revenue) {
      const k = unitMap.get(r.franchiseUnitId);
      if (k) k.revenue += parseFloat(r.revenue || 0);
    }
    for (const f of financials) {
      const k = unitMap.get(f.franchiseUnitId);
      if (k) {
        k.profit += parseFloat(f.profit || 0);
        k.expenses += parseFloat(f.expenses || 0);
      }
    }
    for (const rv of reviews) {
      const k = unitMap.get(rv.franchiseUnitId);
      if (k) k.ratings.push(rv.rating || 0);
    }

    const ranked = [...unitMap.values()].map(u => {
      const avgRating = u.ratings.length ? u.ratings.reduce((s, x) => s + x, 0) / u.ratings.length : 0;
      const margin = u.revenue > 0 ? (u.profit / u.revenue) : 0;
      const composite = (u.revenue / 1000) * 0.5 + margin * 100 * 0.3 + avgRating * 5 * 0.2;
      return {
        unit_id: u.unit.id,
        unit_name: u.unit.name,
        revenue: u.revenue,
        profit: u.profit,
        margin_pct: parseFloat((margin * 100).toFixed(2)),
        avg_rating: parseFloat(avgRating.toFixed(2)),
        composite_score: parseFloat(composite.toFixed(2)),
      };
    }).sort((a, b) => {
      if (metric === 'revenue') return b.revenue - a.revenue;
      if (metric === 'margin') return b.margin_pct - a.margin_pct;
      if (metric === 'rating') return b.avg_rating - a.avg_rating;
      return b.composite_score - a.composite_score;
    });

    const top = ranked.slice(0, 10);
    const bottom = ranked.slice(-10).reverse();

    let aiAnalysis = null;
    try {
      const text = await ai.callAI(
        'You are a franchise operations analyst. Identify why top units win and why bottom units lag, and recommend actions for the bottom. Return STRICT JSON.',
        JSON.stringify({ metric, top, bottom })
      );
      aiAnalysis = parseAIJson(text) || { raw: text };
    } catch (e) {
      aiAnalysis = { error: e.message };
    }

    await persistAIResult('FranchiseUnit', null, 'unit-rank', JSON.stringify({ metric, top, bottom }), aiAnalysis, process.env.OPENROUTER_MODEL, req.user?.id);

    res.json({ metric, ranked, top, bottom, ai_analysis: aiAnalysis });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── NEW: Predictive closure risk ──
app.post('/api/ai/predictive-closure', auth, aiRateLimiter, async (req, res) => {
  try {
    const units = await FranchiseUnit.findAll({ limit: 200 });
    const revenue = await RevenueRecord.findAll({ order: [['id', 'DESC']], limit: 2000 });
    const compliance = await ComplianceRecord.findAll({ order: [['id', 'DESC']], limit: 2000 });
    const reviews = await CustomerReview.findAll({ order: [['id', 'DESC']], limit: 2000 });

    const text = await ai.callAI(
      'You are a franchise risk analyst. For each unit, compute a closure-risk score (0-100) using revenue trajectory, compliance violations, and review sentiment. Return STRICT JSON only.',
      JSON.stringify({
        units: units.map(u => u.toJSON()),
        revenue_sample: revenue.slice(0, 200).map(r => r.toJSON()),
        compliance_sample: compliance.slice(0, 200).map(c => c.toJSON()),
        reviews_sample: reviews.slice(0, 200).map(r => r.toJSON()),
      })
    );
    const parsed = parseAIJson(text) || { raw: text };
    await persistAIResult('FranchiseUnit', null, 'predictive-closure', text, parsed, process.env.OPENROUTER_MODEL, req.user?.id);

    res.json({ analysis: text, parsed, units_evaluated: units.length });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── NEW: Best-practice extraction (codify what top units do well) ──
app.post('/api/ai/best-practice-extraction', auth, aiRateLimiter, async (req, res) => {
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      return res.status(503).json({ error: 'OPENROUTER_API_KEY is not set. AI service unavailable.' });
    }
    const topN = Math.max(3, Math.min(20, parseInt(req.body?.top_n) || 5));

    const units = await FranchiseUnit.findAll({ limit: 200 });
    const revenue = await RevenueRecord.findAll({ limit: 1000 });
    const reviews = await CustomerReview.findAll({ limit: 1000 });
    const financials = await FinancialRecord.findAll({ limit: 1000 });
    const compliance = await ComplianceRecord.findAll({ limit: 500 });
    const training = await TrainingProgram.findAll({ limit: 200 });
    const staff = await StaffMember.findAll({ limit: 500 });

    // Aggregate per unit (same shape as unit-rank composite)
    const unitMap = new Map();
    for (const u of units) unitMap.set(u.id, { unit: u.toJSON(), revenue: 0, profit: 0, ratings: [], expenses: 0 });

    for (const r of revenue) {
      const k = unitMap.get(r.franchiseUnitId);
      if (k) k.revenue += parseFloat(r.revenue || 0);
    }
    for (const f of financials) {
      const k = unitMap.get(f.franchiseUnitId);
      if (k) {
        k.profit += parseFloat(f.profit || 0);
        k.expenses += parseFloat(f.expenses || 0);
      }
    }
    for (const rv of reviews) {
      const k = unitMap.get(rv.franchiseUnitId);
      if (k) k.ratings.push(rv.rating || 0);
    }

    const ranked = [...unitMap.values()].map(u => {
      const avgRating = u.ratings.length ? u.ratings.reduce((s, x) => s + x, 0) / u.ratings.length : 0;
      const margin = u.revenue > 0 ? (u.profit / u.revenue) : 0;
      const composite = (u.revenue / 1000) * 0.5 + margin * 100 * 0.3 + avgRating * 5 * 0.2;
      return {
        unit_id: u.unit.id,
        unit_name: u.unit.name,
        revenue: u.revenue,
        profit: u.profit,
        margin_pct: parseFloat((margin * 100).toFixed(2)),
        avg_rating: parseFloat(avgRating.toFixed(2)),
        composite_score: parseFloat(composite.toFixed(2)),
      };
    }).sort((a, b) => b.composite_score - a.composite_score);

    const topUnits = ranked.slice(0, topN);
    const topIds = new Set(topUnits.map(u => u.unit_id));

    // Pull supporting context: training/compliance/staff at top units
    const trainingTop = training.filter(t => topIds.has(t.franchiseUnitId)).map(t => t.toJSON());
    const complianceTop = compliance.filter(c => topIds.has(c.franchiseUnitId)).map(c => c.toJSON());
    const staffTop = staff.filter(s => topIds.has(s.franchiseUnitId)).map(s => ({
      id: s.id, role: s.role, performanceRating: s.performanceRating,
      hoursPerWeek: s.hoursPerWeek, franchiseUnitId: s.franchiseUnitId
    }));

    let aiAnalysis = null;
    try {
      const text = await ai.callAI(
        'You are a franchise operations consultant. Examine the top-performing units and codify the recurring patterns into actionable best practices. Return STRICT JSON only: {best_practices: [{category, practice, evidence, replication_steps, expected_impact}], top_unit_summaries: [{unit_id, unit_name, why_top}], adoption_priorities: [string]}.',
        JSON.stringify({
          top_n: topN,
          top_units: topUnits,
          training_programs_at_top_units: trainingTop,
          compliance_records_at_top_units: complianceTop,
          staff_at_top_units: staffTop,
        })
      );
      aiAnalysis = parseAIJson(text) || { raw: text };
      await persistAIResult('FranchiseUnit', null, 'best-practice-extraction', text, aiAnalysis, process.env.OPENROUTER_MODEL, req.user?.id);
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }

    res.json({
      top_n: topN,
      top_units: topUnits,
      best_practices: aiAnalysis?.best_practices || [],
      adoption_priorities: aiAnalysis?.adoption_priorities || [],
      ai_analysis: aiAnalysis,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── NEW: Labor cost optimizer (uses StaffMember model) ──
app.post('/api/ai/labor-cost-optimizer', auth, aiRateLimiter, async (req, res) => {
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      return res.status(503).json({ error: 'OPENROUTER_API_KEY is not set. AI service unavailable.' });
    }
    const unitIdFilter = req.body?.unit_id ? parseInt(req.body.unit_id) : null;
    const targetReductionPct = parseFloat(req.body?.target_reduction_pct) || 10;

    const staffWhere = unitIdFilter ? { franchiseUnitId: unitIdFilter } : {};
    const staff = await StaffMember.findAll({ where: staffWhere, limit: 1000 });
    if (staff.length === 0) return res.json({ message: 'No staff data to analyze.', recommendations: [] });

    const revenue = await RevenueRecord.findAll(unitIdFilter ? { where: { franchiseUnitId: unitIdFilter }, limit: 500 } : { limit: 500 });
    const financials = await FinancialRecord.findAll(unitIdFilter ? { where: { franchiseUnitId: unitIdFilter }, limit: 500 } : { limit: 500 });
    const units = await FranchiseUnit.findAll(unitIdFilter ? { where: { id: unitIdFilter } } : { limit: 200 });

    // Aggregate per unit
    const unitAgg = new Map();
    for (const u of units) unitAgg.set(u.id, {
      unit: u.toJSON(), revenue: 0, profit: 0,
      laborCostAnnual: 0, headcount: 0, totalHours: 0, avgRating: 0, ratingsSum: 0, ratingsN: 0
    });

    for (const r of revenue) {
      const k = unitAgg.get(r.franchiseUnitId);
      if (k) k.revenue += parseFloat(r.revenue || 0);
    }
    for (const f of financials) {
      const k = unitAgg.get(f.franchiseUnitId);
      if (k) k.profit += parseFloat(f.profit || 0);
    }
    for (const s of staff) {
      const k = unitAgg.get(s.franchiseUnitId);
      if (k && (s.status === 'active' || !s.status)) {
        k.laborCostAnnual += parseFloat(s.salary || 0);
        k.headcount += 1;
        k.totalHours += parseFloat(s.hoursPerWeek || 0);
        if (s.performanceRating != null) {
          k.ratingsSum += parseFloat(s.performanceRating || 0);
          k.ratingsN += 1;
        }
      }
    }

    const unitSummaries = [...unitAgg.values()].map(u => {
      const laborToRevenuePct = u.revenue > 0 ? (u.laborCostAnnual / u.revenue * 100) : null;
      const avgPerf = u.ratingsN ? u.ratingsSum / u.ratingsN : null;
      return {
        unit_id: u.unit.id,
        unit_name: u.unit.name,
        annual_revenue: u.revenue,
        annual_profit: u.profit,
        annual_labor_cost: u.laborCostAnnual,
        labor_to_revenue_pct: laborToRevenuePct != null ? parseFloat(laborToRevenuePct.toFixed(2)) : null,
        headcount: u.headcount,
        total_weekly_hours: u.totalHours,
        avg_performance_rating: avgPerf != null ? parseFloat(avgPerf.toFixed(2)) : null,
      };
    });

    // Detail breakdown of staff (compact projection so the LLM has names/roles)
    const staffSnapshot = staff.map(s => ({
      id: s.id, name: s.name, franchise_unit_id: s.franchiseUnitId,
      role: s.role, department: s.department,
      salary: s.salary, hours_per_week: s.hoursPerWeek,
      performance_rating: s.performanceRating, status: s.status
    }));

    let aiAnalysis = null;
    try {
      const text = await ai.callAI(
        'You are a workforce / labor cost optimization expert. Recommend concrete labor cost reductions, schedule re-balancing, role consolidation, and overtime trimming so each unit hits the target labor cost reduction without harming service quality. Flag any unit whose labor-to-revenue ratio is dangerously high. Return STRICT JSON only: {recommendations: [{unit_id, unit_name, action, projected_savings_usd, projected_savings_pct, risk, priority}], summary, projected_total_savings_usd, hours_to_re-allocate}.',
        JSON.stringify({
          target_reduction_pct: targetReductionPct,
          unit_summaries: unitSummaries,
          staff_snapshot: staffSnapshot.slice(0, 200),
        })
      );
      aiAnalysis = parseAIJson(text) || { raw: text };
      await persistAIResult('StaffMember', unitIdFilter || null, 'labor-cost-optimizer', text, aiAnalysis, process.env.OPENROUTER_MODEL, req.user?.id);
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }

    res.json({
      target_reduction_pct: targetReductionPct,
      unit_summaries: unitSummaries,
      recommendations: aiAnalysis?.recommendations || [],
      projected_total_savings_usd: aiAnalysis?.projected_total_savings_usd || null,
      summary: aiAnalysis?.summary || null,
      ai_analysis: aiAnalysis,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Dashboard stats
app.get('/api/dashboard/stats', auth, async (req, res) => {
  try {
    const [units, revenue, staff, reviews, openAlerts, goals] = await Promise.all([
      FranchiseUnit.count(),
      RevenueRecord.findAll(),
      StaffMember.count(),
      CustomerReview.findAll(),
      AlertRecord.count({ where: { status: 'open' } }).catch(() => 0),
      Goal.count().catch(() => 0)
    ]);
    const totalRevenue = revenue.reduce((sum, r) => sum + parseFloat(r.revenue || 0), 0);
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
      : 0;
    res.json({
      totalUnits: units, totalRevenue, totalStaff: staff,
      avgRating: avgRating.toFixed(2), openAlerts, totalGoals: goals
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));
app.use('/api/territory-optimization', require('./routes/territoryOptimization'));
app.use('/api/brand-standard-audit', require('./routes/brandStandardAudit'));
app.use('/api/peer-mentoring', require('./routes/peerMentoring'));
app.use('/api/royalty-leakage', require('./routes/royaltyLeakage'));

app.use((err, req, res, next) => {
  console.error('[error]', err.message);
  res.status(500).json({ error: err.message });
});

async function start() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
