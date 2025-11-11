import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const GoogleCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      console.log('Google OAuth Callback:', { code, error });

      if (error) {
        console.error('Google OAuth error:', error);
        navigate('/login?error=google_oauth_failed');
        return;
      }

      if (code) {
        try {
          // Send the authorization code to your backend
          const response = await fetch('http://127.0.0.1:8000/api/auth/google/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code }),
          });

          const data = await response.json();

          if (response.ok) {
            // Save tokens and user data
            localStorage.setItem('access_token', data.access);
            localStorage.setItem('refresh_token', data.refresh);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            console.log('Google OAuth successful:', data);
            navigate('/dashboard');
          } else {
            console.error('Backend error:', data);
            navigate('/login?error=authentication_failed');
          }
        } catch (error) {
          console.error('Google callback error:', error);
          navigate('/login?error=server_error');
        }
      } else {
        navigate('/login?error=no_code');
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

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