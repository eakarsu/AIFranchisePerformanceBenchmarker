import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getById } from '../services/api';
import api from '../services/api';

const cardStyle = {
  background: 'white',
  borderRadius: 16,
  border: '1px solid #e2e8f0',
  padding: 24,
  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
};

const channelColors = {
  VOICE: { bg: '#dbeafe', color: '#1d4ed8' },
  SMS: { bg: '#dcfce7', color: '#15803d' },
  CHAT: { bg: '#f3e8ff', color: '#7c3aed' },
  EMAIL: { bg: '#fef3c7', color: '#92400e' },
  WHATSAPP: { bg: '#dcfce7', color: '#15803d' },
};

const statusColors = {
  active: { bg: '#dcfce7', color: '#15803d' },
  open: { bg: '#dcfce7', color: '#15803d' },
  closed: { bg: '#f1f5f9', color: '#64748b' },
  resolved: { bg: '#dbeafe', color: '#1d4ed8' },
  pending: { bg: '#fef3c7', color: '#92400e' },
};

function formatDuration(seconds) {
  if (!seconds && seconds !== 0) return '--';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export default function ConversationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [convo, setConvo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [summaryResult, setSummaryResult] = useState(null);

  useEffect(() => {
    async function fetch() {
      try {
        const res = await getById('conversations', id);
        setConvo(res.data);
      } catch {
        setError('Conversation not found.');
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [id]);

  const getTranscriptText = () => {
    const messages = convo.messages || convo.transcript || [];
    return messages.map((m) => `${m.role || m.sender || 'unknown'}: ${m.content || m.text || m.message || ''}`).join('\n');
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setAnalysisResult(null);
    try {
      const res = await api.post('/ai/sentiment', { text: getTranscriptText() });
      setAnalysisResult(res.data?.analysis || res.data?.result || res.data || 'Analysis complete.');
    } catch {
      setAnalysisResult('Failed to analyze sentiment.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSummarize = async () => {
    setSummarizing(true);
    setSummaryResult(null);
    try {
      const res = await api.post('/ai/summarize', { transcript: getTranscriptText() });
      setSummaryResult(res.data?.summary || res.data?.result || res.data || 'Summary generated.');
    } catch {
      setSummaryResult('Failed to generate summary.');
    } finally {
      setSummarizing(false);
    }
  };

  if (loading) return (
    <div style={{ padding: 24 }}>
      <div style={{ height: 500, background: '#f1f5f9', borderRadius: 16 }} />
    </div>
  );

  if (error || !convo) return (
    <div style={{ padding: 24 }}>
      <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: 16, color: '#dc2626' }}>
        {error || 'Conversation not found.'}
      </div>
    </div>
  );

  const channel = (convo.channel || 'CHAT').toUpperCase();
  const chColor = channelColors[channel] || { bg: '#f1f5f9', color: '#64748b' };
  const status = (convo.status || 'open').toLowerCase();
  const stColor = statusColors[status] || { bg: '#f1f5f9', color: '#64748b' };
  const messages = convo.messages || convo.transcript || [];

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button onClick={() => navigate('/conversations')} style={{
          background: 'none', border: '1px solid #e2e8f0', borderRadius: 8, padding: '6px 12px',
          cursor: 'pointer', fontSize: '0.875rem', color: '#64748b',
        }}>
          ← Back
        </button>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
            Conversation Details
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
            ID: {id}
          </p>
        </div>
      </div>

      {/* Metadata Grid */}
      <div style={{ ...cardStyle, marginBottom: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Channel</span>
            <span style={{
              display: 'inline-block', padding: '2px 10px', borderRadius: 999, fontSize: '0.8rem',
              fontWeight: 600, background: chColor.bg, color: chColor.color,
            }}>
              {channel}
            </span>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Contact</span>
            <div style={{ fontWeight: 500, color: '#0f172a', fontSize: '0.875rem' }}>
              {convo.contactName || convo.contact || '--'}
            </div>
            {convo.contactEmail && (
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{convo.contactEmail}</div>
            )}
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Agent</span>
            <div style={{ fontWeight: 500, color: '#0f172a', fontSize: '0.875rem' }}>
              {convo.agentName || convo.agent || '--'}
            </div>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Sentiment</span>
            <div style={{
              fontWeight: 600, fontSize: '0.875rem',
              color: (convo.sentiment || '').toLowerCase() === 'positive' ? '#15803d'
                : (convo.sentiment || '').toLowerCase() === 'negative' ? '#dc2626' : '#64748b',
            }}>
              {convo.sentiment || '--'}
            </div>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Status</span>
            <span style={{
              display: 'inline-block', padding: '2px 10px', borderRadius: 999, fontSize: '0.75rem',
              fontWeight: 500, background: stColor.bg, color: stColor.color,
            }}>
              {status}
            </span>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Duration</span>
            <div style={{ fontWeight: 500, color: '#0f172a', fontSize: '0.875rem', fontFamily: 'monospace' }}>
              {formatDuration(convo.duration)}
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      {convo.summary && (
        <div style={{ ...cardStyle, marginBottom: 24 }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0f172a', marginTop: 0, marginBottom: 12 }}>Summary</h2>
          <p style={{ fontSize: '0.875rem', color: '#334155', lineHeight: 1.6, margin: 0 }}>
            {convo.summary}
          </p>
        </div>
      )}

      {/* Transcript */}
      <div style={{ ...cardStyle, marginBottom: 24 }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0f172a', marginTop: 0, marginBottom: 16 }}>Transcript</h2>
        <div style={{
          background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12,
          padding: 20, maxHeight: 500, overflowY: 'auto',
        }}>
          {messages.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', textAlign: 'center', margin: 40 }}>
              No messages in this conversation.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {messages.map((msg, i) => {
                const isAgent = (msg.role || msg.sender || '').toLowerCase() === 'agent'
                  || (msg.role || msg.sender || '').toLowerCase() === 'assistant'
                  || (msg.role || msg.sender || '').toLowerCase() === 'bot';
                return (
                  <div key={i} style={{
                    display: 'flex', flexDirection: 'column',
                    alignItems: isAgent ? 'flex-start' : 'flex-end',
                  }}>
                    <span style={{
                      fontSize: '0.7rem', fontWeight: 600, marginBottom: 2, color: '#6b7280',
                    }}>
                      {isAgent ? (msg.senderName || 'Agent') : (msg.senderName || 'User')}
                    </span>
                    <div style={{
                      maxWidth: '70%', padding: '10px 14px', borderRadius: 12,
                      fontSize: '0.875rem', lineHeight: 1.5,
                      background: isAgent ? '#f1f5f9' : '#2563eb',
                      color: isAgent ? '#1e293b' : 'white',
                      borderBottomLeftRadius: isAgent ? 2 : 12,
                      borderBottomRightRadius: isAgent ? 12 : 2,
                    }}>
                      {msg.content || msg.text || msg.message || ''}
                    </div>
                    {msg.timestamp && (
                      <span style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: 2 }}>
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* AI Analysis */}
      <div style={cardStyle}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0f172a', marginTop: 0, marginBottom: 16 }}>AI Analysis</h2>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            style={{
              padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer',
              fontWeight: 500, fontSize: '0.875rem',
              background: analyzing ? '#94a3b8' : '#7c3aed', color: 'white',
              opacity: analyzing ? 0.7 : 1,
            }}
          >
            {analyzing ? 'Analyzing...' : 'Analyze Sentiment'}
          </button>
          <button
            onClick={handleSummarize}
            disabled={summarizing}
            style={{
              padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer',
              fontWeight: 500, fontSize: '0.875rem',
              background: summarizing ? '#94a3b8' : '#2563eb', color: 'white',
              opacity: summarizing ? 0.7 : 1,
            }}
          >
            {summarizing ? 'Summarizing...' : 'Summarize'}
          </button>
        </div>

        {analysisResult && (
          <div style={{
            background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: 8,
            padding: 16, marginBottom: 12,
          }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#7c3aed', display: 'block', marginBottom: 6 }}>
              Sentiment Analysis
            </span>
            <p style={{ fontSize: '0.875rem', color: '#334155', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>
              {typeof analysisResult === 'string' ? analysisResult : JSON.stringify(analysisResult, null, 2)}
            </p>
          </div>
        )}

        {summaryResult && (
          <div style={{
            background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8,
            padding: 16,
          }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#2563eb', display: 'block', marginBottom: 6 }}>
              Summary
            </span>
            <p style={{ fontSize: '0.875rem', color: '#334155', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>
              {typeof summaryResult === 'string' ? summaryResult : JSON.stringify(summaryResult, null, 2)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
