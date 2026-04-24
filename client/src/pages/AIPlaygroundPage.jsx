import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { aiChat } from '../services/api';
import api from '../services/api';

const AI_FUNCTIONS = [
  { value: 'general', label: 'General', endpoint: '/ai/chat', placeholder: 'Ask anything...' },
  { value: 'voice_response', label: 'Voice Response', endpoint: '/ai/voice', placeholder: "I'd like to schedule an appointment for next Tuesday..." },
  { value: 'chat_response', label: 'Chat Response', endpoint: '/ai/chat-response', placeholder: 'Do you have tables available for tonight at 7pm?' },
  { value: 'email_draft', label: 'Email Draft', endpoint: '/ai/email', placeholder: 'Describe the email purpose, recipient, and key points...' },
  { value: 'sms_compose', label: 'SMS Compose', endpoint: '/ai/sms', placeholder: 'Describe the SMS purpose and target audience...' },
  { value: 'sentiment_analysis', label: 'Sentiment Analysis', endpoint: '/ai/sentiment', placeholder: 'Paste the text to analyze for sentiment...' },
  { value: 'summarize', label: 'Summarize', endpoint: '/ai/summarize', placeholder: 'Paste the content you want summarized...' },
];

function getPromptLabel(funcValue) {
  switch (funcValue) {
    case 'sentiment_analysis':
      return 'Text to Analyze *';
    case 'summarize':
      return 'Conversation Transcript *';
    case 'voice_response':
      return 'Caller Scenario *';
    case 'chat_response':
      return 'Customer Message *';
    case 'email_draft':
      return 'Email Details *';
    case 'sms_compose':
      return 'SMS Details *';
    default:
      return 'Prompt *';
  }
}

function AIResponseDisplay({ response, onCopy }) {
  if (!response) return null;

  const sections = response.split(/\n(?=#{1,3}\s|[A-Z][A-Za-z\s]+:)/).filter(Boolean);
  const copied = false;

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #f0f4ff 0%, #faf5ff 50%, #f0fdf4 100%)',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        padding: '28px',
        marginTop: '24px',
        position: 'relative',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}
      >
        <div
          style={{
            fontSize: '13px',
            fontWeight: '600',
            color: '#6366f1',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          AI Response
        </div>
        <button
          onClick={onCopy}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            background: '#ffffff',
            color: '#475569',
            fontSize: '12px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          Copy
        </button>
      </div>

      {sections.map((section, idx) => {
        const headerMatch = section.match(/^(#{1,3})\s+(.+)/);
        if (headerMatch) {
          const level = headerMatch[1].length;
          const title = headerMatch[2];
          const body = section.replace(/^#{1,3}\s+.+\n?/, '').trim();
          return (
            <div key={idx} style={{ marginBottom: '16px' }}>
              <div
                style={{
                  fontSize: level === 1 ? '18px' : level === 2 ? '16px' : '14px',
                  fontWeight: '600',
                  color: '#1e293b',
                  marginBottom: '8px',
                }}
              >
                {title}
              </div>
              {body && (
                <div
                  style={{
                    fontSize: '15px',
                    color: '#1e293b',
                    lineHeight: '1.7',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {body}
                </div>
              )}
            </div>
          );
        }
        return (
          <div
            key={idx}
            style={{
              fontSize: '15px',
              color: '#1e293b',
              lineHeight: '1.7',
              whiteSpace: 'pre-wrap',
              marginBottom: '12px',
            }}
          >
            {section}
          </div>
        );
      })}
    </div>
  );
}

const styles = {
  container: {
    padding: '32px',
    minHeight: '100vh',
    background: '#f8fafc',
  },
  header: {
    marginBottom: '32px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1e293b',
    margin: '0 0 8px 0',
  },
  subtitle: {
    fontSize: '15px',
    color: '#64748b',
    margin: 0,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '24px',
    alignItems: 'start',
  },
  card: {
    background: '#ffffff',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    padding: '28px',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1e293b',
    margin: '0 0 20px 0',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '6px',
  },
  select: {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    fontSize: '14px',
    color: '#1e293b',
    background: '#ffffff',
    outline: 'none',
    marginBottom: '16px',
    cursor: 'pointer',
  },
  textarea: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    fontSize: '14px',
    color: '#1e293b',
    fontFamily: 'inherit',
    resize: 'vertical',
    outline: 'none',
    marginBottom: '16px',
    boxSizing: 'border-box',
  },
  button: {
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    padding: '12px 28px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'opacity 0.2s',
  },
  buttonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  historyCard: {
    background: '#ffffff',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    padding: '24px',
  },
  historyTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1e293b',
    margin: '0 0 16px 0',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  historyItem: {
    padding: '12px 14px',
    borderRadius: '10px',
    border: '1px solid #f1f5f9',
    marginBottom: '8px',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  historyItemHover: {
    background: '#f8fafc',
    borderColor: '#e2e8f0',
  },
  historyFunc: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#6366f1',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  },
  historyPrompt: {
    fontSize: '13px',
    color: '#475569',
    marginTop: '4px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  historyResponse: {
    fontSize: '12px',
    color: '#94a3b8',
    marginTop: '4px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  historyTime: {
    fontSize: '11px',
    color: '#94a3b8',
    marginTop: '4px',
  },
  emptyHistory: {
    textAlign: 'center',
    padding: '32px 16px',
    color: '#94a3b8',
    fontSize: '14px',
  },
  errorBox: {
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '10px',
    padding: '14px 16px',
    color: '#dc2626',
    fontSize: '14px',
    marginTop: '16px',
  },
};

export default function AIPlaygroundPage() {
  const navigate = useNavigate();
  const [selectedFunction, setSelectedFunction] = useState('general');
  const [prompt, setPrompt] = useState('');
  const [context, setContext] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [hoveredItem, setHoveredItem] = useState(null);

  const currentFunc = AI_FUNCTIONS.find((f) => f.value === selectedFunction);

  const isContextDisabled = selectedFunction === 'sentiment_analysis' || selectedFunction === 'summarize';

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError('');
    setResponse('');

    try {
      let res;

      switch (selectedFunction) {
        case 'general':
          res = await aiChat(prompt, context || undefined);
          break;
        case 'voice_response':
          res = await api.post(currentFunc.endpoint, {
            scenario: prompt,
            context: context || undefined,
          });
          break;
        case 'chat_response':
          res = await api.post(currentFunc.endpoint, {
            message: prompt,
            context: context || undefined,
          });
          break;
        case 'email_draft':
          res = await api.post(currentFunc.endpoint, {
            purpose: prompt,
            context: context || undefined,
          });
          break;
        case 'sms_compose':
          res = await api.post(currentFunc.endpoint, {
            purpose: prompt,
            context: context || undefined,
          });
          break;
        case 'sentiment_analysis':
          res = await api.post(currentFunc.endpoint, {
            text: prompt,
          });
          break;
        case 'summarize':
          res = await api.post(currentFunc.endpoint, {
            transcript: prompt,
          });
          break;
        default:
          res = await aiChat(prompt, context || undefined);
      }

      const result =
        res.data?.response ||
        res.data?.result ||
        res.data?.message ||
        JSON.stringify(res.data, null, 2);
      setResponse(result);

      setHistory((prev) => [
        {
          id: Date.now(),
          func: selectedFunction,
          funcLabel: currentFunc.label,
          prompt,
          context,
          response: result,
          timestamp: new Date(),
        },
        ...prev,
      ]);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || 'Failed to generate response'
      );
    } finally {
      setLoading(false);
    }
  }, [prompt, context, selectedFunction, currentFunc]);

  const loadFromHistory = useCallback((item) => {
    setSelectedFunction(item.func);
    setPrompt(item.prompt);
    setContext(item.context || '');
    setResponse(item.response);
  }, []);

  const handleCopyResponse = useCallback(() => {
    if (response) {
      navigator.clipboard.writeText(response);
    }
  }, [response]);

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>AI Playground</h1>
        <p style={styles.subtitle}>
          Test and experiment with Luran AI functions in real time
        </p>
      </div>

      <div style={styles.grid}>
        {/* Left Column: Form + Response */}
        <div>
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Configure Request</h2>

            <label style={styles.label}>AI Function</label>
            <select
              style={styles.select}
              value={selectedFunction}
              onChange={(e) => setSelectedFunction(e.target.value)}
            >
              {AI_FUNCTIONS.map((fn) => (
                <option key={fn.value} value={fn.value}>
                  {fn.label}
                </option>
              ))}
            </select>

            <label style={styles.label}>{getPromptLabel(selectedFunction)}</label>
            <textarea
              style={{ ...styles.textarea, minHeight: '120px' }}
              placeholder={currentFunc?.placeholder}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />

            <label style={styles.label}>
              Context {isContextDisabled ? '(not applicable)' : '(optional)'}
            </label>
            <textarea
              style={{
                ...styles.textarea,
                minHeight: '80px',
                ...(isContextDisabled
                  ? { background: '#f1f5f9', cursor: 'not-allowed', opacity: 0.6 }
                  : {}),
              }}
              placeholder="Add any relevant context, background info, or data..."
              value={context}
              onChange={(e) => setContext(e.target.value)}
              disabled={isContextDisabled}
            />

            <button
              style={{
                ...styles.button,
                ...(loading || !prompt.trim() ? styles.buttonDisabled : {}),
              }}
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
            >
              {loading ? (
                <>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ animation: 'spin 1s linear infinite' }}
                  >
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                  Generate Response
                </>
              )}
            </button>

            {error && <div style={styles.errorBox}>{error}</div>}
          </div>

          <AIResponseDisplay response={response} onCopy={handleCopyResponse} />
        </div>

        {/* Right Column: Session History */}
        <div style={styles.historyCard}>
          <h3 style={styles.historyTitle}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#6366f1"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            Session History
          </h3>

          {history.length === 0 ? (
            <div style={styles.emptyHistory}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🧪</div>
              No prompts yet. Start experimenting!
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                style={{
                  ...styles.historyItem,
                  ...(hoveredItem === item.id ? styles.historyItemHover : {}),
                }}
                onClick={() => loadFromHistory(item)}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <div style={styles.historyFunc}>{item.funcLabel}</div>
                <div style={styles.historyPrompt}>{item.prompt}</div>
                <div style={styles.historyResponse}>
                  {item.response?.substring(0, 80)}...
                </div>
                <div style={styles.historyTime}>
                  {formatTime(item.timestamp)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
