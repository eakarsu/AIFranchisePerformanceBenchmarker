import { useEffect, useState } from 'react';
import { getAll, create, remove, goalNarrative } from '../services/api';
import ReactMarkdown from 'react-markdown';

export default function GoalsPage() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    objective: '', key_result: '', target_value: '', current_value: '',
    unit_of_measure: '', due_date: '', owner: '', unit_id: ''
  });
  const [narrativeLoadingId, setNarrativeLoadingId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const r = await getAll('goals');
      const payload = r.data;
      setGoals(payload.data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await create('goals', form);
      setShowForm(false);
      setForm({ objective: '', key_result: '', target_value: '', current_value: '', unit_of_measure: '', due_date: '', owner: '', unit_id: '' });
      load();
    } catch (e) { console.error(e); }
  };

  const generateNarrative = async (id) => {
    setNarrativeLoadingId(id);
    try { await goalNarrative(id); await load(); }
    catch (e) { console.error(e); }
    setNarrativeLoadingId(null);
  };

  const del = async (id) => {
    if (!window.confirm('Delete this goal?')) return;
    await remove('goals', id); load();
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1>OKR Goals</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary">New Goal</button>
      </div>

      {showForm && (
        <form onSubmit={submit} style={{ background: '#f8fafc', padding: 16, borderRadius: 8, marginBottom: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <input required placeholder="Objective" value={form.objective} onChange={e => setForm({ ...form, objective: e.target.value })} />
          <input required placeholder="Key Result" value={form.key_result} onChange={e => setForm({ ...form, key_result: e.target.value })} />
          <input type="number" placeholder="Target Value" value={form.target_value} onChange={e => setForm({ ...form, target_value: e.target.value })} />
          <input type="number" placeholder="Current Value" value={form.current_value} onChange={e => setForm({ ...form, current_value: e.target.value })} />
          <input placeholder="Unit of Measure" value={form.unit_of_measure} onChange={e => setForm({ ...form, unit_of_measure: e.target.value })} />
          <input type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} />
          <input placeholder="Owner" value={form.owner} onChange={e => setForm({ ...form, owner: e.target.value })} />
          <input type="number" placeholder="Franchise Unit ID" value={form.unit_id} onChange={e => setForm({ ...form, unit_id: e.target.value })} />
          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 8 }}>
            <button type="submit" className="btn-primary">Save</button>
            <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      {loading ? <div>Loading...</div> : goals.map(g => (
        <div key={g.id} style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: 16, marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3 style={{ margin: 0 }}>{g.objective}</h3>
              <div style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>{g.key_result}</div>
              <div style={{ marginTop: 8, fontSize: 13 }}>
                Progress: {g.current_value || 0}/{g.target_value || '?'} {g.unit_of_measure || ''}
                {g.due_date && <span style={{ marginLeft: 16, color: '#94a3b8' }}>Due: {g.due_date}</span>}
                {g.owner && <span style={{ marginLeft: 16 }}>Owner: {g.owner}</span>}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => generateNarrative(g.id)} disabled={narrativeLoadingId === g.id}>
                {narrativeLoadingId === g.id ? 'Generating...' : 'AI Weekly Narrative'}
              </button>
              <button onClick={() => del(g.id)} style={{ color: '#dc2626' }}>Delete</button>
            </div>
          </div>
          {g.weekly_narrative && (
            <div style={{ marginTop: 12, padding: 12, background: '#f1f5f9', borderRadius: 6 }}>
              <strong>Latest narrative:</strong>
              <ReactMarkdown>{g.weekly_narrative}</ReactMarkdown>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
