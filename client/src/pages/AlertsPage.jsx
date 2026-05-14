import { useEffect, useState } from 'react';
import { getAll, runAlertScan, runAnomalyScan, runBenchmarkRecompute } from '../services/api';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [scanLoading, setScanLoading] = useState(false);
  const [anomalyLoading, setAnomalyLoading] = useState(false);
  const [benchLoading, setBenchLoading] = useState(false);
  const [lastScanResult, setLastScanResult] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const r = await getAll('alert-records');
      const payload = r.data;
      setAlerts(payload.data || []);
      setTotalPages(payload.pagination?.totalPages || 1);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [page]);

  const triggerAlertScan = async () => {
    setScanLoading(true);
    try { const r = await runAlertScan(60); setLastScanResult(r.data); await load(); }
    catch (e) { setLastScanResult({ error: e.response?.data?.error || e.message }); }
    setScanLoading(false);
  };
  const triggerAnomalyScan = async () => {
    setAnomalyLoading(true);
    try { const r = await runAnomalyScan(20); setLastScanResult(r.data); await load(); }
    catch (e) { setLastScanResult({ error: e.response?.data?.error || e.message }); }
    setAnomalyLoading(false);
  };
  const triggerBenchmarkRecompute = async () => {
    setBenchLoading(true);
    try { const r = await runBenchmarkRecompute(); setLastScanResult(r.data); }
    catch (e) { setLastScanResult({ error: e.response?.data?.error || e.message }); }
    setBenchLoading(false);
  };

  const sevColor = (s) => ({ critical: '#dc2626', high: '#f97316', medium: '#eab308', low: '#16a34a' }[s] || '#94a3b8');

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ marginBottom: 16 }}>Alerts</h1>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <button onClick={triggerAlertScan} disabled={scanLoading} className="btn-primary">
          {scanLoading ? 'Scanning...' : 'Run Cross-Entity Alert Scan'}
        </button>
        <button onClick={triggerAnomalyScan} disabled={anomalyLoading} className="btn-primary">
          {anomalyLoading ? 'Scanning...' : 'Run Anomaly Auto-Flagger (Revenue)'}
        </button>
        <button onClick={triggerBenchmarkRecompute} disabled={benchLoading} className="btn-primary">
          {benchLoading ? 'Recomputing...' : 'Recompute Benchmarks'}
        </button>
      </div>

      {lastScanResult && (
        <div style={{ background: '#0f172a', color: '#e2e8f0', padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 12, overflow: 'auto', maxHeight: 240 }}>
          <pre>{JSON.stringify(lastScanResult, null, 2)}</pre>
        </div>
      )}

      {loading ? <div>Loading...</div> : (
        <>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f1f5f9' }}>
                <th style={{ padding: 8, textAlign: 'left' }}>Type</th>
                <th style={{ padding: 8, textAlign: 'left' }}>Severity</th>
                <th style={{ padding: 8, textAlign: 'left' }}>Unit</th>
                <th style={{ padding: 8, textAlign: 'left' }}>Metric</th>
                <th style={{ padding: 8, textAlign: 'left' }}>Δ %</th>
                <th style={{ padding: 8, textAlign: 'left' }}>Status</th>
                <th style={{ padding: 8, textAlign: 'left' }}>Explanation</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map(a => (
                <tr key={a.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: 8 }}>{a.alert_type}</td>
                  <td style={{ padding: 8 }}>
                    <span style={{ padding: '2px 8px', borderRadius: 999, background: sevColor(a.severity), color: '#fff', fontSize: 12 }}>{a.severity}</span>
                  </td>
                  <td style={{ padding: 8 }}>{a.unit_id || '-'}</td>
                  <td style={{ padding: 8 }}>{a.metric || '-'}</td>
                  <td style={{ padding: 8 }}>{a.delta_pct != null ? `${Number(a.delta_pct).toFixed(1)}%` : '-'}</td>
                  <td style={{ padding: 8 }}>{a.status}</td>
                  <td style={{ padding: 8, fontSize: 13 }}>{(a.ai_explanation || '').slice(0, 120)}</td>
                </tr>
              ))}
              {alerts.length === 0 && <tr><td colSpan={7} style={{ padding: 16, textAlign: 'center', color: '#64748b' }}>No alerts.</td></tr>}
            </tbody>
          </table>
          {totalPages > 1 && (
            <div style={{ marginTop: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
              <button onClick={() => setPage(p => p - 1)} disabled={page <= 1}>Prev</button>
              <span>Page {page} of {totalPages}</span>
              <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages}>Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
