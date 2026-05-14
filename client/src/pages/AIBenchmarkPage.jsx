import { useState } from 'react';
import api from '../services/api';

/**
 * Frontend for the AI endpoints in server/index.js:
 *   POST /api/ai/unit-rank                — composite/revenue/margin/rating ranking
 *   POST /api/ai/predictive-closure       — closure-risk per unit
 *   POST /api/ai/best-practice-extraction — codify what top units do well (apply pass 4)
 *   POST /api/ai/labor-cost-optimizer     — staff cost reduction recommender (apply pass 4)
 *
 * Mirrors AICenter.jsx style — uses sidebar-item / quick-actions feel and
 * the existing axios client.
 */

const RANK_METRICS = [
  { id: 'composite', label: 'Composite (revenue + margin + rating)' },
  { id: 'revenue', label: 'Revenue' },
  { id: 'margin', label: 'Margin' },
  { id: 'rating', label: 'Customer rating' },
];

function StatPill({ label, value }) {
  return (
    <div style={{
      padding: '6px 12px',
      borderRadius: '999px',
      background: 'rgba(99,102,241,0.1)',
      color: '#4f46e5',
      fontSize: '12px',
      fontWeight: 600,
      whiteSpace: 'nowrap',
    }}>
      <span style={{ marginRight: 6, opacity: 0.7 }}>{label}</span>{value}
    </div>
  );
}

function ResultBlock({ result, error }) {
  if (error) {
    return (
      <div style={{
        marginTop: 16, padding: 16, borderRadius: 8,
        background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c',
      }}>
        <strong>Error:</strong> {error}
      </div>
    );
  }
  if (!result) return null;

  const items = result.units || result.ranked || result.predictions || result.results;
  return (
    <div style={{ marginTop: 16 }}>
      {Array.isArray(items) && items.length > 0 ? (
        <div style={{ display: 'grid', gap: 12 }}>
          {items.map((u, i) => (
            <div key={i} style={{ padding: 14, border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <strong>{u.name || u.unit_name || `Unit #${u.unit_id ?? u.id ?? i + 1}`}</strong>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {u.rank != null && <StatPill label="Rank" value={`#${u.rank}`} />}
                  {u.score != null && <StatPill label="Score" value={u.score} />}
                  {u.closure_risk != null && <StatPill label="Risk" value={`${u.closure_risk}`} />}
                  {u.risk_score != null && <StatPill label="Risk" value={`${u.risk_score}/100`} />}
                </div>
              </div>
              {u.rationale && <div style={{ fontSize: 13, color: '#4b5563', marginTop: 4 }}>{u.rationale}</div>}
              {u.recommended_actions && Array.isArray(u.recommended_actions) && (
                <ul style={{ marginTop: 6, paddingLeft: 18 }}>
                  {u.recommended_actions.map((a, j) => <li key={j} style={{ fontSize: 13 }}>{a}</li>)}
                </ul>
              )}
            </div>
          ))}
        </div>
      ) : null}

      <details style={{ marginTop: 12 }}>
        <summary style={{ cursor: 'pointer', fontSize: 12, color: '#6b7280' }}>Raw response</summary>
        <pre style={{ background: '#0f172a', color: '#e2e8f0', padding: 12, borderRadius: 6, overflow: 'auto', fontSize: 12 }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      </details>
    </div>
  );
}

export default function AIBenchmarkPage() {
  const [tab, setTab] = useState('unit-rank');
  const [metric, setMetric] = useState('composite');
  const [horizonMonths, setHorizonMonths] = useState(6);
  const [topN, setTopN] = useState(20);
  const [notes, setNotes] = useState('');
  const [bpTopN, setBpTopN] = useState(5);
  const [laborUnitId, setLaborUnitId] = useState('');
  const [laborTargetPct, setLaborTargetPct] = useState(10);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const run = async (path, body) => {
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await api.post(path, body);
      setResult(res.data);
    } catch (e) {
      const status = e.response?.status;
      const msg = e.response?.data?.error || e.message;
      if (status === 503) {
        setError(`AI service unavailable (503): ${msg}`);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px 28px', maxWidth: 980 }}>
      <h1 style={{ marginTop: 0 }}>AI Benchmarking</h1>
      <p style={{ color: '#6b7280', marginBottom: 16 }}>
        Rank units by composite, revenue, margin, or rating; or run a predictive closure-risk scan.
      </p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button
          className={tab === 'unit-rank' ? 'btn btn-primary' : 'btn btn-secondary'}
          style={{ padding: '8px 14px', borderRadius: 6, border: 'none', cursor: 'pointer',
            background: tab === 'unit-rank' ? '#6366f1' : '#e5e7eb',
            color: tab === 'unit-rank' ? '#fff' : '#374151' }}
          onClick={() => { setTab('unit-rank'); setResult(null); setError(''); }}
        >Unit Rank</button>
        <button
          className={tab === 'predictive-closure' ? 'btn btn-primary' : 'btn btn-secondary'}
          style={{ padding: '8px 14px', borderRadius: 6, border: 'none', cursor: 'pointer',
            background: tab === 'predictive-closure' ? '#6366f1' : '#e5e7eb',
            color: tab === 'predictive-closure' ? '#fff' : '#374151' }}
          onClick={() => { setTab('predictive-closure'); setResult(null); setError(''); }}
        >Predictive Closure</button>
        <button
          className={tab === 'best-practice' ? 'btn btn-primary' : 'btn btn-secondary'}
          style={{ padding: '8px 14px', borderRadius: 6, border: 'none', cursor: 'pointer',
            background: tab === 'best-practice' ? '#6366f1' : '#e5e7eb',
            color: tab === 'best-practice' ? '#fff' : '#374151' }}
          onClick={() => { setTab('best-practice'); setResult(null); setError(''); }}
        >Best Practices</button>
        <button
          className={tab === 'labor-cost' ? 'btn btn-primary' : 'btn btn-secondary'}
          style={{ padding: '8px 14px', borderRadius: 6, border: 'none', cursor: 'pointer',
            background: tab === 'labor-cost' ? '#6366f1' : '#e5e7eb',
            color: tab === 'labor-cost' ? '#fff' : '#374151' }}
          onClick={() => { setTab('labor-cost'); setResult(null); setError(''); }}
        >Labor Cost Optimizer</button>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: 20 }}>
        {tab === 'unit-rank' && (
          <>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
              <div style={{ flex: 1, minWidth: 220 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, color: '#374151' }}>Metric</label>
                <select
                  value={metric}
                  onChange={(e) => setMetric(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6 }}
                >
                  {RANK_METRICS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
                </select>
              </div>
              <div style={{ minWidth: 120 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, color: '#374151' }}>Top N</label>
                <input
                  type="number"
                  min="1"
                  value={topN}
                  onChange={(e) => setTopN(Number(e.target.value) || 0)}
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6 }}
                />
              </div>
            </div>
            <button
              disabled={loading}
              onClick={() => run('/ai/unit-rank', { metric, top_n: topN })}
              style={{
                padding: '10px 18px', background: '#6366f1', color: '#fff', border: 'none',
                borderRadius: 6, cursor: loading ? 'wait' : 'pointer', fontWeight: 600,
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? 'Ranking...' : 'Run Unit Rank'}
            </button>
          </>
        )}

        {tab === 'predictive-closure' && (
          <>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
              <div style={{ minWidth: 160 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, color: '#374151' }}>Horizon (months)</label>
                <input
                  type="number"
                  min="1"
                  value={horizonMonths}
                  onChange={(e) => setHorizonMonths(Number(e.target.value) || 0)}
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6 }}
                />
              </div>
              <div style={{ flex: 1, minWidth: 240 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, color: '#374151' }}>Notes (optional)</label>
                <input
                  type="text"
                  value={notes}
                  placeholder="Macroeconomic context, regional issues..."
                  onChange={(e) => setNotes(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6 }}
                />
              </div>
            </div>
            <button
              disabled={loading}
              onClick={() => run('/ai/predictive-closure', { horizon_months: horizonMonths, notes })}
              style={{
                padding: '10px 18px', background: '#6366f1', color: '#fff', border: 'none',
                borderRadius: 6, cursor: loading ? 'wait' : 'pointer', fontWeight: 600,
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? 'Predicting...' : 'Predict Closure Risk'}
            </button>
          </>
        )}

        {tab === 'best-practice' && (
          <>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
              <div style={{ minWidth: 160 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, color: '#374151' }}>Top N units</label>
                <input
                  type="number"
                  min="3"
                  max="20"
                  value={bpTopN}
                  onChange={(e) => setBpTopN(Number(e.target.value) || 0)}
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6 }}
                />
              </div>
            </div>
            <button
              disabled={loading}
              onClick={() => run('/ai/best-practice-extraction', { top_n: bpTopN })}
              style={{
                padding: '10px 18px', background: '#6366f1', color: '#fff', border: 'none',
                borderRadius: 6, cursor: loading ? 'wait' : 'pointer', fontWeight: 600,
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? 'Extracting...' : 'Extract Best Practices'}
            </button>
          </>
        )}

        {tab === 'labor-cost' && (
          <>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
              <div style={{ minWidth: 160 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, color: '#374151' }}>Unit ID (optional)</label>
                <input
                  type="number"
                  value={laborUnitId}
                  placeholder="leave blank for all"
                  onChange={(e) => setLaborUnitId(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6 }}
                />
              </div>
              <div style={{ minWidth: 200 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, color: '#374151' }}>Target reduction %</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={laborTargetPct}
                  onChange={(e) => setLaborTargetPct(Number(e.target.value) || 0)}
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6 }}
                />
              </div>
            </div>
            <button
              disabled={loading}
              onClick={() => run('/ai/labor-cost-optimizer', {
                ...(laborUnitId ? { unit_id: Number(laborUnitId) } : {}),
                target_reduction_pct: laborTargetPct
              })}
              style={{
                padding: '10px 18px', background: '#6366f1', color: '#fff', border: 'none',
                borderRadius: 6, cursor: loading ? 'wait' : 'pointer', fontWeight: 600,
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? 'Optimizing...' : 'Optimize Labor Cost'}
            </button>
          </>
        )}

        <ResultBlock result={result} error={error} />
      </div>
    </div>
  );
}
