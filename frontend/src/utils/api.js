import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const api = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Initialize token if exists
const token = getAuthToken();
if (token) {
  setAuthToken(token);
}

// Auth APIs
export const authAPI = {
  signup: (data) => api.post('/api/auth/signup', data),
  login: (data) => api.post('/api/auth/login', data),
  getMe: () => api.get('/api/auth/me')
};

// Contact APIs
export const contactAPI = {
  getAll: () => api.get('/api/contacts'),
  getOne: (id) => api.get(`/api/contacts/${id}`),
  create: (data) => api.post('/api/contacts', data),
  update: (id, data) => api.put(`/api/contacts/${id}`, data),
  delete: (id) => api.delete(`/api/contacts/${id}`),
  importCSV: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/api/contacts/import/csv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};

// Reminder APIs
export const reminderAPI = {
  getAll: () => api.get('/api/reminders'),
  getUpcoming: (days = 30) => api.get(`/api/reminders/upcoming?days=${days}`),
  create: (data) => api.post('/api/reminders', data),
  delete: (id) => api.delete(`/api/reminders/${id}`)
};

// Message APIs
export const messageAPI = {
  generate: (data) => api.post('/api/messages/generate', data),
  sendEmail: (data) => api.post('/api/email/send', data)
};

// Analytics APIs
export const analyticsAPI = {
  getDashboard: () => api.get('/api/analytics/dashboard'),
  getStaleContacts: (months = 3) => api.get(`/api/analytics/stale-contacts?months=${months}`)
};

export default api;