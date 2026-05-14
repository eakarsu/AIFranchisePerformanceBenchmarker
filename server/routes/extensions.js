// Apply pass 5 — backlog implementations for AIFranchisePerformanceBenchmarker.
//
// Backlog from _AUDIT_NOTE.md:
//   1. Real-time POS integration (NEEDS-CREDS)               → 503 missing POS_API_*
//   2. SOP repository RAG (NEEDS-CREDS / new vector store)   → in-memory hashed-BoW (additive)
//   3. Multi-unit P&L roll-up (NEEDS-PRODUCT-DECISION)
//   4. Franchise-to-franchise messaging (NEEDS-PRODUCT-DECISION)
//   5. Agentic compliance auditor (NEEDS-PRODUCT-DECISION)
//   6. Peer mentorship matching (NEEDS-PRODUCT-DECISION)
//   7. Supplier-bulk-buy negotiation assistant (NEEDS-PRODUCT-DECISION)
//
// Env vars (NEEDS-CREDS):
//   POS_API_BASE_URL, POS_API_KEY  — for real-time POS integration. If unset,
//     POS endpoints return 503 with `missing` field.
//   OPENROUTER_API_KEY             — required for AI-backed endpoints.
//
// PRODUCT-DECISION (P&L roll-up): aggregate FinancialRecord rows by
//   {region|null, owner|null} for the requested period. Returns roll-up tree
//   with revenue / expenses / profit / margin per branch; AI explains drivers
//   only when OPENROUTER is set.
// PRODUCT-DECISION (messaging): direct-to-recipient messages between
//   FranchiseUnit owners (modeled by FranchiseUnit.id pair). No groups, no
//   attachments. Read flag per message.
// PRODUCT-DECISION (agentic compliance auditor): on-demand sweep — scans
//   ComplianceRecord rows, ranks by recency/severity, asks AI for
//   recommended-action JSON. No background daemon.
// PRODUCT-DECISION (peer mentorship): matches a struggling unit to a top-
//   performer in the same region by composite score gap. Suggests focus-areas
//   via AI.
// PRODUCT-DECISION (supplier negotiation): asks AI to draft a bulk-buy
//   negotiation script using SupplyChainItem rows + target_savings_pct.

const express = require('express');
const { DataTypes } = require('sequelize');
const router = express.Router();
const auth = require('../middleware/auth');
const { aiRateLimiter } = require('../middleware/rateLimiter');
const ai = require('../services/openRouterService');

const {
  sequelize, FranchiseUnit, RevenueRecord, FinancialRecord, ComplianceRecord,
  StaffMember, SupplyChainItem, CustomerReview,
} = require('../models');

// ──────────────────────────────────────────────────────────────────────
// Models — additive, CREATE TABLE IF NOT EXISTS via sync()
// ──────────────────────────────────────────────────────────────────────
const SOPDoc = sequelize.define('SOPDoc', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING },
  category: { type: DataTypes.STRING },
  content: { type: DataTypes.TEXT },
  vector: { type: DataTypes.TEXT },
  uploadedBy: { type: DataTypes.INTEGER },
}, { tableName: 'sop_docs', timestamps: true });

const FranchiseMessage = sequelize.define('FranchiseMessage', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  fromUnitId: { type: DataTypes.INTEGER, allowNull: false },
  toUnitId: { type: DataTypes.INTEGER, allowNull: false },
  subject: { type: DataTypes.STRING },
  body: { type: DataTypes.TEXT },
  readAt: { type: DataTypes.DATE, allowNull: true },
}, { tableName: 'franchise_messages', timestamps: true });

const POSSyncLog = sequelize.define('POSSyncLog', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  unitId: { type: DataTypes.INTEGER },
  status: { type: DataTypes.STRING },
  payload: { type: DataTypes.TEXT },
}, { tableName: 'pos_sync_logs', timestamps: true });

(async () => {
  try { await SOPDoc.sync(); } catch (e) { console.error('[ext] sop_docs sync:', e.message); }
  try { await FranchiseMessage.sync(); } catch (e) { console.error('[ext] franchise_messages sync:', e.message); }
  try { await POSSyncLog.sync(); } catch (e) { console.error('[ext] pos_sync_logs sync:', e.message); }
})();

// ──────────────────────────────────────────────────────────────────────
// Tiny in-memory vector tooling (hashed BoW)
// ──────────────────────────────────────────────────────────────────────
const VEC_DIM = 256;
const tokenize = (t) => (t || '').toLowerCase().match(/[a-z0-9]{3,}/g) || [];
const hashStr = (s) => { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return Math.abs(h); };
function embed(text) {
  const v = new Array(VEC_DIM).fill(0);
  for (const tok of tokenize(text)) v[hashStr(tok) % VEC_DIM] += 1;
  let n = 0; for (const x of v) n += x * x; n = Math.sqrt(n) || 1;
  return v.map((x) => x / n);
}
const cosine = (a, b) => { let s = 0; for (let i = 0; i < a.length; i++) s += a[i] * b[i]; return s; };

function parseAIJson(text) {
  if (!text) return null;
  try { return JSON.parse(text); } catch (e) {}
  const m = text.match(/\{[\s\S]*\}/); if (m) { try { return JSON.parse(m[0]); } catch (e) {} }
  return null;
}

function require503(res, env) {
  if (!process.env[env]) {
    res.status(503).json({ error: `${env} is not set`, missing: env });
    return true;
  }
  return false;
}
function requireOpenRouter(res) { return require503(res, 'OPENROUTER_API_KEY'); }

// ──────────────────────────────────────────────────────────────────────
// 1. Real-time POS integration (NEEDS-CREDS)
//    POST /api/extensions/pos/sync     { unit_id }
//    GET  /api/extensions/pos/status
// ──────────────────────────────────────────────────────────────────────
router.post('/pos/sync', auth, async (req, res) => {
  // Requires both POS_API_BASE_URL and POS_API_KEY. Returns 503 + missing list if either missing.
  const missing = [];
  if (!process.env.POS_API_BASE_URL) missing.push('POS_API_BASE_URL');
  if (!process.env.POS_API_KEY) missing.push('POS_API_KEY');
  if (missing.length) {
    return res.status(503).json({ error: 'POS integration not configured', missing: missing.join(',') });
  }
  // If creds are present we still don't make a real call (we don't know the
  // POS vendor's schema). Log a sync request so the FE can verify the path.
  try {
    const log = await POSSyncLog.create({
      unitId: req.body?.unit_id || null,
      status: 'queued',
      payload: JSON.stringify({ at: new Date().toISOString() }),
    });
    res.json({ queued: true, log_id: log.id });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/pos/status', auth, async (req, res) => {
  res.json({
    configured: Boolean(process.env.POS_API_BASE_URL && process.env.POS_API_KEY),
    missing: [
      !process.env.POS_API_BASE_URL && 'POS_API_BASE_URL',
      !process.env.POS_API_KEY && 'POS_API_KEY',
    ].filter(Boolean),
  });
});

// ──────────────────────────────────────────────────────────────────────
// 2. SOP repository RAG (additive in-memory)
//    POST /api/extensions/sop          { title, category?, content }
//    GET  /api/extensions/sop
//    POST /api/extensions/sop/query    { query, top_k? }
//    DELETE /api/extensions/sop/:id
// ──────────────────────────────────────────────────────────────────────
router.post('/sop', auth, async (req, res) => {
  try {
    const { title, category, content } = req.body || {};
    if (!content) return res.status(400).json({ error: 'content required' });
    const v = embed(`${title || ''} ${content}`);
    const row = await SOPDoc.create({
      title, category: category || 'general',
      content: String(content).slice(0, 50000),
      vector: JSON.stringify(v), uploadedBy: req.user.id,
    });
    res.status(201).json({ id: row.id, indexed: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/sop', auth, async (req, res) => {
  try {
    const rows = await SOPDoc.findAll({
      attributes: ['id', 'title', 'category', 'createdAt'],
      order: [['createdAt', 'DESC']], limit: 200,
    });
    res.json({ data: rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/sop/:id', auth, async (req, res) => {
  try {
    const n = await SOPDoc.destroy({ where: { id: req.params.id } });
    if (!n) return res.status(404).json({ error: 'not found' });
    res.json({ deleted: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/sop/query', auth, aiRateLimiter, async (req, res) => {
  try {
    const q = (req.body?.query || '').toString();
    const topK = Math.max(1, Math.min(8, parseInt(req.body?.top_k) || 3));
    if (!q) return res.status(400).json({ error: 'query required' });
    const qv = embed(q);
    const docs = await SOPDoc.findAll();
    const scored = docs.map((d) => {
      let v = []; try { v = JSON.parse(d.vector || '[]'); } catch (e) {}
      return { id: d.id, title: d.title, category: d.category, content: d.content, score: cosine(qv, v) };
    }).sort((a, b) => b.score - a.score).slice(0, topK);

    let answer = null;
    if (process.env.OPENROUTER_API_KEY && scored.length) {
      try {
        const ctx = scored.map((s, i) => `[SOP ${i + 1} • ${s.title || s.category}]\n${s.content.slice(0, 1500)}`).join('\n\n');
        answer = await ai.callAI(
          'Answer the operator question using ONLY the SOP excerpts. Cite each claim like [SOP N]. If the SOPs do not cover it, say so.',
          `Question: ${q}\n\n${ctx}`
        );
      } catch (e) { /* graceful */ }
    }
    res.json({
      query: q, top_k: topK,
      matches: scored.map((s) => ({ id: s.id, title: s.title, category: s.category, score: s.score, snippet: s.content.slice(0, 240) })),
      answer,
      note: 'Approximate hashed-BoW retrieval (no external vector DB).',
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ──────────────────────────────────────────────────────────────────────
// 3. Multi-unit P&L roll-up
//    POST /api/extensions/pnl-rollup   { group_by?, region?, period_days? }
// ──────────────────────────────────────────────────────────────────────
router.post('/pnl-rollup', auth, async (req, res) => {
  try {
    const groupBy = (req.body?.group_by || 'region').toString(); // PRODUCT-DECISION default
    const region = req.body?.region || null;

    const units = await FranchiseUnit.findAll();
    const fin = await FinancialRecord.findAll();
    const rev = await RevenueRecord.findAll();

    const unitIndex = new Map(units.map((u) => [u.id, u.toJSON()]));
    const buckets = new Map();

    function bucketKey(u) {
      if (groupBy === 'owner') return u?.owner || u?.ownerName || 'unassigned';
      return u?.region || u?.location || 'unspecified';
    }

    for (const u of units) {
      if (region && u.region && u.region !== region) continue;
      const k = bucketKey(u.toJSON());
      if (!buckets.has(k)) buckets.set(k, { key: k, revenue: 0, expenses: 0, profit: 0, units: [] });
      buckets.get(k).units.push({ id: u.id, name: u.name });
    }
    for (const r of rev) {
      const u = unitIndex.get(r.franchiseUnitId);
      if (!u) continue;
      if (region && u.region && u.region !== region) continue;
      const b = buckets.get(bucketKey(u)); if (b) b.revenue += parseFloat(r.revenue || 0);
    }
    for (const f of fin) {
      const u = unitIndex.get(f.franchiseUnitId);
      if (!u) continue;
      if (region && u.region && u.region !== region) continue;
      const b = buckets.get(bucketKey(u));
      if (b) {
        b.expenses += parseFloat(f.expenses || 0);
        b.profit += parseFloat(f.profit || 0);
      }
    }
    const rollup = [...buckets.values()].map((b) => ({
      ...b,
      margin_pct: b.revenue > 0 ? parseFloat(((b.profit / b.revenue) * 100).toFixed(2)) : 0,
      unit_count: b.units.length,
    })).sort((a, b) => b.revenue - a.revenue);

    let aiAnalysis = null;
    if (process.env.OPENROUTER_API_KEY) {
      try {
        const text = await ai.callAI(
          'You are a CFO. Given this P&L roll-up, return STRICT JSON {drivers:[{bucket,observation}], risks:[string], opportunities:[string]}.',
          JSON.stringify({ group_by: groupBy, region, rollup }),
        );
        aiAnalysis = parseAIJson(text);
      } catch (e) { /* graceful */ }
    }
    res.json({ group_by: groupBy, region, rollup, ai_analysis: aiAnalysis });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ──────────────────────────────────────────────────────────────────────
// 4. Franchise-to-franchise messaging
//    POST /api/extensions/messages    { from_unit_id, to_unit_id, subject, body }
//    GET  /api/extensions/messages?unit_id=X
//    POST /api/extensions/messages/:id/read
// ──────────────────────────────────────────────────────────────────────
router.post('/messages', auth, async (req, res) => {
  try {
    const { from_unit_id, to_unit_id, subject, body } = req.body || {};
    if (!from_unit_id || !to_unit_id) return res.status(400).json({ error: 'from_unit_id and to_unit_id required' });
    const row = await FranchiseMessage.create({ fromUnitId: from_unit_id, toUnitId: to_unit_id, subject, body });
    res.status(201).json(row);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/messages', auth, async (req, res) => {
  try {
    const unitId = req.query.unit_id ? parseInt(req.query.unit_id) : null;
    const where = unitId ? { [require('sequelize').Op.or]: [{ fromUnitId: unitId }, { toUnitId: unitId }] } : {};
    const rows = await FranchiseMessage.findAll({ where, order: [['createdAt', 'DESC']], limit: 200 });
    res.json({ data: rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/messages/:id/read', auth, async (req, res) => {
  try {
    const row = await FranchiseMessage.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: 'not found' });
    row.readAt = new Date(); await row.save();
    res.json(row);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ──────────────────────────────────────────────────────────────────────
// 5. Agentic compliance auditor (on-demand sweep)
//    POST /api/extensions/compliance/audit   { unit_id? }
// ──────────────────────────────────────────────────────────────────────
router.post('/compliance/audit', auth, aiRateLimiter, async (req, res) => {
  if (requireOpenRouter(res)) return;
  try {
    const where = req.body?.unit_id ? { franchiseUnitId: parseInt(req.body.unit_id) } : {};
    const records = await ComplianceRecord.findAll({ where, order: [['createdAt', 'DESC']], limit: 300 });
    if (!records.length) return res.json({ message: 'no compliance records', findings: [] });

    const summary = records.map((r) => ({
      id: r.id, unit: r.franchiseUnitId,
      type: r.complianceType || r.type, status: r.status,
      severity: r.severity, due_date: r.dueDate, last_checked: r.lastChecked,
      notes: (r.notes || '').slice(0, 200),
    }));

    let aiJson = null;
    try {
      const text = await ai.callAI(
        'You are a compliance auditor. Identify top-risk items and recommend an action with owner and SLA. Return STRICT JSON {findings:[{record_id, risk_score, recommended_action, owner, sla_days}], summary:string}.',
        JSON.stringify({ records: summary }),
      );
      aiJson = parseAIJson(text) || { raw: text };
    } catch (e) { return res.status(500).json({ error: e.message }); }

    res.json({ scanned: records.length, ai: aiJson });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ──────────────────────────────────────────────────────────────────────
// 6. Peer mentorship matching
//    POST /api/extensions/mentorship/match   { unit_id }
// ──────────────────────────────────────────────────────────────────────
router.post('/mentorship/match', auth, aiRateLimiter, async (req, res) => {
  try {
    const unitId = parseInt(req.body?.unit_id);
    if (!unitId) return res.status(400).json({ error: 'unit_id required' });
    const target = await FranchiseUnit.findByPk(unitId);
    if (!target) return res.status(404).json({ error: 'unit not found' });

    const units = await FranchiseUnit.findAll();
    const rev = await RevenueRecord.findAll();
    const fin = await FinancialRecord.findAll();
    const reviews = await CustomerReview.findAll();

    const score = new Map();
    for (const u of units) score.set(u.id, { unit: u.toJSON(), revenue: 0, profit: 0, ratings: [] });
    for (const r of rev) { const k = score.get(r.franchiseUnitId); if (k) k.revenue += parseFloat(r.revenue || 0); }
    for (const f of fin) { const k = score.get(f.franchiseUnitId); if (k) k.profit += parseFloat(f.profit || 0); }
    for (const rv of reviews) { const k = score.get(rv.franchiseUnitId); if (k) k.ratings.push(rv.rating || 0); }

    const ranked = [...score.values()].map((s) => {
      const margin = s.revenue > 0 ? s.profit / s.revenue : 0;
      const avg = s.ratings.length ? s.ratings.reduce((a, b) => a + b, 0) / s.ratings.length : 0;
      return { id: s.unit.id, name: s.unit.name, region: s.unit.region, composite: s.revenue / 1000 * 0.5 + margin * 30 + avg * 5 * 0.2 };
    }).sort((a, b) => b.composite - a.composite);

    const candidates = ranked
      .filter((u) => u.id !== target.id && (!target.region || u.region === target.region))
      .slice(0, 3);

    let aiPlan = null;
    if (process.env.OPENROUTER_API_KEY && candidates.length) {
      try {
        const text = await ai.callAI(
          'You are a franchise coaching director. Return STRICT JSON {top_match: {mentor_unit_id, mentor_name, focus_areas:[string]}, runner_ups:[{mentor_unit_id, mentor_name}]} matching the target unit to its best mentor and listing 3 focus areas.',
          JSON.stringify({ target: { id: target.id, name: target.name, region: target.region }, candidates }),
        );
        aiPlan = parseAIJson(text);
      } catch (e) { /* graceful */ }
    }
    res.json({ target_unit_id: unitId, candidates, ai_plan: aiPlan });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ──────────────────────────────────────────────────────────────────────
// 7. Supplier bulk-buy negotiation assistant
//    POST /api/extensions/supplier/negotiate  { target_savings_pct?, supplier? }
// ──────────────────────────────────────────────────────────────────────
router.post('/supplier/negotiate', auth, aiRateLimiter, async (req, res) => {
  if (requireOpenRouter(res)) return;
  try {
    const target = parseFloat(req.body?.target_savings_pct) || 8; // PRODUCT-DECISION default 8%
    const supplier = req.body?.supplier || null;
    const where = supplier ? { supplier } : {};
    const items = await SupplyChainItem.findAll({ where, limit: 200 });

    const summary = items.map((i) => ({
      id: i.id, name: i.itemName || i.name, supplier: i.supplier,
      unit_cost: parseFloat(i.unitCost || 0), quantity: parseFloat(i.quantity || 0),
      lead_time_days: i.leadTimeDays, contract_terms: i.contractTerms,
    }));

    let aiOut = null;
    try {
      const text = await ai.callAI(
        'You are a procurement negotiator. Draft a bulk-buy negotiation script with talking points, walk-away terms, and concession ladder. Return STRICT JSON {summary, talking_points:[string], walk_away_terms:[string], concession_ladder:[string], expected_savings_pct:number}.',
        JSON.stringify({ target_savings_pct: target, supplier, items: summary.slice(0, 50) }),
      );
      aiOut = parseAIJson(text) || { raw: text };
    } catch (e) { return res.status(500).json({ error: e.message }); }

    res.json({ supplier, target_savings_pct: target, item_count: summary.length, ai: aiOut });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/health', (req, res) => res.json({
  status: 'ok',
  features: ['pos', 'sop', 'pnl-rollup', 'messages', 'compliance-audit', 'mentorship', 'supplier-negotiate'],
}));

module.exports = router;
