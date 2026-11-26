import axios from 'axios';

// Base API config - supports local Vite proxy and remote Render API URL
const baseURL = (import.meta as any).env?.VITE_API_URL || '/api/v1';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add access token header
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

// Interceptor to handle authentication expiration/errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect if specifically on the strict /admin route and 401
    if (error.response && error.response.status === 401) {
      if (window.location.pathname.startsWith('/admin')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user_email');
        localStorage.removeItem('organization_id');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
