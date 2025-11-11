import axios from 'axios';

// Use environment variables - FIXED: Ensure it includes /auth
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/auth';

console.log('Full API Base URL:', API_BASE_URL); // Debug log

// Validate the API base URL
if (!API_BASE_URL.includes('/auth')) {
  console.warn('Warning: API_BASE_URL might be missing /auth path. Current:', API_BASE_URL);
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor with debug logging
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('Full API Request URL:', config.baseURL + config.url);
    console.log('API Request Data:', config.data);
    return config;
  },
  (error) => {
    console.error('Request Interceptor Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor with better error handling
api.interceptors.response.use(
  (response) => {
    console.log('API Response Success:', response.status, response.config.url);
    return response;
  },
  async (error) => {
    console.error('API Response Error Details:', {
      status: error.response?.status,
      url: error.config?.baseURL + error.config?.url,
      message: error.message,
      data: error.response?.data
    });
    
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/token/refresh/`, {
            refresh: refreshToken,
          });

          const { access } = response.data;
          localStorage.setItem('access_token', access);
          originalRequest.headers.Authorization = `Bearer ${access}`;

          return api(originalRequest);
        }
      } catch (refreshError) {
        console.log('Token refresh failed:', refreshError);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Helper function to handle successful authentication
const handleAuthSuccess = (response) => {
  if (response.data.access && response.data.refresh) {
    localStorage.setItem('access_token', response.data.access);
    localStorage.setItem('refresh_token', response.data.refresh);
    
    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
  }
  return response.data;
};

// API functions
export const authAPI = {
  register: async (userData) => {
    const response = await api.post('/register/', userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/login/', credentials);
    return handleAuthSuccess(response);
  },

  // Google OAuth
  googleAuth: async (data) => {
    const response = await api.post('/google/', data);
    return handleAuthSuccess(response);
  },

  // Apple OAuth
  appleAuth: async (data) => {
    const response = await api.post('/apple/', data);
    return handleAuthSuccess(response);
  },

  logout: async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (refreshToken) {
      try {
        await api.post('/logout/', { refresh_token: refreshToken });
      } catch (error) {
        console.log('Logout error:', error);
      }
    }

    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },

  verifyEmail: async (token) => {
    const response = await api.post('/verify-email/', { token });
    return response.data;
  },

  resendVerification: async (email) => {
    const response = await api.post('/resend-verification/', { email });
    return response.data;
  },

  requestPasswordReset: async (email) => {
    const response = await api.post('/request-password-reset/', { email });
    return response.data;
  },

  resetPassword: async (token, newPassword, confirmPassword) => {
    const response = await api.post('/reset-password/', {
      token,
      new_password: newPassword,
      confirm_password: confirmPassword,
    });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/me/');
    return response.data;
  },

  verifyToken: async () => {
    const response = await api.get('/token/verify/');
    return response.data;
  }
};

export default api;