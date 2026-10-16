import { API_BASE_URL } from '../config/constants.js';

// API utility functions
export const apiRequest = async (endpoint, options = {}) => {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

export const get = (endpoint, options = {}) => 
  apiRequest(endpoint, { method: 'GET', ...options });

export const post = (endpoint, data, options = {}) => 
  apiRequest(endpoint, { 
    method: 'POST', 
    body: JSON.stringify(data), 
    ...options 
  });

export const put = (endpoint, data, options = {}) => 
  apiRequest(endpoint, { 
    method: 'PUT', 
    body: JSON.stringify(data), 
    ...options 
  });

export const del = (endpoint, options = {}) => 
  apiRequest(endpoint, { method: 'DELETE', ...options });