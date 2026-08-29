// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    REGISTER: `${API_BASE_URL}/api/auth/register`,
    LOGOUT: `${API_BASE_URL}/api/auth/logout`,
  },
  SERVERS: {
    LIST: `${API_BASE_URL}/api/servers`,
    DETAIL: (id) => `${API_BASE_URL}/api/servers/${id}`,
    CREATE: `${API_BASE_URL}/api/servers`,
    UPDATE: (id) => `${API_BASE_URL}/api/servers/${id}`,
    DELETE: (id) => `${API_BASE_URL}/api/servers/${id}`,
  },
  METRICS: {
    CURRENT: `${API_BASE_URL}/api/metrics/current`,
    HISTORY: `${API_BASE_URL}/api/metrics/history`,
    HEALTH: `${API_BASE_URL}/api/metrics/health`,
  },
  ALERTS: {
    LIST: `${API_BASE_URL}/api/alerts`,
    CREATE: `${API_BASE_URL}/api/alerts`,
    UPDATE: (id) => `${API_BASE_URL}/api/alerts/${id}`,
  },
  USERS: {
    LIST: `${API_BASE_URL}/api/users`,
    PROFILE: `${API_BASE_URL}/api/users/profile`,
  }
};