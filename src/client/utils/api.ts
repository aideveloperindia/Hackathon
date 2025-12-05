import axios from 'axios';

// In production (Vercel), use relative /api path
// In development, Vite proxy handles /api -> http://localhost:5001
// So we can use /api in both cases
const API_URL = import.meta.env.PROD 
  ? '/api' 
  : (import.meta.env.VITE_API_URL || '/api');

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect on 401 if we're not on a login/register page
    // This prevents redirecting away from login page when password is wrong
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      const isAuthPage = currentPath.includes('/login') || currentPath.includes('/register');
      
      // If we have a token but got 401, it means token expired - clear it
      if (localStorage.getItem('token') && !isAuthPage) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
      }
      // If on auth page, don't redirect - let the page handle the error
    }
    return Promise.reject(error);
  }
);

export default api;

