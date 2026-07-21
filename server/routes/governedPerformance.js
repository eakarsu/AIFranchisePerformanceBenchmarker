const express = require('express');
const crypto = require('crypto');
const { QueryTypes } = require('sequelize');
const { normalizeMetric, authorizeTransition } = require('../domain/performanceWorkflow');

module.exports = function governedPerformanceRouter(sequelize) {
  const router = express.Router();
  const tenant = (req) => String(req.user.organization_id || req.user.tenant_id || `personal-${req.user.id}`);
  const audit = (tx, req, action, type, id, before, after) => sequelize.query(
    `INSERT INTO franchise_audit_events(tenant_id,actor_user_id,action,entity_type,entity_id,before_state,after_state,request_id)
     VALUES(:tenant,:actor,:action,:type,:id,:before::jsonb,:after::jsonb,:request)`,
    { transaction: tx, replacements: { tenant: tenant(req), actor: req.user.id, action, type, id: String(id), before: JSON.stringify(before || null), after: JSON.stringify(after || null), request: req.get('x-request-id') || crypto.randomUUID() } }
  );

  router.get('/cycles', async (req, res, next) => {
    try {
      const rows = await sequelize.query('SELECT * FROM performance_cycles WHERE tenant_id=:tenant ORDER BY created_at DESC', { replacements: { tenant: tenant(req) }, type: QueryTypes.SELECT });
      res.json(rows);
    } catch (error) { next(error); }
  });

  router.post('/cycles', async (req, res, next) => {
    try {
      if (!req.body.name?.trim()) return res.status(400).json({ error: 'name is required' });
      const [rows] = await sequelize.query(
        `INSERT INTO performance_cycles(tenant_id,name,peer_group_definition,created_by) VALUES(:tenant,:name,:peers::jsonb,:actor) RETURNING *`,
        { replacements: { tenant: tenant(req), name: req.body.name.trim(), peers: JSON.stringify(req.body.peer_group_definition || {}), actor: req.user.id } }
      );
      res.status(201).json(rows[0]);
    } catch (error) { next(error); }
  });

  router.post('/cycles/:cycleId/metrics', async (req, res, next) => {
    const tx = await sequelize.transaction();
    try {
      const metric = normalizeMetric(req.body);
      const key = req.get('idempotency-key');
      if (!key) throw new Error('Idempotency-Key header is required');
      const [cycle] = await sequelize.query('SELECT id FROM performance_cycles WHERE id=:id AND tenant_id=:tenant FOR UPDATE', { transaction: tx, replacements: { id: req.params.cycleId, tenant: tenant(req) }, type: QueryTypes.SELECT });
      if (!cycle) { await tx.rollback(); return res.status(404).json({ error: 'cycle not found' }); }
      const [rows] = await sequelize.query(
        `INSERT INTO normalized_performance_metrics(tenant_id,cycle_id,unit_id,metric_key,value,unit,period_start,period_end,source_system,source_record_id,idempotency_key,ingested_by)
         VALUES(:tenant,:cycle,:unitId,:metricKey,:value,:unit,:start,:end,:source,:record,:key,:actor)
         ON CONFLICT(tenant_id,idempotency_key) DO UPDATE SET idempotency_key=EXCLUDED.idempotency_key RETURNING *`,
        { transaction: tx, replacements: { tenant: tenant(req), cycle: cycle.id, unitId: metric.unit_id, metricKey: metric.metric_key, value: metric.value, unit: metric.unit, start: metric.period_start, end: metric.period_end, source: metric.source_system, record: metric.source_record_id, key, actor: req.user.id } }
      );
      await audit(tx, req, 'metric.ingested', 'performance_metric', rows[0].id, null, rows[0]);
      await tx.commit(); res.status(201).json(rows[0]);
    } catch (error) { await tx.rollback(); res.status(400).json({ error: error.message }); }
  });

  router.get('/cycles/:cycleId/benchmark', async (req, res, next) => {
    try {
      const rows = await sequelize.query(
        `SELECT metric_key,unit,COUNT(DISTINCT unit_id)::int AS unit_count,AVG(value)::float AS peer_average,MIN(value)::float AS peer_min,MAX(value)::float AS peer_max
         FROM normalized_performance_metrics WHERE tenant_id=:tenant AND cycle_id=:cycle GROUP BY metric_key,unit ORDER BY metric_key`,
        { replacements: { tenant: tenant(req), cycle: req.params.cycleId }, type: QueryTypes.SELECT }
      );
      res.json({ cycle_id: req.params.cycleId, governed: true, comparisons: rows });
    } catch (error) { next(error); }
  });

  router.post('/actions', async (req, res, next) => {
    try {
      for (const field of ['cycle_id','unit_id','title','assumption_notes','owner_user_id','due_at']) if (!req.body[field]) return res.status(400).json({ error: `${field} is required` });
      const [rows] = await sequelize.query(
        `INSERT INTO franchise_action_plans(tenant_id,cycle_id,unit_id,title,assumption_notes,owner_user_id,due_at,created_by)
         SELECT :tenant,id,:unit,:title,:notes,:owner,:due,:actor FROM performance_cycles WHERE id=:cycle AND tenant_id=:tenant RETURNING *`,
        { replacements: { tenant: tenant(req), cycle: req.body.cycle_id, unit: req.body.unit_id, title: req.body.title, notes: req.body.assumption_notes, owner: req.body.owner_user_id, due: req.body.due_at, actor: req.user.id } }
      );
      if (!rows[0]) return res.status(404).json({ error: 'cycle not found' });
      res.status(201).json(rows[0]);
    } catch (error) { next(error); }
  });

  router.post('/actions/:id/transition', async (req, res) => {
    const tx = await sequelize.transaction();
    try {
      const [action] = await sequelize.query('SELECT * FROM franchise_action_plans WHERE id=:id AND tenant_id=:tenant FOR UPDATE', { transaction: tx, replacements: { id: req.params.id, tenant: tenant(req) }, type: QueryTypes.SELECT });
      if (!action) { await tx.rollback(); return res.status(404).json({ error: 'action not found' }); }
      authorizeTransition(action.status, req.body.status, req.user.role, Array.isArray(req.body.evidence) && req.body.evidence.length > 0);
      const [rows] = await sequelize.query(
        `UPDATE franchise_action_plans SET status=:status,evidence=:evidence::jsonb,version=version+1,approved_by=CASE WHEN :status='approved' THEN :actor ELSE approved_by END,approved_at=CASE WHEN :status='approved' THEN NOW() ELSE approved_at END,updated_at=NOW()
         WHERE id=:id AND tenant_id=:tenant AND version=:version RETURNING *`,
        { transaction: tx, replacements: { status: req.body.status, evidence: JSON.stringify(req.body.evidence || action.evidence), actor: req.user.id, id: action.id, tenant: tenant(req), version: Number(req.body.version) } }
      );
      if (!rows[0]) throw new Error('version conflict');
      await audit(tx, req, 'action.transitioned', 'action_plan', action.id, action, rows[0]); await tx.commit(); res.json(rows[0]);
    } catch (error) { await tx.rollback(); res.status(409).json({ error: error.message }); }
  });

  router.post('/integration-runs', async (req, res, next) => {
    try {
      if (!req.body.provider || !['running','succeeded','failed','partial'].includes(req.body.status)) return res.status(400).json({ error: 'valid provider and status required' });
      if (req.body.status === 'failed' && !req.body.error_code) return res.status(400).json({ error: 'error_code required for failure' });
      const [rows] = await sequelize.query(
        `INSERT INTO franchise_integration_runs(tenant_id,provider,cursor_value,status,records_received,error_code,error_message,completed_at)
         VALUES(:tenant,:provider,:cursor,:status,:count,:code,:message,CASE WHEN :status='running' THEN NULL ELSE NOW() END) RETURNING *`,
        { replacements: { tenant: tenant(req), provider: req.body.provider, cursor: req.body.cursor_value || null, status: req.body.status, count: req.body.records_received || 0, code: req.body.error_code || null, message: req.body.error_message || null } }
      ); res.status(201).json(rows[0]);
    } catch (error) { next(error); }
  });
  return router;
};
