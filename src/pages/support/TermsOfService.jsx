// pages/legal/TermsOfService.jsx
import React from 'react';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-lg text-gray-600 mb-8">
            This page is coming soon. We're finalizing our terms to ensure clarity and fairness for all users.
          </p>
          <div className="bg-white rounded-lg shadow-md p-8 text-left">
            <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">Terms of Service Coming Soon</h2>
            <p className="text-gray-600 mb-4">
              Our terms of service will outline the rules and guidelines for using the E-Mwananchi platform, including user responsibilities and platform limitations.
            </p>
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                We're committed to creating fair and transparent terms that protect both users and the platform while promoting responsible civic engagement.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;