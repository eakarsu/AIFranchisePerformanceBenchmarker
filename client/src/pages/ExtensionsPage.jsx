// Apply pass 5 — frontend surface for AIFranchisePerformanceBenchmarker backlog.
// Tabs: POS, SOP-RAG, P&L roll-up, Messages, Compliance audit, Mentorship,
// Supplier negotiation. Uses the existing axios `api` instance.

import { useState, useEffect } from 'react';
import {
  extPosStatus, extPosSync,
  extSopList, extSopUpload, extSopQuery, extSopDelete,
  extPnlRollup,
  extMessageSend, extMessageList,
  extComplianceAudit,
  extMentorshipMatch,
  extSupplierNegotiate,
} from '../services/api';

const TABS = [
  { id: 'pos', label: 'POS' },
  { id: 'sop', label: 'SOP RAG' },
  { id: 'pnl', label: 'P&L Roll-up' },
  { id: 'msg', label: 'Messages' },
  { id: 'audit', label: 'Compliance Audit' },
  { id: 'mentor', label: 'Mentorship' },
  { id: 'supplier', label: 'Supplier' },
];

function Err({ value }) { return value ? <div style={{ color: 'crimson', marginTop: 8 }}>{value}</div> : null; }
function J({ value }) { return <pre style={{ background: '#f4f4f5', padding: 8, fontSize: 12, overflow: 'auto', maxHeight: 360 }}>{JSON.stringify(value, null, 2)}</pre>; }

export default function ExtensionsPage() {
  const [tab, setTab] = useState('pos');
  return (
    <div style={{ padding: 24 }}>
      <h2>Extensions (apply pass 5 backlog)</h2>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', margin: '12px 0' }}>
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ padding: '6px 12px', background: tab === t.id ? '#4f46e5' : '#e5e7eb', color: tab === t.id ? '#fff' : '#111', border: 0, borderRadius: 6, cursor: 'pointer' }}>
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'pos' && <PosTab />}
      {tab === 'sop' && <SopTab />}
      {tab === 'pnl' && <PnlTab />}
      {tab === 'msg' && <MsgTab />}
      {tab === 'audit' && <AuditTab />}
      {tab === 'mentor' && <MentorTab />}
      {tab === 'supplier' && <SupplierTab />}
    </div>
  );
}

function PosTab() {
  const [status, setStatus] = useState(null);
  const [unitId, setUnitId] = useState('');
  const [out, setOut] = useState(null);
  const [err, setErr] = useState('');
  useEffect(() => { extPosStatus().then((r) => setStatus(r.data)).catch(() => {}); }, []);
  const sync = async () => {
    setErr(''); setOut(null);
    try { const r = await extPosSync(parseInt(unitId) || null); setOut(r.data); }
    catch (e) { setErr((e.response?.data?.missing ? `Missing env: ${e.response.data.missing}` : e.response?.data?.error) || e.message); }
  };
  return (
    <div>
      <div>Configured: {status ? String(status.configured) : '…'} {status?.missing?.length > 0 && <span>(missing: {status.missing.join(', ')})</span>}</div>
      <input placeholder="unit_id" value={unitId} onChange={(e) => setUnitId(e.target.value)} style={{ marginTop: 8 }} />
      <button onClick={sync} style={{ marginLeft: 8 }}>Sync</button>
      <Err value={err} />
      {out && <J value={out} />}
    </div>
  );
}

function SopTab() {
  const [list, setList] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [q, setQ] = useState('');
  const [matches, setMatches] = useState(null);
  const [err, setErr] = useState('');
  const refresh = () => extSopList().then((r) => setList(r.data?.data || []));
  useEffect(() => { refresh().catch(() => {}); }, []);
  const upload = async () => { setErr(''); try { await extSopUpload({ title, content }); setTitle(''); setContent(''); refresh(); } catch (e) { setErr(e.response?.data?.error || e.message); } };
  const query = async () => { setErr(''); setMatches(null); try { const r = await extSopQuery(q, 3); setMatches(r.data); } catch (e) { setErr(e.response?.data?.error || e.message); } };
  return (
    <div>
      <h3>Upload SOP</h3>
      <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
      <textarea placeholder="Content" value={content} onChange={(e) => setContent(e.target.value)} rows={4} style={{ width: '100%' }} />
      <button onClick={upload}>Upload</button>
      <h3>SOPs ({list.length})</h3>
      <ul>{list.map((d) => <li key={d.id}>{d.title || d.category}</li>)}</ul>
      <h3>Query</h3>
      <input placeholder="Question" value={q} onChange={(e) => setQ(e.target.value)} style={{ width: '60%' }} />
      <button onClick={query}>Search</button>
      <Err value={err} />
      {matches && <J value={matches} />}
    </div>
  );
}

function PnlTab() {
  const [groupBy, setGroupBy] = useState('region');
  const [region, setRegion] = useState('');
  const [out, setOut] = useState(null);
  const [err, setErr] = useState('');
  const run = async () => { setErr(''); try { const r = await extPnlRollup({ group_by: groupBy, region: region || undefined }); setOut(r.data); } catch (e) { setErr(e.response?.data?.error || e.message); } };
  return (
    <div>
      <select value={groupBy} onChange={(e) => setGroupBy(e.target.value)}>
        <option value="region">By region</option>
        <option value="owner">By owner</option>
      </select>
      <input placeholder="Filter region (optional)" value={region} onChange={(e) => setRegion(e.target.value)} style={{ marginLeft: 8 }} />
      <button onClick={run} style={{ marginLeft: 8 }}>Roll up</button>
      <Err value={err} />
      {out && <J value={out} />}
    </div>
  );
}

function MsgTab() {
  const [list, setList] = useState([]);
  const [from, setFrom] = useState(''); const [to, setTo] = useState('');
  const [subject, setSubject] = useState(''); const [body, setBody] = useState('');
  const [err, setErr] = useState('');
  const refresh = () => extMessageList().then((r) => setList(r.data?.data || []));
  useEffect(() => { refresh().catch(() => {}); }, []);
  const send = async () => { setErr(''); try { await extMessageSend({ from_unit_id: parseInt(from), to_unit_id: parseInt(to), subject, body }); setSubject(''); setBody(''); refresh(); } catch (e) { setErr(e.response?.data?.error || e.message); } };
  return (
    <div>
      <input placeholder="from unit id" value={from} onChange={(e) => setFrom(e.target.value)} />
      <input placeholder="to unit id" value={to} onChange={(e) => setTo(e.target.value)} />
      <input placeholder="subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
      <textarea placeholder="message" value={body} onChange={(e) => setBody(e.target.value)} rows={3} style={{ width: '100%' }} />
      <button onClick={send}>Send</button>
      <Err value={err} />
      <ul>{list.map((m) => <li key={m.id}>#{m.id} {m.fromUnitId} → {m.toUnitId}: {m.subject || '(no subject)'}</li>)}</ul>
    </div>
  );
}

function AuditTab() {
  const [unitId, setUnitId] = useState(''); const [out, setOut] = useState(null); const [err, setErr] = useState('');
  const run = async () => { setErr(''); try { const r = await extComplianceAudit(unitId ? { unit_id: parseInt(unitId) } : {}); setOut(r.data); } catch (e) { setErr((e.response?.data?.missing ? `Missing env: ${e.response.data.missing}` : e.response?.data?.error) || e.message); } };
  return <div><input placeholder="unit_id (optional)" value={unitId} onChange={(e) => setUnitId(e.target.value)} /><button onClick={run}>Audit</button><Err value={err} />{out && <J value={out} />}</div>;
}

function MentorTab() {
  const [unitId, setUnitId] = useState(''); const [out, setOut] = useState(null); const [err, setErr] = useState('');
  const run = async () => { setErr(''); try { const r = await extMentorshipMatch(parseInt(unitId)); setOut(r.data); } catch (e) { setErr(e.response?.data?.error || e.message); } };
  return <div><input placeholder="unit_id" value={unitId} onChange={(e) => setUnitId(e.target.value)} /><button onClick={run}>Match</button><Err value={err} />{out && <J value={out} />}</div>;
}

function SupplierTab() {
  const [target, setTarget] = useState('8'); const [supplier, setSupplier] = useState(''); const [out, setOut] = useState(null); const [err, setErr] = useState('');
  const run = async () => { setErr(''); try { const r = await extSupplierNegotiate({ target_savings_pct: parseFloat(target), supplier: supplier || undefined }); setOut(r.data); } catch (e) { setErr((e.response?.data?.missing ? `Missing env: ${e.response.data.missing}` : e.response?.data?.error) || e.message); } };
  return <div>
    <input placeholder="target savings %" value={target} onChange={(e) => setTarget(e.target.value)} />
    <input placeholder="supplier (optional)" value={supplier} onChange={(e) => setSupplier(e.target.value)} />
    <button onClick={run}>Draft script</button>
    <Err value={err} />
    {out && <J value={out} />}
  </div>;
}
