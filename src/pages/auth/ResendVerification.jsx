import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

const ResendVerification = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  
  const { resendVerification, loading } = useAuth();
  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const result = await resendVerification(email);
      
      if (result.success) {
        setIsSuccess(true);
        const successMessage = result.data?.detail || 'Verification email sent successfully!';
        setMessage(successMessage);
        showSuccess(successMessage);
      } else {
        setIsSuccess(false);
        const errorMessage = result.error?.detail || 'Failed to send verification email.';
        setMessage(errorMessage);
        showError(errorMessage);
      }
    } catch (error) {
      setIsSuccess(false);
      const errorMessage = 'An unexpected error occurred. Please try again.';
      setMessage(errorMessage);
      showError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-green-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <span className="text-white text-3xl font-bold">E</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Resend Verification</h1>
          <p className="text-gray-600 text-lg">Get a new verification email</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          {message && (
            <div className={`p-4 rounded-xl mb-6 flex items-center ${
              isSuccess 
                ? 'bg-green-50 border border-green-200 text-green-700' 
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
              </svg>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
                placeholder="Enter your email address"
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-xl hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 font-medium"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </span>
              ) : (
                'Resend Verification Email'
              )}
            </button>
          </form>

          <div className="mt-6 space-y-3 text-center">
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-gray-600 text-white py-2 px-4 rounded-xl hover:bg-gray-700 transition duration-200 font-medium"
            >
              Back to Login
            </button>
            <button
              onClick={() => navigate('/register')}
              className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-xl hover:bg-gray-50 transition duration-200 font-medium"
            >
              Create New Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResendVerification;