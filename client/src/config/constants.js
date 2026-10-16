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
    RESOLVE: (id) => `${API_BASE_URL}/api/alerts/${id}/resolve`,
    RESOLVE_ALL: `${API_BASE_URL}/api/alerts/resolve-all`,
    ACKNOWLEDGE: (id) => `${API_BASE_URL}/api/alerts/${id}/acknowledge`,
    UNACKNOWLEDGE: (id) => `${API_BASE_URL}/api/alerts/${id}/unacknowledge`,
  },
  USERS: {
    LIST: `${API_BASE_URL}/api/users`,
    PROFILE: `${API_BASE_URL}/api/users/profile`,
  },
  THRESHOLDS: `${API_BASE_URL}/api/thresholds`,
  HOST: {
    INFO: `${API_BASE_URL}/api/host/info`,
    TELEMETRY: `${API_BASE_URL}/api/host/telemetry`,
  },
  RULES: {
    LIST: `${API_BASE_URL}/api/rules`,
    CREATE: `${API_BASE_URL}/api/rules`,
    UPDATE: (id) => `${API_BASE_URL}/api/rules/${id}`,
    DELETE: (id) => `${API_BASE_URL}/api/rules/${id}`,
    LOGS: `${API_BASE_URL}/api/rules/logs`,
  },
  DIAGNOSES: {
    LIST: `${API_BASE_URL}/api/diagnoses`,
    GENERATE: (alertId) => `${API_BASE_URL}/api/diagnoses/generate/${alertId}`,
    APPROVE: (id) => `${API_BASE_URL}/api/diagnoses/${id}/approve`,
    REJECT: (id) => `${API_BASE_URL}/api/diagnoses/${id}/reject`,
    OUTCOME: (id) => `${API_BASE_URL}/api/diagnoses/${id}/outcome`,
    ACCURACY: `${API_BASE_URL}/api/diagnoses/accuracy`,
  }
};