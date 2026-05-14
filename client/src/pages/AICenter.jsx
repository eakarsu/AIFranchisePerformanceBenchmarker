import { useState, useRef, useEffect } from 'react';
import { aiChat, streamChat, listChatSessions, getChatMessages } from '../services/api';
import ReactMarkdown from 'react-markdown';

const quickActions = [
  'Analyze Portfolio Performance',
  'Revenue Growth Strategies',
  'Competitive Landscape Overview',
  'Staff Efficiency Report',
  'Supply Chain Optimization',
  'Marketing Strategy Ideas',
  'Compliance Risk Assessment',
  'Franchise Valuation Summary',
  'Trip Planning Assistant',
  'Menu Optimization Insights',
];

const initialMessage = {
  role: 'assistant',
  content:
    'Welcome to the AI Franchise Intelligence Center. I can help you analyze performance, forecast revenue, optimize operations, and much more. Ask me anything about your franchise portfolio!',
};

export default function AICenter() {
  const [messages, setMessages] = useState([initialMessage]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [useTools, setUseTools] = useState(false);
  const [useStreaming, setUseStreaming] = useState(true);
  const [sessions, setSessions] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    listChatSessions().then(r => setSessions(r.data?.data || [])).catch(() => {});
  }, []);

  const loadSession = async (sid) => {
    setSessionId(sid);
    try {
      const r = await getChatMessages(sid);
      setMessages([initialMessage, ...r.data.map(m => ({ role: m.role, content: m.content }))]);
    } catch (e) { console.error(e); }
  };

  const send = async (text) => {
    const userMessage = text || input;
    if (!userMessage.trim()) return;

    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setLoading(true);

    try {
      if (useStreaming && !useTools) {
        // Streaming branch
        let acc = '';
        setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
        await streamChat(
          userMessage,
          sessionId,
          (delta) => {
            acc += delta;
            setMessages(prev => {
              const copy = [...prev];
              copy[copy.length - 1] = { role: 'assistant', content: acc };
              return copy;
            });
          },
          (sid) => setSessionId(sid),
          () => {},
          (err) => console.error('stream error', err)
        );
      } else {
        const response = await aiChat(userMessage, null, { sessionId, useTools });
        if (response.data?.session_id) setSessionId(response.data.session_id);
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: response.data?.response || response.data?.message || String(response.data) },
        ]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="ai-center-page">
      <div className="page-header">
        <h1>AI Center</h1>
        <p>Your Franchise Intelligence Assistant</p>
      </div>

      <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
        <label><input type="checkbox" checked={useTools} onChange={e => { setUseTools(e.target.checked); if (e.target.checked) setUseStreaming(false); }} /> Tool calling</label>
        <label><input type="checkbox" checked={useStreaming} onChange={e => { setUseStreaming(e.target.checked); if (e.target.checked) setUseTools(false); }} /> Streaming</label>
        <button onClick={() => { setSessionId(null); setMessages([initialMessage]); }}>New Session</button>
        {sessions.length > 0 && (
          <select value={sessionId || ''} onChange={e => e.target.value && loadSession(e.target.value)}>
            <option value="">— Resume session —</option>
            {sessions.map(s => <option key={s.session_id} value={s.session_id}>{s.title || s.session_id}</option>)}
          </select>
        )}
        {sessionId && <span style={{ fontSize: 12, color: '#64748b' }}>Session: {sessionId}</span>}
      </div>

      <div className="quick-actions">
        {quickActions.map((prompt) => (
          <button
            key={prompt}
            className="btn-ai"
            onClick={() => send(prompt)}
            disabled={loading}
          >
            {prompt}
          </button>
        ))}
      </div>

      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`chat-message ${msg.role === 'user' ? 'user-message' : 'assistant-message'}`}
          >
            {msg.role === 'assistant' ? (
              <div className="ai-output">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            ) : (
              <div className="user-bubble">{msg.content}</div>
            )}
          </div>
        ))}
        {loading && (
          <div className="chat-message assistant-message">
            <div className="ai-loading">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything about your franchise portfolio..."
          disabled={loading}
        />
        <button className="btn-ai" onClick={() => send()} disabled={loading || !input.trim()}>
          Send
        </button>
      </div>
    </div>
  );
}
