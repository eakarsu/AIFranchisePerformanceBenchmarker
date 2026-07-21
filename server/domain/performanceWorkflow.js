const STATUSES = Object.freeze(['draft', 'review', 'approved', 'in_progress', 'verified', 'closed']);
const TRANSITIONS = Object.freeze({
  draft: ['review'], review: ['draft', 'approved'], approved: ['in_progress'],
  in_progress: ['verified'], verified: ['closed'], closed: []
});

function required(value, field) {
  if (value === undefined || value === null || String(value).trim() === '') throw new Error(`${field} is required`);
  return String(value).trim();
}

function normalizeMetric(input) {
  const value = Number(input.value);
  if (!Number.isFinite(value)) throw new Error('value must be finite');
  const periodStart = new Date(required(input.period_start, 'period_start'));
  const periodEnd = new Date(required(input.period_end, 'period_end'));
  if (Number.isNaN(periodStart.valueOf()) || Number.isNaN(periodEnd.valueOf()) || periodEnd < periodStart) {
    throw new Error('metric period is invalid');
  }
  return {
    unit_id: required(input.unit_id, 'unit_id'), metric_key: required(input.metric_key, 'metric_key').toLowerCase(),
    value, unit: required(input.unit, 'unit'), period_start: periodStart.toISOString(), period_end: periodEnd.toISOString(),
    source_system: required(input.source_system, 'source_system'), source_record_id: required(input.source_record_id, 'source_record_id')
  };
}

function authorizeTransition(from, to, role, hasEvidence) {
  if (!STATUSES.includes(from) || !STATUSES.includes(to) || !TRANSITIONS[from].includes(to)) throw new Error('invalid status transition');
  if (['approved', 'verified', 'closed'].includes(to) && !['admin', 'operator', 'franchisor'].includes(role)) throw new Error('pricing authority required');
  if (['verified', 'closed'].includes(to) && !hasEvidence) throw new Error('verification evidence required');
  return true;
}

module.exports = { STATUSES, normalizeMetric, authorizeTransition };
