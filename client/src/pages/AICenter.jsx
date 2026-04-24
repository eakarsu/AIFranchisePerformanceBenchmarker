import { useState, useRef, useEffect } from 'react';
import { aiChat } from '../services/api';
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
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (text) => {
    const userMessage = text || input;
    if (!userMessage.trim()) return;

    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setLoading(true);

    try {
      const response = await aiChat(userMessage);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: response.data?.response || response.data?.message || String(response.data) },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, something went wrong. Please try again.',
        },
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
