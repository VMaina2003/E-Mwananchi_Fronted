import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI } from '../../services/api/auth';
import { useNotification } from '../../context/NotificationContext';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setStatus('error');
        const errorMessage = 'Verification token is missing.';
        setMessage(errorMessage);
        showError(errorMessage);
        return;
      }

      try {
        const response = await authAPI.verifyEmail(token);
        setStatus('success');
        const successMessage = response.detail || 'Email verified successfully!';
        setMessage(successMessage);
        showSuccess(successMessage);
        
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } catch (error) {
        setStatus('error');
        const errorMessage = error.response?.data?.detail || 'Verification failed. Please try again.';
        setMessage(errorMessage);
        showError(errorMessage);
      }
    };

    verifyEmail();
  }, [searchParams, navigate, showSuccess, showError]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-green-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <span className="text-white text-3xl font-bold">E</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Email Verification</h1>
          <p className="text-gray-600 text-lg">E-Mwananchi</p>
        </div>

        {/* Verification Status */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
          {status === 'verifying' && (
            <div className="space-y-4">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto"></div>
              <h2 className="text-xl font-semibold text-gray-900">Verifying your email...</h2>
              <p className="text-gray-600">Please wait while we verify your email address.</p>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-4">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
                <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Email Verified!</h2>
              <p className="text-gray-600">{message}</p>
              <p className="text-sm text-gray-500">Redirecting to login page...</p>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
                <svg className="h-10 w-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Verification Failed</h2>
              <p className="text-gray-600">{message}</p>
              <div className="space-y-3 pt-4">
                <button
                  onClick={() => navigate('/login')}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-xl hover:bg-green-700 transition duration-200 font-medium"
                >
                  Go to Login
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="w-full bg-gray-600 text-white py-3 px-4 rounded-xl hover:bg-gray-700 transition duration-200 font-medium"
                >
                  Create New Account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;