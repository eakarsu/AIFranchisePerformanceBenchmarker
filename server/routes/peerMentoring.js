// Franchisee peer-mentoring marketplace with AI-ranked compatibility and
// progress tracking.
// Audit: batch_04.md / AIFranchisePerformanceBenchmarker / Custom Feature Suggestions #6
const express = require('express');
const authMiddleware = require('../middleware/auth');
const { callAI } = require('../services/openRouterService');
const { FranchiseUnit, StaffMember, RevenueRecord } = require('../models');

const router = express.Router();
router.use(authMiddleware);

function parseJSON(text) {
  try { const m = text.match(/\{[\s\S]*\}/); if (m) return JSON.parse(m[0]); } catch (_) {}
  return { notes: text };
}

// POST /api/peer-mentoring/match
// Body: { mentee_unit_id, focus_area? }
router.post('/match', async (req, res) => {
  try {
    const { mentee_unit_id, focus_area } = req.body || {};
    if (!mentee_unit_id) {
      return res.status(400).json({ error: 'mentee_unit_id required' });
    }

    let mentee = null;
    let candidates = [];
    try { mentee = await FranchiseUnit.findByPk(mentee_unit_id); } catch (_) {}
    try {
      candidates = await FranchiseUnit.findAll({ limit: 50 });
    } catch (_) {}
    candidates = candidates.filter(c => c.id !== mentee_unit_id);

    // Pull simple revenue snapshot per candidate (best-effort)
    const peerSnapshots = await Promise.all(candidates.slice(0, 25).map(async u => {
      let r = [];
      try { r = await RevenueRecord.findAll({ where: { unit_id: u.id }, limit: 6, order: [['period', 'DESC']] }); } catch (_) {}
      const avg = r.length ? r.reduce((s, x) => s + Number(x.revenue || 0), 0) / r.length : null;
      return { id: u.id, name: u.name, location: u.location || u.city || null, avg_recent_revenue: avg };
    }));

    const systemPrompt = `You are a franchisee peer-mentoring matchmaker. Match a mentee unit with the best
mentor unit based on focus area, performance gap (mentor should outperform mentee in target area), geography,
and complementarity. Return STRICT JSON only.`;

    const userPrompt = `Mentee unit: ${mentee ? JSON.stringify({ id: mentee.id, name: mentee.name, location: mentee.location, monthly_revenue: mentee.monthly_revenue }) : mentee_unit_id}
Focus area: ${focus_area || 'general performance improvement'}
Candidate mentors: ${JSON.stringify(peerSnapshots)}

Return JSON:
{
  "summary": "...",
  "top_matches": [
    { "mentor_unit_id": "string", "mentor_unit_name": "string", "compatibility_score_0_100": 0, "rationale": "string", "suggested_curriculum": ["..."] }
  ],
  "kickoff_message_template": "string",
  "milestones_30_60_90": [{ "day": 30, "objective": "string", "metric": "string" }],
  "disclaimer": "AI-matched; confirm willingness and franchisor approval."
}`;

    const raw = await callAI(systemPrompt, userPrompt);
    res.json({ mentee_unit_id, focus_area: focus_area || null, matches: parseJSON(raw) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/peer-mentoring/units - candidate pool
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
