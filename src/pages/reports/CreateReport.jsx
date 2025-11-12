// src/pages/reports/CreateReport.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/common/Layout';
import CreateReportForm from '../../components/reports/CreateReportForm/index';

/**
 * CreateReport Page Component
 * 
 * Professional, production-ready report creation page with:
 * - Authentication and authorization checks
 * - Enhanced typography and layout
 * - Professional styling and UX
 * - Mobile-responsive design
 * - Accessibility compliance
 * - Modern notification system
 */
const CreateReport = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { showSuccess, showError, showInfo, showWarning } = useNotification();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Authentication and authorization guard
  useEffect(() => {
    if (isLoading) return; // Wait for auth check to complete

    if (!isAuthenticated || !user) {
      showInfo('Please log in to create a report', 'Authentication Required');
      navigate('/login', { 
        replace: true,
        state: { from: '/reports/create' }
      });
      return;
    }

    const allowedRoles = ['citizen', 'county_official', 'admin', 'superadmin'];
    if (!allowedRoles.includes(user.role)) {
      showError('You do not have permission to create reports', 'Access Denied');
      navigate('/dashboard', { replace: true });
      return;
    }
  }, [isAuthenticated, user, isLoading, navigate, showInfo, showError]);

  // Submission state handlers
  const handleSubmissionStart = () => {
    setIsSubmitting(true);
    showInfo('Processing your report...', 'Submitting Report');
  };

  const handleSubmissionComplete = (success, reportId = null, errorMessage = null) => {
    setIsSubmitting(false);
    
    if (success && reportId) {
      showSuccess(
        'Your report has been successfully submitted and is being processed',
        'Report Created Successfully'
      );
      
      // Redirect to report detail page on success
      setTimeout(() => {
        navigate(`/reports/${reportId}`, { 
          replace: true,
          state: { created: true }
        });
      }, 2000);
    } else if (errorMessage) {
      showError(
        errorMessage || 'Failed to submit report. Please try again.',
        'Submission Failed'
      );
    }
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Verifying access...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Don't render if not authenticated (will redirect in useEffect)
  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header Section */}
          <header className="text-center mb-12">
            {/* Icon */}
            <div 
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg mb-6 transition-transform hover:scale-105 duration-200"
              aria-hidden="true"
            >
              <svg 
                className="w-10 h-10 text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" 
                />
              </svg>
            </div>
            
            {/* Main Title */}
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
              Report Community Issue
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-6">
              Help improve your community by reporting issues that need attention. 
              Your report will be automatically analyzed and forwarded to the relevant county department.
            </p>

            {/* User Welcome Banner */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 inline-block max-w-2xl">
              <p className="text-lg text-gray-700">
                Welcome, <span className="font-semibold text-green-600 capitalize">{user.first_name || user.email}</span>! 
                <span className="text-gray-500 ml-2 capitalize">
                  You're reporting as a {user.role?.replace(/_/g, ' ')}
                  {user.county && ` from ${user.county.name || user.county}`}
                </span>
              </p>
            </div>
          </header>

          {/* Submission Progress Overlay */}
          {isSubmitting && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300"
              role="alert"
              aria-live="polite"
            >
              <div className="bg-white rounded-2xl p-8 mx-4 max-w-md w-full shadow-2xl">
                <div className="flex items-center space-x-4">
                  <div 
                    className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 flex-shrink-0"
                    aria-hidden="true"
                  ></div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Processing Your Report
                    </h3>
                    <p className="text-gray-600 text-lg">
                      AI is analyzing your report and assigning it to the right department...
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Features Grid */}
          <section 
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10"
            aria-label="Report submission features"
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center hover:shadow-md transition-shadow duration-200">
              <div className="text-2xl mb-3" aria-hidden="true">🤖</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                AI-Powered Analysis
              </h3>
              <p className="text-gray-600">
                Smart categorization and automatic department assignment
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center hover:shadow-md transition-shadow duration-200">
              <div className="text-2xl mb-3" aria-hidden="true">📍</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Location-Based Routing
              </h3>
              <p className="text-gray-600">
                Automatically forwarded to your county officials
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center hover:shadow-md transition-shadow duration-200">
              <div className="text-2xl mb-3" aria-hidden="true">📊</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Progress Tracking
              </h3>
              <p className="text-gray-600">
                Real-time updates on your report's status
              </p>
            </div>
          </section>

          {/* Main Form Container */}
          <main>
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              {/* Form Header */}
              <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 lg:px-8 py-6 lg:py-8">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div>
                    <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                      Create New Report
                    </h2>
                    <p className="text-green-100 text-lg">
                      Provide detailed information about the issue you've observed
                    </p>
                  </div>
                  <div 
                    className="flex items-center space-x-2 bg-green-500 bg-opacity-20 px-4 py-2 rounded-full self-start lg:self-auto"
                    aria-label="Progress: Step 1 of 4"
                  >
                    <span className="text-green-100 text-sm font-medium">
                      Step 1 of 4
                    </span>
                  </div>
                </div>
              </div>

              {/* Form Content */}
              <div className="p-6 lg:p-8">
                {/* Important Notice */}
                <div 
                  className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8"
                  role="alert"
                >
                  <div className="flex items-start space-x-3">
                    <svg 
                      className="w-6 h-6 text-yellow-600 mt-0.5 flex-shrink-0" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" 
                      />
                    </svg>
                    <div>
                      <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                        Before You Report
                      </h3>
                      <ul className="text-yellow-700 space-y-1 text-base list-disc list-inside">
                        <li>Provide clear, specific details about the issue</li>
                        <li>Include photos as evidence when possible</li>
                        <li>Be accurate with location information</li>
                        <li>Choose the most relevant category for your issue</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Form Component */}
                <CreateReportForm 
                  onSubmissionStart={handleSubmissionStart}
                  onSubmissionComplete={handleSubmissionComplete}
                  user={user}
                />
              </div>
            </div>
          </main>

          {/* Support Information */}
          <footer className="mt-12 bg-white rounded-2xl border border-gray-200 p-6 lg:p-8">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <svg 
                  className="w-8 h-8 text-gray-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Need Help Reporting?
                </h3>
                <div className="text-gray-700 space-y-3 text-base">
                  <p>
                    <strong className="font-semibold">What to include:</strong> Clear description, 
                    specific location, photos if available, and any relevant details about the issue's impact.
                  </p>
                  <p>
                    <strong className="font-semibold">Response time:</strong> Reports are typically 
                    reviewed within 24-48 hours. You'll receive notifications about your report's progress.
                  </p>
                  <p>
                    <strong className="font-semibold">Emergency issues:</strong> For immediate dangers 
                    or emergencies, please contact your local authorities directly.
                  </p>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </Layout>
  );
};

export default CreateReport;