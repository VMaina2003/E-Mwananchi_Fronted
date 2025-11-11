import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';
import { authAPI } from '../../services/api/auth';

const AppleCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const id_token = searchParams.get('id_token');
      const error = searchParams.get('error');

      console.log('Apple Sign In Callback:', { code, id_token, error });

      if (error) {
        console.error('Apple Sign In error:', error);
        showError('Apple sign-in failed. Please try again.');
        navigate('/login?error=apple_oauth_failed');
        return;
      }

      if (code || id_token) {
        try {
          const response = await authAPI.appleAuth({ 
            code, 
            id_token,
            user: {}
          });
          
          console.log('Apple Sign In successful:', response);
          showSuccess('Successfully signed in with Apple!');
          navigate('/dashboard');
        } catch (error) {
          console.error('Apple callback error:', error);
          const errorMessage = error.response?.data?.detail || 'Server error. Please try again.';
          showError(errorMessage);
          navigate('/login?error=server_error');
        }
      } else {
        showError('No authorization data received');
        navigate('/login?error=no_authorization_data');
      }
    };

    handleCallback();
  }, [searchParams, navigate, showSuccess, showError]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Completing Apple sign in...</p>
      </div>
    </div>
  );
};

export default AppleCallback;