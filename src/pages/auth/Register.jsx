import React from 'react';
import RegisterForm from '../../components/auth/RegisterForm';

const Register = () => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-green-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <span className="text-white text-3xl font-bold">E</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">E-Mwananchi</h1>
          <p className="text-gray-600 text-lg">Join Our Community</p>
        </div>

        {/* Registration Form */}
        <RegisterForm />

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-gray-500">
            © 2024 E-Mwananchi. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;