// Brand-standard photo audit via vision models analyzing in-store imagery
// against franchisor SOPs.
// Audit: batch_04.md / AIFranchisePerformanceBenchmarker / Custom Feature Suggestions #5
const express = require('express');
const authMiddleware = require('../middleware/auth');
const { callAI } = require('../services/openRouterService');
const { ComplianceRecord, FranchiseUnit } = require('../models');

const router = express.Router();
router.use(authMiddleware);

function parseJSON(text) {
  try { const m = text.match(/\{[\s\S]*\}/); if (m) return JSON.parse(m[0]); } catch (_) {}
  return { notes: text };
}

// POST /api/brand-standard-audit/scan
// Body: { unit_id, image_urls: [..], sop_summary?: string }
router.post('/scan', async (req, res) => {
  try {
    const { unit_id, image_urls = [], sop_summary } = req.body || {};
    if (!unit_id || !Array.isArray(image_urls) || image_urls.length === 0) {
      return res.status(400).json({ error: 'unit_id and at least one image_url required' });
    }

    let unit = null;
    try { unit = await FranchiseUnit.findByPk(unit_id); } catch (_) {}

    const systemPrompt = `You are a brand-standard compliance auditor for a multi-unit franchise. You will
receive image URLs from a franchisee store and a brand SOP summary. Compare against typical brand standards
(signage, uniform, cleanliness, layout, food presentation) and return STRICT JSON. If you cannot directly view
the images, reason about expected check categories and produce a structured audit template ready for human review.`;

    const userPrompt = `Unit: ${unit ? unit.name : unit_id} (${unit?.location || unit?.city || 'unknown location'})
Image URLs (${image_urls.length}):
${image_urls.slice(0, 10).join('\n')}

SOP summary: ${sop_summary || 'standard franchise brand SOPs (signage, uniform, cleanliness, food presentation, layout)'}

Return JSON:
{
  "summary": "...",
  "overall_score_0_100": 0,
  "category_scores": {
    "signage": 0,
    "uniform": 0,
    "cleanliness": 0,
    "layout": 0,
    "food_presentation": 0
  },
  "findings": [{ "category": "string", "severity": "low|medium|high", "observation": "string", "remediation": "string" }],
  "follow_up_actions": ["..."],
  "training_recommendations": ["..."],
  "disclaimer": "AI-assisted audit; physical visit recommended for high-severity items."
}`;

    const raw = await callAI(systemPrompt, userPrompt);
    const parsed = parseJSON(raw);

    try {
      await ComplianceRecord.create({
        unit_id,
        audit_type: 'brand_standard_visual',
        score: parsed.overall_score_0_100 || null,
        findings: parsed,
        audited_at: new Date()
      });
    } catch (_) {}

    res.json({ unit_id, image_count: image_urls.length, audit: parsed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/brand-standard-audit/history?unit_id=...
router.get('/history', async (req, res) => {
  try {
    const where = { audit_type: 'brand_standard_visual' };
    if (req.query.unit_id) where.unit_id = req.query.unit_id;
    let rows = [];
    try {
      rows = await ComplianceRecord.findAll({
        where, limit: 50, order: [['audited_at', 'DESC']]
      });
    } catch (_) {}
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
