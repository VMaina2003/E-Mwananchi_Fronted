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
        // Verify token is still valid
        await authAPI.verifyToken(token);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      // Token is invalid, logout user
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setError('');
      setLoading(true);
      
      const response = await authAPI.login({ email, password });
      setUser(response.user);
      
      return { success: true, data: response };
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Login failed. Please try again.';
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
      const errorMessage = error.response?.data || { detail: 'Registration failed. Please try again.' };
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setError('');
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
      const errorMessage = error.response?.data || { detail: 'Failed to reset password.' };
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

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    requestPasswordReset,
    resetPassword,
    resendVerification,
    clearError,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};