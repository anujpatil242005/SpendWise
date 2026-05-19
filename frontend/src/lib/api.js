import axios from 'axios';

let tokenResolver = async () => {
  // Safe local fallback
  return localStorage.getItem('privy_auth_token') || null;
};

// Expose setter so AuthContext can dynamically inject the Privy token fetcher
export const setTokenResolver = (resolver) => {
  tokenResolver = resolver;
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Async interceptor to automatically fetch and inject fresh JWT tokens
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await tokenResolver();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      console.warn('[API Interceptor Warning] Failed to resolve auth token:', err.message);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || 'An unexpected network error occurred';
    return Promise.reject(new Error(message));
  }
);

export default api;
