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

export default function EmailAgentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', emailAddress: '', industry: '', confidenceThreshold: 80,
    signature: '', status: 'active',
  });
  const [promptInput, setPromptInput] = useState('');
  const [draftResult, setDraftResult] = useState(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    async function fetch() {
      try {
        const res = await getById('emailAgents', id);
        const data = res.data;
        setAgent(data);
        setForm({
          name: data.name || '',
          emailAddress: data.emailAddress || data.email || '',
          industry: data.industry || '',
          confidenceThreshold: data.confidenceThreshold ?? 80,
          signature: data.signature || '',
          status: data.status || 'active',
        });
      } catch {
        setError('Email agent not found.');
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await update('emailAgents', id, form);
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
    if (!window.confirm('Are you sure you want to delete this email agent?')) return;
    try {
      await remove('emailAgents', id);
      navigate('/emailAgents');
    } catch {
      setError('Failed to delete agent.');
    }
  };

  const handleGenerate = async () => {
    if (!promptInput.trim()) return;
    setGenerating(true);
    setDraftResult(null);
    try {
      const res = await api.post('/ai/email-draft', {
        context: agent.name,
        subject: promptInput,
        tone: 'professional',
      });
      setDraftResult(res.data?.response || res.data?.result || res.data?.message || JSON.stringify(res.data));
    } catch {
      setDraftResult('Failed to generate email draft.');
    } finally {
      setGenerating(false);
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
  const threshold = agent.confidenceThreshold ?? 80;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button onClick={() => navigate('/emailAgents')} style={{
          background: 'none', border: '1px solid #e2e8f0', borderRadius: 8, padding: '6px 12px',
          cursor: 'pointer', fontSize: '0.875rem', color: '#64748b',
        }}>
          ← Back
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              {agent.name || 'Email Agent'}
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
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0f172a', marginTop: 0, marginBottom: 20 }}>Edit Email Agent</h2>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: 4 }}>Name</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: 4 }}>Email Address</label>
              <input type="email" value={form.emailAddress} onChange={(e) => setForm({ ...form, emailAddress: e.target.value })} style={inputStyle} />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: 4 }}>Industry</label>
              <input type="text" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} style={inputStyle} />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: 4 }}>
                Confidence Threshold: {form.confidenceThreshold}%
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>0%</span>
                <input
                  type="range" min="0" max="100" value={form.confidenceThreshold}
                  onChange={(e) => setForm({ ...form, confidenceThreshold: Number(e.target.value) })}
                  style={{ flex: 1, accentColor: '#2563eb' }}
                />
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>100%</span>
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: 4 }}>Signature</label>
              <textarea
                value={form.signature}
                onChange={(e) => setForm({ ...form, signature: e.target.value })}
                rows={3} style={{ ...inputStyle, resize: 'vertical' }}
                placeholder="Email signature text..."
              />
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
                <span style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Email Address</span>
                <div style={{ fontWeight: 500, color: '#0f172a', fontSize: '0.875rem' }}>
                  {agent.emailAddress || agent.email || '--'}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Industry</span>
                <div style={{ fontWeight: 500, color: '#0f172a', fontSize: '0.875rem' }}>{agent.industry || '--'}</div>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <span style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Confidence Threshold</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    flex: 1, height: 8, background: '#e2e8f0', borderRadius: 999, overflow: 'hidden',
                  }}>
                    <div style={{
                      width: `${threshold}%`, height: '100%', borderRadius: 999,
                      background: threshold >= 80 ? '#22c55e' : threshold >= 50 ? '#eab308' : '#ef4444',
                      transition: 'width 0.3s ease',
                    }} />
                  </div>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a', minWidth: 40 }}>
                    {threshold}%
                  </span>
                </div>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <span style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Signature</span>
                <div style={{
                  fontWeight: 500, color: '#0f172a', fontSize: '0.875rem', lineHeight: 1.5,
                  background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0',
                  whiteSpace: 'pre-wrap',
                }}>
                  {agent.signature || '--'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Generate Email Draft */}
      <div style={cardStyle}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0f172a', marginTop: 0, marginBottom: 16 }}>Generate Email Draft</h2>
        <div style={{ marginBottom: 16 }}>
          <textarea
            value={promptInput}
            onChange={(e) => setPromptInput(e.target.value)}
            placeholder="Describe the email you want to generate (e.g. 'Follow-up email after initial consultation')..."
            rows={3}
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        </div>
        <button
          onClick={handleGenerate}
          disabled={generating || !promptInput.trim()}
          style={{
            padding: '10px 24px', borderRadius: 8, border: 'none', cursor: 'pointer',
            fontWeight: 500, fontSize: '0.875rem',
            background: generating ? '#94a3b8' : '#2563eb', color: 'white',
            opacity: (!promptInput.trim() && !generating) ? 0.5 : 1,
            marginBottom: 16,
          }}
        >
          {generating ? 'Generating...' : 'Generate'}
        </button>

        {draftResult && (
          <div style={{
            background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 12,
            padding: 16,
          }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#2563eb', display: 'block', marginBottom: 6 }}>
              Generated Email Draft
            </span>
            <pre style={{
              fontSize: '0.875rem', color: '#334155', lineHeight: 1.6, margin: 0,
              whiteSpace: 'pre-wrap', fontFamily: 'inherit',
            }}>
              {draftResult}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
