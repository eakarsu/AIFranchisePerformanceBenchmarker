import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getById, update, remove } from '../services/api';

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
  draft: { bg: '#fef3c7', color: '#92400e' },
  scheduled: { bg: '#dbeafe', color: '#1d4ed8' },
  active: { bg: '#dcfce7', color: '#15803d' },
  paused: { bg: '#f1f5f9', color: '#64748b' },
  completed: { bg: '#dbeafe', color: '#1d4ed8' },
};

const CHANNEL_OPTIONS = ['VOICE', 'SMS', 'CHAT', 'EMAIL'];
const STATUS_OPTIONS = ['draft', 'scheduled', 'active', 'paused', 'completed'];

function MetricCard({ label, value, sub }) {
  return (
    <div style={{
      ...cardStyle, padding: 20, textAlign: 'center', flex: 1, minWidth: 140,
    }}>
      <div style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', marginBottom: 8, fontWeight: 600, letterSpacing: '0.05em' }}>
        {label}
      </div>
      <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a' }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 4 }}>{sub}</div>
      )}
    </div>
  );
}

function pct(part, total) {
  if (!total) return '0%';
  return ((part / total) * 100).toFixed(1) + '%';
}

export default function CampaignDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', type: '', status: 'draft', audience: '', scheduledAt: '', channels: [],
  });

  useEffect(() => {
    async function fetch() {
      try {
        const res = await getById('campaigns', id);
        const data = res.data;
        setCampaign(data);
        setForm({
          name: data.name || '',
          type: data.type || '',
          status: data.status || 'draft',
          audience: data.audience || '',
          scheduledAt: data.scheduledAt ? data.scheduledAt.slice(0, 16) : '',
          channels: data.channels || [],
        });
      } catch {
        setError('Campaign not found.');
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await update('campaigns', id, form);
      setCampaign(res.data);
      setEditing(false);
    } catch {
      setError('Failed to save campaign.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this campaign?')) return;
    try {
      await remove('campaigns', id);
      navigate('/campaigns');
    } catch {
      setError('Failed to delete campaign.');
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

  if (loading) return (
    <div style={{ padding: 24 }}>
      <div style={{ height: 400, background: '#f1f5f9', borderRadius: 16 }} />
    </div>
  );

  if (error && !campaign) return (
    <div style={{ padding: 24 }}>
      <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: 16, color: '#dc2626' }}>
        {error}
      </div>
    </div>
  );

  const sent = campaign.sent || campaign.totalSent || 0;
  const opens = campaign.opens || campaign.totalOpens || 0;
  const responses = campaign.responses || campaign.totalResponses || 0;
  const conversions = campaign.conversions || campaign.totalConversions || 0;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button onClick={() => navigate('/campaigns')} style={{
          background: 'none', border: '1px solid #e2e8f0', borderRadius: 8, padding: '6px 12px',
          cursor: 'pointer', fontSize: '0.875rem', color: '#64748b',
        }}>
          ← Back
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
            {campaign.name || 'Campaign'}
          </h1>
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

      {/* Metric Cards */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <MetricCard label="Sent" value={sent} />
        <MetricCard label="Opens" value={opens} sub={pct(opens, sent)} />
        <MetricCard label="Responses" value={responses} sub={pct(responses, sent)} />
        <MetricCard label="Conversions" value={conversions} sub={pct(conversions, sent)} />
      </div>

      {/* Details / Edit Form */}
      <div style={cardStyle}>
        {editing ? (
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0f172a', marginTop: 0, marginBottom: 20 }}>Edit Campaign</h2>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: 4 }}>Name</label>
              <input
                type="text" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: 4 }}>Type</label>
              <input
                type="text" value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                style={inputStyle} placeholder="e.g. promotional, transactional"
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: 4 }}>Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                style={{ ...inputStyle, background: 'white' }}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: 4 }}>Audience</label>
              <input
                type="text" value={form.audience}
                onChange={(e) => setForm({ ...form, audience: e.target.value })}
                style={inputStyle} placeholder="Target audience description"
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: 4 }}>Scheduled Date/Time</label>
              <input
                type="datetime-local" value={form.scheduledAt}
                onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
                style={inputStyle}
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
                      <input
                        type="checkbox" checked={active}
                        onChange={() => toggleChannel(ch)}
                        style={{ display: 'none' }}
                      />
                      {ch}
                    </label>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={handleSave} disabled={saving}
                style={{
                  padding: '10px 24px', borderRadius: 8, border: 'none',
                  background: saving ? '#94a3b8' : '#2563eb', color: 'white',
                  cursor: 'pointer', fontWeight: 500, fontSize: '0.875rem',
                }}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={() => { setEditing(false); setError(null); }}
                style={{
                  padding: '10px 24px', borderRadius: 8, border: '1px solid #d1d5db',
                  background: 'white', cursor: 'pointer', fontWeight: 500, fontSize: '0.875rem', color: '#64748b',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0f172a', marginTop: 0, marginBottom: 20 }}>Campaign Details</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Type</span>
                <div style={{ fontWeight: 500, color: '#0f172a', fontSize: '0.875rem' }}>{campaign.type || '--'}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Status</span>
                <span style={{
                  display: 'inline-block', padding: '2px 10px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 500,
                  background: (statusColors[campaign.status] || {}).bg || '#f1f5f9',
                  color: (statusColors[campaign.status] || {}).color || '#64748b',
                }}>
                  {campaign.status || '--'}
                </span>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Audience</span>
                <div style={{ fontWeight: 500, color: '#0f172a', fontSize: '0.875rem' }}>{campaign.audience || '--'}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Scheduled</span>
                <div style={{ fontWeight: 500, color: '#0f172a', fontSize: '0.875rem' }}>
                  {campaign.scheduledAt ? new Date(campaign.scheduledAt).toLocaleString() : '--'}
                </div>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <span style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Channels</span>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {(campaign.channels || []).length === 0 ? (
                    <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>No channels</span>
                  ) : (
                    (campaign.channels || []).map((ch) => (
                      <span key={ch} style={{
                        padding: '2px 10px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 500,
                        background: '#dbeafe', color: '#1d4ed8',
                      }}>
                        {ch}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
