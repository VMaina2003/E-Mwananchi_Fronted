import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Check if user is logged in on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const storedUser = localStorage.getItem('user');

      if (token && storedUser) {
        try {
          const userData = await authAPI.getCurrentUser();
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        } catch (error) {
          console.log('Token invalid, logging out:', error);
          logout();
        }
      }
    } catch (error) {
      console.log('Auth check failed:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSuccess = (response) => {
    if (response.access && response.refresh) {
      localStorage.setItem('access_token', response.access);
      localStorage.setItem('refresh_token', response.refresh);
      
      if (response.user) {
        setUser(response.user);
        localStorage.setItem('user', JSON.stringify(response.user));
      } else {
        console.error('No user data in auth response');
        throw new Error('Authentication failed: No user data received');
      }
    } else {
      throw new Error('Authentication failed: No tokens received');
    }
  };

  const loginWithGoogle = async (credentialResponse) => {
    try {
      setError('');
      setLoading(true);
      
      const response = await authAPI.googleAuth({
        token: credentialResponse.credential
      });
      
      handleAuthSuccess(response);
      return { success: true, data: response };
    } catch (error) {
      const errorMessage = error.response?.data?.detail || error.message || 'Google login failed. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const loginWithApple = async (response) => {
    try {
      setError('');
      setLoading(true);
      
      if (!response.authorization?.id_token) {
        throw new Error('Invalid Apple login response');
      }

      const authResponse = await authAPI.appleAuth({
        id_token: response.authorization.id_token,
        user: response.user || {}
      });
      
      handleAuthSuccess(authResponse);
      return { success: true, data: authResponse };
    } catch (error) {
      const errorMessage = error.response?.data?.detail || error.message || 'Apple login failed. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setError('');
      setLoading(true);
      
      const response = await authAPI.login({ email, password });
      handleAuthSuccess(response);
      
      return { success: true, data: response };
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Login failed. Please check your credentials.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setError('');
      setLoading(true);
      
      const response = await authAPI.register(userData);
      return { success: true, data: response };
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Registration failed. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (user) {
        await authAPI.logout();
      }
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      setUser(null);
      setError('');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  };

  const requestPasswordReset = async (email) => {
    try {
      setError('');
      const response = await authAPI.requestPasswordReset(email);
      return { success: true, data: response };
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to request password reset.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const resetPassword = async (token, newPassword, confirmPassword) => {
    try {
      setError('');
      const response = await authAPI.resetPassword(token, newPassword, confirmPassword);
      return { success: true, data: response };
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to reset password.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const resendVerification = async (email) => {
    try {
      setError('');
      const response = await authAPI.resendVerification(email);
      return { success: true, data: response };
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to resend verification email.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const clearError = () => setError('');

  const updateUser = (updatedUserData) => {
    setUser(updatedUserData);
    localStorage.setItem('user', JSON.stringify(updatedUserData));
  };

  // FIXED: Add the missing value object
  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    loginWithGoogle,
    loginWithApple,
    requestPasswordReset,
    resetPassword,
    resendVerification,
    clearError,
    updateUser,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}> {/* FIXED: Now has value prop */}
      {children}
    </AuthContext.Provider>
  );
};

// Export the context for direct access if needed
export default AuthContext;