import axios from 'axios';

// Base axios instance — all API calls go through this
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request automatically
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('memoryverse_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global error handling — redirect to login on 401
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('memoryverse_token');
      window.location.href = '/login';
    }
    const message = error.response?.data?.message || error.message || 'Something went wrong.';
    return Promise.reject(new Error(message));
  },
);

export default axiosInstance;
