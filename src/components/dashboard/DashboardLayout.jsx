// src/components/dashboard/DashboardLayout.jsx
import React from 'react';
import { useAuth } from '../../context/AuthContext';

/**
 * Professional Dashboard Layout Component
 * Provides consistent layout structure for all dashboard views
 */
const DashboardLayout = ({ 
  children, 
  title, 
  subtitle, 
  actions,
  className = '' 
}) => {
  const { user } = useAuth();

  // Get role-based greeting
  const getRoleGreeting = () => {
    const greetings = {
      citizen: 'Community Member',
      county_official: 'County Official',
      admin: 'Administrator',
      superadmin: 'System Administrator',
      viewer: 'Platform Viewer'
    };
    return greetings[user?.role] || 'User';
  };

  // Get current time-based greeting
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {title || 'E-Mwananchi Dashboard'}
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">
                    {subtitle || `${getTimeBasedGreeting()}, ${user?.first_name || 'User'}. Welcome back, ${getRoleGreeting()}.`}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            {actions && (
              <div className="flex items-center space-x-3">
                {actions}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              © {new Date().getFullYear()} E-Mwananchi Platform. Empowering Kenyan citizens.
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>System Status: <span className="text-green-600 font-medium">Operational</span></span>
              <span>Version: 1.0.0</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DashboardLayout;