import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAll } from '../services/api';

const cardStyle = {
  background: 'white',
  borderRadius: 16,
  border: '1px solid #e2e8f0',
  padding: 24,
  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
};

const outcomeBadge = (outcome) => {
  const map = {
    completed: { bg: '#dcfce7', color: '#15803d' },
    'no-answer': { bg: '#fef3c7', color: '#92400e' },
    failed: { bg: '#fee2e2', color: '#dc2626' },
    busy: { bg: '#fee2e2', color: '#dc2626' },
    voicemail: { bg: '#dbeafe', color: '#1d4ed8' },
    answered: { bg: '#dcfce7', color: '#15803d' },
  };
  const c = map[(outcome || '').toLowerCase()] || { bg: '#f1f5f9', color: '#64748b' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 10px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 500,
      background: c.bg, color: c.color,
    }}>
      {outcome || 'Unknown'}
    </span>
  );
};

const sentimentColor = (s) => {
  const key = (s || '').toLowerCase();
  if (key === 'positive') return '#15803d';
  if (key === 'negative') return '#dc2626';
  if (key === 'neutral') return '#64748b';
  return '#64748b';
};

function formatDuration(seconds) {
  if (!seconds && seconds !== 0) return '--:--';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export default function CallLogsPage() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    async function fetch() {
      try {
        const res = await getAll('callLogs');
        setLogs(res.data || []);
      } catch (err) {
        setError('Failed to load call logs.');
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, []);

  if (loading) return (
    <div style={{ padding: 24 }}>
      <div style={{ height: 400, background: '#f1f5f9', borderRadius: 16 }} />
    </div>
  );

  if (error) return (
    <div style={{ padding: 24 }}>
      <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: 16, color: '#dc2626' }}>
        {error}
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Call Logs</h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
            {logs.length} total call{logs.length !== 1 ? 's' : ''} recorded
          </p>
        </div>
      </div>

      <div style={cardStyle}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
              {['Voice Agent', 'Contact', 'Duration', 'Outcome', 'Sentiment', 'Date'].map((h) => (
                <th key={h} style={{
                  textAlign: 'left', padding: '12px 16px', fontSize: '0.75rem',
                  fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: 40, color: '#94a3b8', fontSize: '0.875rem' }}>
                  No call logs found.
                </td>
              </tr>
            )}
            {logs.map((log) => {
              const isExpanded = expandedId === (log._id || log.id);
              return (
                <tbody key={log._id || log.id}>
                  <tr
                    onClick={() => setExpandedId(isExpanded ? null : (log._id || log.id))}
                    style={{
                      borderBottom: isExpanded ? 'none' : '1px solid #f1f5f9',
                      cursor: 'pointer',
                      background: isExpanded ? '#f8fafc' : 'transparent',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => { if (!isExpanded) e.currentTarget.style.background = '#f8fafc'; }}
                    onMouseLeave={(e) => { if (!isExpanded) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <td style={{ padding: '12px 16px', fontSize: '0.875rem', color: '#0f172a', fontWeight: 500 }}>
                      {log.voiceAgentName || log.agentName || log.voiceAgent || '--'}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '0.875rem', color: '#334155' }}>
                      {log.contactName || log.contact || log.phoneNumber || '--'}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '0.875rem', color: '#334155', fontFamily: 'monospace' }}>
                      {formatDuration(log.duration)}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {outcomeBadge(log.outcome || log.status)}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '0.875rem', fontWeight: 500, color: sentimentColor(log.sentiment) }}>
                      {log.sentiment || '--'}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '0.875rem', color: '#64748b' }}>
                      {log.createdAt ? new Date(log.createdAt).toLocaleDateString() : log.date || '--'}
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr style={{ background: '#f8fafc' }}>
                      <td colSpan={6} style={{ padding: '0 16px 16px 16px' }}>
                        <div style={{
                          background: 'white', borderRadius: 12, border: '1px solid #e2e8f0',
                          padding: 20, marginTop: 4,
                        }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
                            <div>
                              <span style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase' }}>Phone Number</span>
                              <div style={{ fontWeight: 500, color: '#0f172a', fontSize: '0.875rem' }}>{log.phoneNumber || '--'}</div>
                            </div>
                            <div>
                              <span style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase' }}>Direction</span>
                              <div style={{ fontWeight: 500, color: '#0f172a', fontSize: '0.875rem' }}>{log.direction || 'Outbound'}</div>
                            </div>
                            <div>
                              <span style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase' }}>Call SID</span>
                              <div style={{ fontWeight: 500, color: '#0f172a', fontSize: '0.875rem', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                                {log.callSid || log.sid || '--'}
                              </div>
                            </div>
                          </div>

                          {log.recordingUrl && (
                            <div style={{ marginBottom: 16 }}>
                              <span style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Recording</span>
                              <a
                                href={log.recordingUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: '#2563eb', fontSize: '0.875rem', textDecoration: 'underline' }}
                              >
                                Listen to Recording
                              </a>
                            </div>
                          )}

                          {(log.transcript || log.transcriptText) && (
                            <div>
                              <span style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Transcript</span>
                              <textarea
                                readOnly
                                value={log.transcript || log.transcriptText || ''}
                                style={{
                                  width: '100%', minHeight: 120, padding: 12, border: '1px solid #e2e8f0',
                                  borderRadius: 8, fontSize: '0.875rem', color: '#334155', background: '#f8fafc',
                                  resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box',
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
