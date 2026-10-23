'use strict';
// Feature pack wave 35B — pure helpers (no DB/network), unit-testable.
const UNIT_COLUMNS = ['id', 'name', 'location', 'region', 'owner', 'status', 'monthlyRevenue', 'employeeCount', 'customerRating', 'performanceScore'];
const norm = (v) => String(v ?? '').trim().toLowerCase();
function filterUnits(records, filters = {}) {
  const list = Array.isArray(records) ? records : [];
  const search = norm(filters.search); const status = norm(filters.status); const region = norm(filters.region);
  return list.filter((r) => {
    if (status && norm(r.status) !== status) return false;
    if (region && norm(r.region) !== region) return false;
    if (search && ![r.name, r.location, r.region, r.owner].map(norm).join(' ').includes(search)) return false;
    return true;
  });
}
function esc(v) { if (v === null || v === undefined) return ''; const s = String(v); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; }
function toCsv(records, columns = UNIT_COLUMNS) { const list = Array.isArray(records) ? records : []; return [columns.join(','), ...list.map((r) => columns.map((c) => esc(r[c])).join(','))].join('\n'); }
function toJsonExport(records) { return { exported_at: new Date().toISOString(), count: (records || []).length, data: records || [] }; }
function renderAiSections(result) {
  if (!result || typeof result !== 'object') return [];
  return Object.entries(result).filter(([k]) => k !== 'source' && k !== 'label').map(([key, value]) => {
    let display;
    if (value === null || value === undefined) display = '';
    else if (Array.isArray(value)) display = value.length ? value.map((v) => (typeof v === 'object' ? JSON.stringify(v) : String(v))).join('; ') : '(none)';
    else if (typeof value === 'object') display = JSON.stringify(value);
    else display = String(value);
    return { label: key, value: display };
  });
}
function hasAiKey(env = process.env) { return Boolean(env.OPENROUTER_API_KEY || env.OPENAI_API_KEY); }
function buildFallback(feature, records) {
  const list = Array.isArray(records) ? records : [];
  const base = { source: 'fallback', aiGenerated: false, label: 'Deterministic fallback (no AI provider configured)' };
  if (feature === 'underperformer-review') {
    const low = list.filter((r) => Number(r.performanceScore || 0) < 50);
    return { ...base, feature, total_units: list.length, underperformer_count: low.length, has_underperformers: low.length > 0, items: low.map((r) => `${r.name} score ${r.performanceScore ?? 0}`) };
  }
  if (feature === 'revenue-summary') {
    return { ...base, feature, total_units: list.length, total_monthly_revenue: list.reduce((s, r) => s + Number(r.monthlyRevenue || 0), 0), zero_revenue_count: list.filter((r) => Number(r.monthlyRevenue || 0) === 0).length, has_zero_revenue: list.some((r) => Number(r.monthlyRevenue || 0) === 0) };
  }
  const byRegion = {}; for (const r of list) byRegion[r.region || 'unknown'] = (byRegion[r.region || 'unknown'] || 0) + 1;
  return { ...base, feature: 'benchmark-summary', total_units: list.length, active_count: list.filter((r) => norm(r.status) === 'active').length, average_rating: list.length ? list.reduce((s, r) => s + Number(r.customerRating || 0), 0) / list.length : 0, by_region: byRegion };
}
module.exports = { UNIT_COLUMNS, filterUnits, toCsv, toJsonExport, renderAiSections, hasAiKey, buildFallback, AI_FEATURES: ['benchmark-summary', 'underperformer-review', 'revenue-summary'] };
