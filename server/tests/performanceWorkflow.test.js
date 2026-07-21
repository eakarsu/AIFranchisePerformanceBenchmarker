const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizeMetric, authorizeTransition } = require('../domain/performanceWorkflow');

test('normalizes a sourced metric with a valid period', () => {
  const metric = normalizeMetric({ unit_id: 'U-1', metric_key: ' Revenue ', value: '42.5', unit: 'USD', period_start: '2026-01-01', period_end: '2026-01-31', source_system: 'pos', source_record_id: 'r-1' });
  assert.equal(metric.metric_key, 'revenue'); assert.equal(metric.value, 42.5);
});
test('rejects malformed metric periods', () => assert.throws(() => normalizeMetric({ unit_id: 1, metric_key: 'x', value: 1, unit: 'n', period_start: '2026-02-01', period_end: '2026-01-01', source_system: 'pos', source_record_id: '1' }), /period/));
test('requires authority and evidence for verification', () => {
  assert.throws(() => authorizeTransition('in_progress', 'verified', 'franchisee', true), /authority/);
  assert.throws(() => authorizeTransition('in_progress', 'verified', 'operator', false), /evidence/);
  assert.equal(authorizeTransition('in_progress', 'verified', 'operator', true), true);
});
