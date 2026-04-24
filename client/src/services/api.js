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
export const aiChat = (prompt, context) =>
  api.post('/ai/chat', { prompt, context });

export default api;
