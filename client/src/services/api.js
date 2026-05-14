import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — redirect to login on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ---------------------------------------------------------------------------
// Entity names that map to API paths
// ---------------------------------------------------------------------------
// franchise-units, revenue-records, competitors, market-expansion,
// staff-members, customer-reviews, supply-chain, training-programs,
// menu-items, financial-records, marketing-campaigns, compliance-records,
// trip-plans, benchmark-reports, franchise-valuations

// ---------------------------------------------------------------------------
// Generic CRUD + AI helpers
// ---------------------------------------------------------------------------
export const getAll = (entity) => api.get(`/${entity}`);

export const getById = (entity, id) => api.get(`/${entity}/${id}`);

export const create = (entity, data) => api.post(`/${entity}`, data);

export const update = (entity, id, data) => api.put(`/${entity}/${id}`, data);

export const remove = (entity, id) => api.delete(`/${entity}/${id}`);

export const aiAnalyze = (entity, id) => api.post(`/${entity}/${id}/ai-analyze`);

export const aiAnalyzeAll = (entity) => api.post(`/${entity}/ai-analyze-all`);

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------
export const login = (email, password) =>
  api.post('/auth/login', { email, password });

export const getMe = () => api.get('/auth/me');

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------
export const getStats = () => api.get('/dashboard/stats');

// ---------------------------------------------------------------------------
// AI Center
// ---------------------------------------------------------------------------
export const aiChat = (prompt, context, opts = {}) =>
  api.post('/ai/chat', { prompt, context, session_id: opts.sessionId, use_tools: opts.useTools });

export const listChatSessions = () => api.get('/ai/chat/sessions');
export const getChatMessages = (sessionId) => api.get(`/ai/chat/sessions/${sessionId}/messages`);

// New AI features
export const runAlertScan = (threshold = 60) => api.post(`/ai/alert-scan?threshold=${threshold}`);
export const runAnomalyScan = (drop_threshold_pct = 20) => api.post('/ai/anomaly-scan', { drop_threshold_pct });
export const runBenchmarkRecompute = () => api.post('/ai/benchmark-recompute');
export const goalNarrative = (id) => api.post(`/goals/${id}/weekly-narrative`);

// Apply pass 4 AI features
export const runBestPracticeExtraction = (top_n = 5) => api.post('/ai/best-practice-extraction', { top_n });
export const runLaborCostOptimizer = (opts = {}) => api.post('/ai/labor-cost-optimizer', opts);

// SSE streaming chat
export const streamChat = async (prompt, sessionId, onDelta, onSession, onDone, onError) => {
  const token = localStorage.getItem('token');
  try {
    const resp = await fetch('/api/ai/chat/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ prompt, session_id: sessionId })
    });
    if (!resp.ok || !resp.body) throw new Error('Stream failed');
    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split('\n\n');
      buffer = events.pop() || '';
      for (const ev of events) {
        const line = ev.trim();
        if (!line.startsWith('data:')) continue;
        const data = line.slice(5).trim();
        if (data === '[DONE]') { onDone && onDone(); continue; }
        try {
          const j = JSON.parse(data);
          if (j.session_id) onSession && onSession(j.session_id);
          if (j.delta) onDelta && onDelta(j.delta);
          if (j.error) onError && onError(j.error);
        } catch (_) {}
      }
    }
  } catch (e) { onError && onError(e.message); }
};

// ── Apply pass 5 — extensions backlog ──
export const extPosStatus = () => api.get('/extensions/pos/status');
export const extPosSync = (unit_id) => api.post('/extensions/pos/sync', { unit_id });
export const extSopList = () => api.get('/extensions/sop');
export const extSopUpload = (data) => api.post('/extensions/sop', data);
export const extSopQuery = (query, top_k = 3) => api.post('/extensions/sop/query', { query, top_k });
export const extSopDelete = (id) => api.delete(`/extensions/sop/${id}`);
export const extPnlRollup = (params = {}) => api.post('/extensions/pnl-rollup', params);
export const extMessageSend = (data) => api.post('/extensions/messages', data);
export const extMessageList = (unit_id) => api.get('/extensions/messages', { params: unit_id ? { unit_id } : {} });
export const extMessageRead = (id) => api.post(`/extensions/messages/${id}/read`);
export const extComplianceAudit = (data = {}) => api.post('/extensions/compliance/audit', data);
export const extMentorshipMatch = (unit_id) => api.post('/extensions/mentorship/match', { unit_id });
export const extSupplierNegotiate = (data = {}) => api.post('/extensions/supplier/negotiate', data);

export default api;
