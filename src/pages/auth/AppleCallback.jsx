import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const AppleCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const id_token = searchParams.get('id_token');
      const error = searchParams.get('error');

      console.log('Apple Sign In Callback:', { code, id_token, error });

      if (error) {
        console.error('Apple Sign In error:', error);
        navigate('/login?error=apple_oauth_failed');
        return;
      }

      if (code || id_token) {
        try {
          // Send the authorization code to your backend
          const response = await fetch('http://127.0.0.1:8000/api/auth/apple/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              code, 
              id_token,
              user: {} // Apple may provide user info in a separate parameter
            }),
          });

          const data = await response.json();

          if (response.ok) {
            // Save tokens and user data
            localStorage.setItem('access_token', data.access);
            localStorage.setItem('refresh_token', data.refresh);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            console.log('Apple Sign In successful:', data);
            navigate('/dashboard');
          } else {
            console.error('Backend error:', data);
            navigate('/login?error=authentication_failed');
          }
        } catch (error) {
          console.error('Apple callback error:', error);
          navigate('/login?error=server_error');
        }
      } else {
        navigate('/login?error=no_authorization_data');
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

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