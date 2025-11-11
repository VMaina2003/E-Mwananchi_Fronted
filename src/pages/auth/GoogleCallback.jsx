import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';
import { authAPI } from '../../services/api/auth';

const GoogleCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      console.log('Google OAuth Callback:', { code, error });

      if (error) {
        console.error('Google OAuth error:', error);
        showError('Google sign-in failed. Please try again.');
        navigate('/login?error=google_oauth_failed');
        return;
      }

      if (code) {
        try {
          console.log('Attempting Google OAuth with code:', code);
          const response = await authAPI.googleAuth({ code });
          
          console.log('Google OAuth successful:', response);
          showSuccess('Successfully signed in with Google!');
          navigate('/dashboard');
        } catch (error) {
          console.error('Google callback error details:', {
            message: error.message,
            response: error.response,
            code: error.code
          });
          
          let errorMessage = 'Server error. Please try again.';
          
          if (error.message === 'Network Error') {
            errorMessage = 'Cannot connect to server. Please check your internet connection.';
          } else if (error.response?.data?.detail) {
            errorMessage = error.response.data.detail;
          } else if (error.response?.status === 500) {
            errorMessage = 'Server error. Please try again later.';
          }
          
          showError(errorMessage);
          navigate('/login?error=server_error');
        }
      } else {
        showError('No authorization code received');
        navigate('/login?error=no_code');
      }
    };

    handleCallback();
  }, [searchParams, navigate, showSuccess, showError]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Completing Google sign in...</p>
      </div>
    </div>
  );
};

export default GoogleCallback;