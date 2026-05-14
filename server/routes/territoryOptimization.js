// Dynamic territory optimization recommending unit consolidation/expansion
// based on demographic + operational data.
// Audit: batch_04.md / AIFranchisePerformanceBenchmarker / Custom Feature Suggestions #2
const express = require('express');
const authMiddleware = require('../middleware/auth');
const { callAI } = require('../services/openRouterService');
const { FranchiseUnit, RevenueRecord } = require('../models');

const router = express.Router();
router.use(authMiddleware);

function parseJSON(text) {
  try { const m = text.match(/\{[\s\S]*\}/); if (m) return JSON.parse(m[0]); } catch (_) {}
  return { notes: text };
}

// POST /api/territory-optimization/analyze
// Body: { region?, demographic_signals?, expansion_budget_usd? }
router.post('/analyze', async (req, res) => {
  try {
    const { region, demographic_signals, expansion_budget_usd } = req.body || {};

    let units = [];
    try { units = await FranchiseUnit.findAll({ limit: 100 }); } catch (_) {}
    let revenue = [];
    try { revenue = await RevenueRecord.findAll({ limit: 100, order: [['createdAt', 'DESC']] }); } catch (_) {}

    const unitData = units.map(u => ({
      id: u.id, name: u.name,
      location: u.location || u.city || null,
      monthly_revenue: u.monthly_revenue || null,
      avg_ticket: u.avg_ticket || null,
      population_density: u.population_density || null
    }));

    const systemPrompt = `You are a franchise territory optimization analyst. Given multi-unit performance and demographic
context, recommend consolidations (close/merge underperformers) and expansions (new territories). Return STRICT JSON only.`;

    const userPrompt = `Region scope: ${region || 'all'}
Expansion budget USD: ${expansion_budget_usd || 'unspecified'}
Demographic signals: ${JSON.stringify(demographic_signals || {})}

Units: ${JSON.stringify(unitData.slice(0, 40))}
Recent revenue (sample): ${JSON.stringify(revenue.slice(0, 20).map(r => ({ unit_id: r.unit_id, period: r.period, revenue: r.revenue })))}

Return JSON:
{
  "summary": "...",
  "consolidate": [{ "unit_id": "string", "action": "close|merge|relocate", "rationale": "string", "estimated_savings_usd": 0 }],
  "expand": [{ "candidate_market": "string", "population": 0, "rationale": "string", "estimated_capex_usd": 0, "payback_months": 0 }],
  "watchlist": [{ "unit_id": "string", "risk": "string" }],
  "next_actions": ["..."],
  "disclaimer": "Strategic recommendation; validate with on-ground market study."
}`;

    const raw = await callAI(systemPrompt, userPrompt);
    res.json({ region, recommendations: parseJSON(raw) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/territory-optimization/units - quick unit list for the UI
router.get('/units', async (_req, res) => {
  try {
    let units = [];
    try { units = await FranchiseUnit.findAll({ limit: 200 }); } catch (_) {}
    res.json(units);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
