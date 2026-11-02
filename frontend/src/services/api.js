import axios from 'axios';
import { getSocketId } from './socket';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const currentTenantId = localStorage.getItem('currentTenantId');
    if (currentTenantId) {
      config.headers['x-tenant-id'] = currentTenantId;
    }

    const currentOrgId = localStorage.getItem('currentOrgId');
    if (currentOrgId) {
      config.headers['x-organization-id'] = currentOrgId;
    }

    const socketId = getSocketId();
    if (socketId) {
      config.headers['x-socket-id'] = socketId;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      if (status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
          window.location.href = '/login';
        }
      }
      return Promise.reject(data || error.message);
    }
    return Promise.reject({ message: error.message || 'Network error' });
  }
);

export default api;
