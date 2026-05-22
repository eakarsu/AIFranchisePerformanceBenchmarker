import { useState } from 'react';

const sample = JSON.stringify([
  { name: 'Unit 12', reportedSales: 128000, posSales: 134500, royaltyRate: 0.06 },
  { name: 'Unit 18', reportedSales: 92000, posSales: 91800, royaltyRate: 0.06 }
], null, 2);

export default function RoyaltyLeakagePage() {
  const [payload, setPayload] = useState(sample);
  const [result, setResult] = useState(null);

  async function run() {
    const response = await fetch('/api/royalty-leakage/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ units: JSON.parse(payload) }),
    });
    setResult(await response.json());
  }

  return (
    <div className="page">
      <h1>Royalty Leakage Scanner</h1>
      <p>Compare reported sales against POS sales to find under-reported royalty exposure.</p>
      <textarea value={payload} onChange={(event) => setPayload(event.target.value)} rows={12} style={{ width: '100%', fontFamily: 'monospace' }} />
      <button onClick={run}>Scan leakage</button>
      {result && (
        <div className="card">
          <h2>Total leakage ${result.totalLeakage.toLocaleString()}</h2>
          {result.findings.map((row) => (
            <div key={row.name}>
              <strong>{row.name}</strong> | gap ${row.salesGap.toLocaleString()} | leakage ${row.royaltyLeakage.toLocaleString()} | {row.risk}
            </div>
          ))}
          <ul>{result.actions.map((line) => <li key={line}>{line}</li>)}</ul>
        </div>
      )}
    </div>
  );
}
