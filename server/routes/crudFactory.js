const express = require('express');
const auth = require('../middleware/auth');
const { aiRateLimiter } = require('../middleware/rateLimiter');
const AiResult = require('../models/AiResult');

// 3-strategy AI JSON parser
function parseAIJson(text) {
  if (!text || typeof text !== 'string') return null;
  try { return JSON.parse(text); } catch (e) {}
  const stripped = text.replace(/```(?:json)?\n?/g, '').replace(/```/g, '').trim();
  try { return JSON.parse(stripped); } catch (e) {}
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end > start) {
    try { return JSON.parse(text.slice(start, end + 1)); } catch (e) {}
  }
  return null;
}

async function persistAIResult(entity_type, entity_id, analysis_type, raw_response, parsed, model, user_id) {
  try {
    await AiResult.create({
      entity_type,
      entity_id: entity_id || null,
      analysis_type,
      raw_response: typeof raw_response === 'string' ? raw_response : JSON.stringify(raw_response),
      parsed_data: parsed || null,
      model: model || process.env.OPENROUTER_MODEL || 'anthropic/claude-3-5-sonnet-20241022',
      user_id: user_id || null,
    });
  } catch (err) {
    console.error('[AiResult] Failed to persist AI result:', err.message);
  }
}

function createCrudRouter(Model, aiFunction, requiredFields = []) {
  const router = express.Router();
  const entityType = Model.name;

  // ── GET all (paginated) ──
  router.get('/', auth, async (req, res) => {
    try {
      const page = Math.max(1, parseInt(req.query.page) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
      const offset = (page - 1) * limit;
      const { count, rows } = await Model.findAndCountAll({
        limit, offset, order: [['id', 'DESC']],
      });
      res.json({
        data: rows,
        pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
      });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  // ── AI: bounded analyze-all with map-reduce chunking ──
  if (aiFunction) {
    router.post('/ai-analyze-all', auth, aiRateLimiter, async (req, res) => {
      try {
        const CHUNK_SIZE = 25;
        const MAX_ROWS = 200;
        const items = await Model.findAll({ limit: MAX_ROWS, order: [['id', 'DESC']] });
        if (items.length === 0) return res.json({ analysis: 'No data to analyze.', parsed: null, chunks: 0 });

        const rows = items.map(i => i.toJSON());
        const chunks = [];
        for (let i = 0; i < rows.length; i += CHUNK_SIZE) chunks.push(rows.slice(i, i + CHUNK_SIZE));

        const partials = [];
        for (const chunk of chunks) {
          const r = await aiFunction(chunk);
          partials.push(r);
        }

        let finalRaw;
        let finalParsed;
        if (partials.length === 1) {
          finalRaw = partials[0];
          finalParsed = parseAIJson(finalRaw);
        } else {
          // Reduce step — summarise partials
          const reducerSystem = `You are a senior franchise analyst summarising multiple chunked analyses. Aggregate the JSON-like inputs into a single cohesive structured summary. Return ONLY valid JSON.`;
          const ai = require('../services/openRouterService');
          finalRaw = await ai.callAI(reducerSystem, JSON.stringify({ partials }));
          finalParsed = parseAIJson(finalRaw);
        }

        await persistAIResult(entityType, null, 'analyze-all', finalRaw, finalParsed,
          process.env.OPENROUTER_MODEL || 'anthropic/claude-3-5-sonnet-20241022', req.user?.id);

        res.json({ analysis: finalRaw, parsed: finalParsed, chunks: chunks.length, rows_analyzed: rows.length });
      } catch (err) { res.status(500).json({ error: err.message }); }
    });

    router.post('/:id/ai-analyze', auth, aiRateLimiter, async (req, res) => {
      try {
        const item = await Model.findByPk(req.params.id);
        if (!item) return res.status(404).json({ error: 'Not found' });
        const rawResult = await aiFunction(item.toJSON());
        const parsed = parseAIJson(rawResult);
        await persistAIResult(entityType, parseInt(req.params.id, 10), 'analyze', rawResult, parsed,
          process.env.OPENROUTER_MODEL || 'anthropic/claude-3-5-sonnet-20241022', req.user?.id);
        res.json({ analysis: rawResult, parsed });
      } catch (err) { res.status(500).json({ error: err.message }); }
    });
  }

  // ── GET by ID ──
  router.get('/:id', auth, async (req, res) => {
    try {
      const item = await Model.findByPk(req.params.id);
      if (!item) return res.status(404).json({ error: 'Not found' });
      res.json(item);
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  // ── CREATE ──
  router.post('/', auth, async (req, res) => {
    try {
      if (requiredFields.length > 0) {
        const missing = requiredFields.filter(
          (f) => req.body[f] === undefined || req.body[f] === null || req.body[f] === ''
        );
        if (missing.length > 0) return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });
      }
      const bodyKeys = Object.keys(req.body || {}).filter(
        (k) => req.body[k] !== undefined && req.body[k] !== null && req.body[k] !== ''
      );
      if (bodyKeys.length === 0) return res.status(400).json({ error: 'Request body must contain at least one field.' });
      const item = await Model.create(req.body);
      res.status(201).json(item);
    } catch (err) { res.status(400).json({ error: err.message }); }
  });

  router.put('/:id', auth, async (req, res) => {
    try {
      const item = await Model.findByPk(req.params.id);
      if (!item) return res.status(404).json({ error: 'Not found' });
      await item.update(req.body);
      res.json(item);
    } catch (err) { res.status(400).json({ error: err.message }); }
  });

  router.delete('/:id', auth, async (req, res) => {
    try {
      const item = await Model.findByPk(req.params.id);
      if (!item) return res.status(404).json({ error: 'Not found' });
      await item.destroy();
      res.json({ message: 'Deleted successfully' });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  return router;
}

module.exports = createCrudRouter;
module.exports.persistAIResult = persistAIResult;
module.exports.parseAIJson = parseAIJson;
