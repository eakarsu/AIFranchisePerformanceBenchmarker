import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getById, update, remove } from '../services/api';
import api from '../services/api';

const cardStyle = {
  background: 'white',
  borderRadius: 16,
  border: '1px solid #e2e8f0',
  padding: 24,
  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
};

const inputStyle = {
  width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 8,
  fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box',
};

const statusColors = {
  active: { bg: '#dcfce7', color: '#15803d' },
  inactive: { bg: '#f1f5f9', color: '#64748b' },
  draft: { bg: '#fef3c7', color: '#92400e' },
};

const CHANNEL_OPTIONS = ['Website', 'WhatsApp', 'Facebook', 'Instagram'];

export default function ChatAgentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', personality: '', industry: '', responseTime: '',
    channels: [], welcomeMessage: '', status: 'active',
  });
  const [testInput, setTestInput] = useState('');
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    async function fetch() {
      try {
        const res = await getById('chatAgents', id);
        const data = res.data;
        setAgent(data);
        setForm({
          name: data.name || '',
          personality: data.personality || '',
          industry: data.industry || '',
          responseTime: data.responseTime || '',
          channels: data.channels || [],
          welcomeMessage: data.welcomeMessage || '',
          status: data.status || 'active',
        });
      } catch {
        setError('Chat agent not found.');
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await update('chatAgents', id, form);
      setAgent(res.data);
      setEditing(false);
      setError(null);
    } catch {
      setError('Failed to save agent.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this chat agent?')) return;
    try {
      await remove('chatAgents', id);
      navigate('/chatAgents');
    } catch {
      setError('Failed to delete agent.');
    }
  };

  const toggleChannel = (ch) => {
    setForm((prev) => ({
      ...prev,
      channels: prev.channels.includes(ch)
        ? prev.channels.filter((c) => c !== ch)
        : [...prev.channels, ch],
    }));
  };

  const handleTest = async () => {
    if (!testInput.trim()) return;
    setTesting(true);
    setTestResult(null);
    try {
      const res = await api.post('/ai/chat-response', {
        context: agent.name,
        message: testInput,
        personality: agent.personality,
      });
      setTestResult(res.data?.response || res.data?.result || res.data?.message || JSON.stringify(res.data));
    } catch {
      setTestResult('Failed to get a test response.');
    } finally {
      setTesting(false);
    }
  };

  if (loading) return (
    <div style={{ padding: 24 }}>
      <div style={{ height: 400, background: '#f1f5f9', borderRadius: 16 }} />
    </div>
  );

  if (error && !agent) return (
    <div style={{ padding: 24 }}>
      <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: 16, color: '#dc2626' }}>
        {error}
      </div>
    </div>
  );

  const status = (agent.status || 'active').toLowerCase();
  const stColor = statusColors[status] || { bg: '#f1f5f9', color: '#64748b' };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button onClick={() => navigate('/chatAgents')} style={{
          background: 'none', border: '1px solid #e2e8f0', borderRadius: 8, padding: '6px 12px',
          cursor: 'pointer', fontSize: '0.875rem', color: '#64748b',
        }}>
          ← Back
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              {agent.name || 'Chat Agent'}
            </h1>
            <span style={{
              display: 'inline-block', padding: '2px 10px', borderRadius: 999, fontSize: '0.75rem',
              fontWeight: 500, background: stColor.bg, color: stColor.color,
            }}>
              {status}
            </span>
          </div>
        </div>
        {!editing && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setEditing(true)} style={{
              padding: '8px 16px', borderRadius: 8, border: '1px solid #e2e8f0',
              background: 'white', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500, color: '#334155',
            }}>
              Edit
            </button>
            <button onClick={handleDelete} style={{
              padding: '8px 16px', borderRadius: 8, border: 'none',
              background: '#fee2e2', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500, color: '#dc2626',
            }}>
              Delete
            </button>
          </div>
        )}
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: 12, color: '#dc2626', marginBottom: 16, fontSize: '0.875rem' }}>
          {error}
        </div>
      )}

      {/* Agent Details / Edit Form */}
      <div style={{ ...cardStyle, marginBottom: 24 }}>
        {editing ? (
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0f172a', marginTop: 0, marginBottom: 20 }}>Edit Chat Agent</h2>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: 4 }}>Name</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: 4 }}>Personality</label>
              <textarea
                value={form.personality}
                onChange={(e) => setForm({ ...form, personality: e.target.value })}
                rows={3} style={{ ...inputStyle, resize: 'vertical' }}
                placeholder="Describe the agent's personality and tone..."
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: 4 }}>Industry</label>
                <input type="text" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: 4 }}>Response Time</label>
                <input type="text" value={form.responseTime} onChange={(e) => setForm({ ...form, responseTime: e.target.value })} style={inputStyle} placeholder="e.g. < 2 seconds" />
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: 4 }}>Welcome Message</label>
              <textarea
                value={form.welcomeMessage}
                onChange={(e) => setForm({ ...form, welcomeMessage: e.target.value })}
                rows={2} style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: 8 }}>Channels</label>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {CHANNEL_OPTIONS.map((ch) => {
                  const active = form.channels.includes(ch);
                  return (
                    <label key={ch} style={{
                      display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer',
                      padding: '6px 12px', borderRadius: 8,
                      border: `1px solid ${active ? '#2563eb' : '#d1d5db'}`,
                      background: active ? '#eff6ff' : 'white',
                      fontSize: '0.875rem', fontWeight: 500,
                      color: active ? '#2563eb' : '#64748b',
                    }}>
                      <input type="checkbox" checked={active} onChange={() => toggleChannel(ch)} style={{ display: 'none' }} />
                      {ch}
                    </label>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleSave} disabled={saving} style={{
                padding: '10px 24px', borderRadius: 8, border: 'none',
                background: saving ? '#94a3b8' : '#2563eb', color: 'white',
                cursor: 'pointer', fontWeight: 500, fontSize: '0.875rem',
              }}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button onClick={() => { setEditing(false); setError(null); }} style={{
                padding: '10px 24px', borderRadius: 8, border: '1px solid #d1d5db',
                background: 'white', cursor: 'pointer', fontWeight: 500, fontSize: '0.875rem', color: '#64748b',
              }}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0f172a', marginTop: 0, marginBottom: 20 }}>Agent Details</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Personality</span>
                <div style={{ fontWeight: 500, color: '#0f172a', fontSize: '0.875rem', lineHeight: 1.5 }}>
                  {agent.personality || '--'}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Industry</span>
                <div style={{ fontWeight: 500, color: '#0f172a', fontSize: '0.875rem' }}>{agent.industry || '--'}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Response Time</span>
                <div style={{ fontWeight: 500, color: '#0f172a', fontSize: '0.875rem' }}>{agent.responseTime || '--'}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Channels</span>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {(agent.channels || []).length === 0 ? (
                    <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>No channels</span>
                  ) : (
                    (agent.channels || []).map((ch) => (
                      <span key={ch} style={{
                        padding: '2px 10px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 500,
                        background: '#f3e8ff', color: '#7c3aed',
                      }}>
                        {ch}
                      </span>
                    ))
                  )}
                </div>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <span style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Welcome Message</span>
                <div style={{
                  fontWeight: 500, color: '#0f172a', fontSize: '0.875rem', lineHeight: 1.5,
                  background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0',
                }}>
                  {agent.welcomeMessage || '--'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Test Chat Response */}
      <div style={cardStyle}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0f172a', marginTop: 0, marginBottom: 16 }}>Test Chat Response</h2>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <input
            type="text"
            value={testInput}
            onChange={(e) => setTestInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleTest(); }}
            placeholder="Type a message to test the agent..."
            style={{ ...inputStyle, flex: 1 }}
          />
          <button
            onClick={handleTest}
            disabled={testing || !testInput.trim()}
            style={{
              padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer',
              fontWeight: 500, fontSize: '0.875rem', whiteSpace: 'nowrap',
              background: testing ? '#94a3b8' : '#7c3aed', color: 'white',
              opacity: (!testInput.trim() && !testing) ? 0.5 : 1,
            }}
          >
            {testing ? 'Testing...' : 'Test'}
          </button>
        </div>

        {testResult && (
          <div style={{
            background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: 12,
            padding: 16,
          }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#7c3aed', display: 'block', marginBottom: 6 }}>
              Agent Response
            </span>
            <p style={{ fontSize: '0.875rem', color: '#334155', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>
              {testResult}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
