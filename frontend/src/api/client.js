import axios from 'axios';

// In dev, Vite proxies '/api' to the local backend (see vite.config.js), so a relative
// path works with no extra config. In production the frontend and backend are usually
// deployed separately, so VITE_API_URL should point at the deployed API's base URL,
// e.g. https://api.example.com/api.
const baseURL = import.meta.env.VITE_API_URL || '/api';

const client = axios.create({ baseURL });

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// If a request comes back unauthorized, the token is stale or expired — clear it so
// the app doesn't keep sending a dead token, and bounce to sign-in unless we're
// already there (avoids a redirect loop on the login page's own failed attempts).
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && localStorage.getItem('token')) {
      localStorage.removeItem('token');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default client;
