// src/pages/reports/CreateReport.jsx - PRODUCTION READY
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/common/Layout';
import CreateReportForm from '../../components/reports/CreateReportForm/index';

const CreateReport = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { showSuccess, showError, showInfo } = useNotification();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Authentication and authorization guard
  useEffect(() => {
    if (isLoading) return;

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

  const handleSubmissionStart = () => {
    setIsSubmitting(true);
    showInfo('Processing your report...', 'Submitting Report');
  };

  const handleSubmissionComplete = (success, reportId = null, errorMessage = null) => {
    setIsSubmitting(false);
    
    if (success && reportId) {
      showSuccess(
        'Your report has been successfully submitted and is being processed. You will receive email confirmation shortly.',
        'Report Created Successfully'
      );
      
      setTimeout(() => {
        navigate(`/reports/${reportId}`, { 
          replace: true,
          state: { created: true }
        });
      }, 3000);
    } else {
      showError(
        errorMessage || 'Failed to submit report. Please check your connection and try again.',
        'Submission Failed'
      );
    }
  };

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

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header Section */}
          <header className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-600 rounded-2xl shadow-lg mb-6">
              <svg 
                className="w-10 h-10 text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" 
                />
              </svg>
            </div>
            
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Report Community Issue
            </h1>
            
            <p className="text-lg lg:text-xl text-gray-600 max-w-4xl mx-auto mb-6">
              Help improve your community by reporting issues that need attention. 
              Your report will be automatically analyzed and forwarded to the relevant county department.
            </p>

            <div className="bg-white rounded-lg border border-gray-200 p-6 inline-block max-w-2xl">
              <p className="text-gray-700">
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
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-8 mx-4 max-w-md w-full shadow-2xl">
                <div className="flex items-center space-x-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 flex-shrink-0"></div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Processing Your Report
                    </h3>
                    <p className="text-gray-600">
                      AI is analyzing your report and assigning it to the right department...
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Features Grid */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                AI-Powered Analysis
              </h3>
              <p className="text-gray-600 text-sm">
                Smart categorization and automatic department assignment
              </p>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Location-Based Routing
              </h3>
              <p className="text-gray-600 text-sm">
                Automatically forwarded to your county officials
              </p>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Progress Tracking
              </h3>
              <p className="text-gray-600 text-sm">
                Real-time updates on your report's status
              </p>
            </div>
          </section>

          {/* Main Form Container */}
          <main>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-green-600 px-6 lg:px-8 py-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div>
                    <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                      Create New Report
                    </h2>
                    <p className="text-green-100">
                      Provide detailed information about the issue you've observed
                    </p>
                  </div>
                  <div className="bg-green-500 bg-opacity-20 px-4 py-2 rounded-full">
                    <span className="text-green-100 text-sm font-medium">
                      Step 1 of 4
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 lg:p-8">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
                  <div className="flex items-start space-x-3">
                    <svg 
                      className="w-6 h-6 text-yellow-600 mt-0.5 flex-shrink-0" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
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
                      <ul className="text-yellow-700 space-y-1 text-sm list-disc list-inside">
                        <li>Provide clear, specific details about the issue</li>
                        <li>Include photos as evidence when possible</li>
                        <li>Be accurate with location information</li>
                        <li>Choose the most relevant category for your issue</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <CreateReportForm 
                  onSubmissionStart={handleSubmissionStart}
                  onSubmissionComplete={handleSubmissionComplete}
                  user={user}
                />
              </div>
            </div>
          </main>

          {/* Support Information */}
          <footer className="mt-12 bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <svg 
                  className="w-8 h-8 text-gray-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
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
                <div className="text-gray-700 space-y-3">
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