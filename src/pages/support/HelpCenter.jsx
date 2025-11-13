// pages/support/HelpCenter.jsx
import React from 'react';

const HelpCenter = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Help Center</h1>
          <p className="text-lg text-gray-600 mb-8">
            This page is coming soon. We're working hard to provide you with comprehensive help resources.
          </p>
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Under Development</h2>
            <p className="text-gray-600">
              Our help center will include FAQs, user guides, and troubleshooting resources to help you make the most of E-Mwananchi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;