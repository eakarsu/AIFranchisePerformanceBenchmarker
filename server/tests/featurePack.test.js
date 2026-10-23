'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { filterUnits, toCsv, renderAiSections, buildFallback, hasAiKey } = require('../domain/featurePack');
const rows = [
  { id: 1, name: 'Alpha Burgers', location: 'Austin', region: 'South', owner: 'Ada', status: 'active', monthlyRevenue: 0, employeeCount: 5, customerRating: 4.5, performanceScore: 40 },
  { id: 2, name: 'Beta Burgers', location: 'Denver', region: 'West', owner: 'Ben', status: 'inactive', monthlyRevenue: 9000, employeeCount: 8, customerRating: 3.5, performanceScore: 80 },
];
test('search/filter narrows units by text, status and region', () => {
  assert.equal(filterUnits(rows, { search: 'alpha' }).length, 1);
  assert.equal(filterUnits(rows, { status: 'inactive' })[0].name, 'Beta Burgers');
  assert.equal(filterUnits(rows, { region: 'missing' }).length, 0);
});
test('CSV export preserves 0 and escapes commas', () => {
  assert.match(toCsv(rows), /Alpha Burgers,Austin,South,Ada,active,0/);
  assert.equal(toCsv([{ id: 1, name: 'A,B', location: 'x' }]).split('\n')[1], '1,"A,B",x,,,,,,,');
});
test('fallback AI is labelled aiGenerated:false and preserves false/0', () => {
  const r = buildFallback('underperformer-review', rows);
  assert.equal(r.source, 'fallback'); assert.equal(r.aiGenerated, false); assert.equal(r.underperformer_count, 1);
  assert.deepEqual(renderAiSections({ ok: false, count: 0, note: '' }).map((s) => s.value), ['false', '0', '']);
  assert.equal(hasAiKey({}), false); assert.equal(hasAiKey({ OPENAI_API_KEY: 'x' }), true);
});
