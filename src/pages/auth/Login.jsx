import React from 'react';
import LoginForm from '../../components/auth/LoginForm';

const Login = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-green-600 rounded-full flex items-center justify-center mb-4 shadow-lg transition-transform hover:scale-105">
            <span className="text-white text-3xl font-bold">E</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">E-Mwananchi</h1>
          <p className="text-gray-600 text-lg">Citizen Engagement Platform</p>
          <p className="text-sm text-gray-500 mt-2">Sign in to your account</p>
        </div>

        {/* Login Form */}
        <LoginForm />

        {/* Additional Links (Optional) */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <a href="/register" className="font-medium text-green-600 hover:text-green-500 transition-colors">
              Sign up here
            </a>
          </p>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            © 2024 E-Mwananchi. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;