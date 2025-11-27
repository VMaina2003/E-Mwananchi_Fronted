import axios from 'axios';

// Use environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/auth/';

console.log('Full API Base URL:', API_BASE_URL);

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

// Notification handler - will be set by the application
let notificationHandler = null;

// Set notification handler from the app
export const setNotificationHandler = (handler) => {
  notificationHandler = handler;
};

// Show notification using the app's notification system
const showNotification = (message, type = 'error') => {
  if (notificationHandler) {
    notificationHandler(message, type);
  } else {
    // Fallback to console if notification handler not set
    console.log(`${type.toUpperCase()}: ${message}`);
  }
};

// Extract error message from various error formats
const getErrorMessage = (error) => {
  if (!error) return 'An unknown error occurred';
  
  // Handle axios error response
  if (error.response?.data) {
    const errorData = error.response.data;
    
    // Handle Django REST framework validation errors
    if (typeof errorData === 'object') {
      // Check for specific field errors
      const fieldErrors = [];
      
      for (const [field, messages] of Object.entries(errorData)) {
        if (Array.isArray(messages)) {
          // Handle array of error messages for a field
          if (messages.length > 0) {
            fieldErrors.push(`${field.charAt(0).toUpperCase() + field.slice(1)}: ${messages.join(', ')}`);
          }
        } else if (typeof messages === 'string') {
          // Handle single string error for a field
          fieldErrors.push(`${field.charAt(0).toUpperCase() + field.slice(1)}: ${messages}`);
        } else if (field === 'detail') {
          // Handle detail message
          return messages;
        }
      }
      
      if (fieldErrors.length > 0) {
        return fieldErrors.join('; ');
      }
      
      // Handle non_field_errors
      if (errorData.non_field_errors) {
        return Array.isArray(errorData.non_field_errors) 
          ? errorData.non_field_errors.join(', ')
          : errorData.non_field_errors;
      }
    }
    
    // Handle string responses
    if (typeof errorData === 'string') {
      return errorData;
    }
    
    // Default to detail message or generic error
    return errorData.detail || 'Request failed with server error';
  }
  
  // Handle network errors
  if (error.message) {
    if (error.message.includes('Network Error')) {
      return 'Network error: Please check your internet connection';
    }
    if (error.message.includes('timeout')) {
      return 'Request timeout: Server is taking too long to respond';
    }
    return error.message;
  }
  
  return 'An unexpected error occurred';
};

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log('API Request:', {
      url: config.baseURL + config.url,
      method: config.method,
      data: config.data
    });
    
    return config;
  },
  (error) => {
    console.error('Request Interceptor Error:', error);
    const errorMessage = getErrorMessage(error);
    showNotification(errorMessage, 'error');
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('API Response Success:', {
      status: response.status,
      url: response.config.url
    });
    return response;
  },
  async (error) => {
    console.error('API Response Error:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message,
      data: error.response?.data
    });

    const errorMessage = getErrorMessage(error);
    
    // Show notification for all errors
    showNotification(errorMessage, 'error');

    const originalRequest = error.config;

    // Handle token refresh for 401 errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}token/refresh/`, {
            refresh: refreshToken,
          });

          const { access } = response.data;
          localStorage.setItem('access_token', access);
          originalRequest.headers.Authorization = `Bearer ${access}`;

          return api(originalRequest);
        }
      } catch (refreshError) {
        console.log('Token refresh failed:', refreshError);
        showNotification('Session expired. Please login again.', 'warning');
        
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        
        // Redirect to login after a delay
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
        
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
    
    showNotification('Authentication successful!', 'success');
  }
  return response.data;
};

// API functions with comprehensive error handling
export const authAPI = {
  register: async (userData) => {
    try {
      console.log('Registering user:', { 
        email: userData.email, 
        first_name: userData.first_name 
      });
      const response = await api.post('/register/', userData);
      showNotification('Registration successful! Please check your email for verification.', 'success');
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  login: async (credentials) => {
    try {
      console.log('Logging in user:', { email: credentials.email });
      const response = await api.post('/login/', credentials);
      return handleAuthSuccess(response);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Google OAuth
  googleAuth: async (data) => {
    try {
      console.log('Google OAuth attempt');
      const response = await api.post('/google/', data);
      return handleAuthSuccess(response);
    } catch (error) {
      console.error('Google OAuth error:', error);
      throw error;
    }
  },

  // Apple OAuth
  appleAuth: async (data) => {
    try {
      console.log('Apple OAuth attempt');
      const response = await api.post('/apple/', data);
      return handleAuthSuccess(response);
    } catch (error) {
      console.error('Apple OAuth error:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (refreshToken) {
        await api.post('/logout/', { refresh_token: refreshToken });
      }

      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      
      showNotification('Logged out successfully', 'success');
      
      // Redirect to home page after logout
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
      
    } catch (error) {
      console.error('Logout error:', error);
      // Even if API logout fails, clear local storage
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      showNotification('Logged out successfully', 'success');
      
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    }
  },

  verifyEmail: async (token) => {
    try {
      console.log('Verifying email with token');
      const response = await api.post('/verify-email/', { token });
      showNotification('Email verified successfully! You can now login.', 'success');
      return response.data;
    } catch (error) {
      console.error('Email verification error:', error);
      throw error;
    }
  },

  resendVerification: async (email) => {
    try {
      console.log('Resending verification email:', email);
      const response = await api.post('/resend-verification/', { email });
      showNotification('Verification email sent successfully!', 'success');
      return response.data;
    } catch (error) {
      console.error('Resend verification error:', error);
      throw error;
    }
  },

  requestPasswordReset: async (email) => {
    try {
      console.log('Requesting password reset for:', email);
      const response = await api.post('/request-password-reset/', { email });
      showNotification('If an account with that email exists, a password reset link has been sent.', 'success');
      return response.data;
    } catch (error) {
      console.error('Password reset request error:', error);
      throw error;
    }
  },

  resetPassword: async (token, newPassword, confirmPassword) => {
    try {
      console.log('Resetting password');
      const response = await api.post('/reset-password/', {
        token,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      showNotification('Password reset successfully! You can now login with your new password.', 'success');
      return response.data;
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  },

  getCurrentUser: async () => {
    try {
      console.log('Fetching current user');
      const response = await api.get('/me/');
      return response.data;
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  },

  verifyToken: async () => {
    try {
      console.log('Verifying token');
      const response = await api.get('/token/verify/');
      return response.data;
    } catch (error) {
      console.error('Token verification error:', error);
      throw error;
    }
  }
};

export default api;