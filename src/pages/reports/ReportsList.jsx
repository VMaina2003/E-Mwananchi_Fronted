// src/pages/reports/ReportsList.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import ReportFeed from '../../components/dashboard/ReportFeed';

/**
 * Professional Reports Listing Page
 * Twitter-like interface for browsing community reports
 */
const ReportsList = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleCreateReport = () => {
    navigate('/reports/create');
  };

  const handleViewMyReports = () => {
    navigate('/my-reports');
  };

  // Mock recent activity - replace with actual API call
  useEffect(() => {
    const fetchRecentActivity = async () => {
      setLoading(true);
      try {
        // TODO: Replace with actual API call
        // const activity = await reportService.getRecentActivity();
        // setRecentActivity(activity);
        
        // Mock data for demonstration
        setTimeout(() => {
          setRecentActivity([
            { id: 1, type: 'report', user: 'John Kamau', action: 'submitted a report', time: '2 hours ago' },
            { id: 2, type: 'comment', user: 'County Official', action: 'responded to a report', time: '4 hours ago' },
            { id: 3, type: 'status', user: 'System', action: 'marked report as resolved', time: '1 day ago' },
          ]);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Failed to fetch recent activity:', error);
        setLoading(false);
      }
    };

    fetchRecentActivity();
  }, []);

  return (
    <DashboardLayout 
      title="Community Reports"
      subtitle="Browse and engage with reports from citizens across Kenya"
      actions={
        <div className="flex flex-col sm:flex-row gap-3">
          {isAuthenticated && (
            <button
              onClick={handleViewMyReports}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm"
            >
              My Reports
            </button>
          )}
          <button
            onClick={handleCreateReport}
            className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors text-sm"
          >
            Report Issue
          </button>
        </div>
      }
    >
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-3">Community Reports Feed</h1>
                <p className="text-gray-600 text-lg max-w-3xl">
                  Explore reports from citizens across all counties. Engage with your community by commenting, 
                  liking, and tracking the progress of reported issues.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Reports Feed - Main Content */}
          <div className="lg:col-span-3">
            <ReportFeed 
              showFilters={true}
              limit={15}
              initialFilters={{
                ordering: '-created_at'
              }}
              enableInteractions={true}
            />
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Overview</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Reports</span>
                  <span className="font-semibold text-gray-900">1,247</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Resolved Issues</span>
                  <span className="font-semibold text-green-600">892</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Active Counties</span>
                  <span className="font-semibold text-gray-900">47</span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {loading ? (
                  <div className="animate-pulse space-y-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex space-x-3">
                        <div className="w-2 h-2 bg-gray-200 rounded-full mt-2"></div>
                        <div className="flex-1 space-y-1">
                          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : recentActivity.length > 0 ? (
                  recentActivity.map(activity => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">{activity.user}</span> {activity.action}
                        </p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No recent activity</p>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            {isAuthenticated && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <button
                    onClick={handleCreateReport}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    Create New Report
                  </button>
                  <button
                    onClick={handleViewMyReports}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    View My Reports
                  </button>
                  {user?.role === 'county_official' && (
                    <button
                      onClick={() => navigate('/official-dashboard')}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      Official Dashboard
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ReportsList;