import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  withCredentials: true,
  // Do NOT set Content-Type globally — let axios set it per request
  // (FormData needs multipart/form-data with boundary, JSON needs application/json)
});

// Attach JWT token + set Content-Type intelligently per request
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('memoryverse_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Only set JSON content-type if the body is NOT FormData
  // For FormData, the browser sets multipart/form-data with boundary automatically
  if (!(config.data instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json';
  } else {
    // Remove any existing Content-Type so browser can set it with the correct boundary
    delete config.headers['Content-Type'];
  }

  return config;
});

// Global response error handler
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Redirect to login on 401 (expired/invalid token)
    if (error.response?.status === 401) {
      localStorage.removeItem('memoryverse_token');
      window.location.href = '/login';
    }
    const message =
      error.response?.data?.message ||
      error.message ||
      'Something went wrong.';
    return Promise.reject(new Error(message));
  },
);

export default axiosInstance;
