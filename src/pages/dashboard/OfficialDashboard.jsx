// src/pages/dashboard/OfficialDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import reportService from '../../services/api/reportService';

const OfficialDashboard = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('pending');
  const [countyReports, setCountyReports] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(null);

  useEffect(() => {
    if (user) {
      loadOfficialData();
    }
  }, [user, activeTab]);

  const loadOfficialData = async () => {
    try {
      setLoading(true);
      
      // Load county-specific reports - backend automatically filters by user.county
      const reportsData = await reportService.getReports();
      
      // Load statistics
      const statsData = await reportService.getStats();

      setCountyReports(Array.isArray(reportsData) ? reportsData : reportsData.results || []);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load official data:', error);
      showError('Failed to load dashboard data. Please try again.', 'Loading Error');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (reportId, newStatus) => {
    try {
      setUpdatingStatus(reportId);
      await reportService.updateReportStatus(reportId, newStatus);
      
      const statusMessages = {
        'noted': 'Report marked as noted',
        'on_progress': 'Work started on report',
        'resolved': 'Report marked as resolved'
      };
      
      showSuccess(statusMessages[newStatus] || 'Status updated successfully', 'Report Updated');
      
      // Reload data to reflect changes
      await loadOfficialData();
    } catch (error) {
      console.error('Failed to update report status:', error);
      showError('Failed to update report status. Please try again.', 'Update Error');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleCreateReport = () => {
    navigate('/reports/create');
  };

  // Calculate county-specific statistics
  const countyStats = {
    totalReports: countyReports.length,
    pendingReview: countyReports.filter(r => r.status === 'verified').length,
    inProgress: countyReports.filter(r => r.status === 'on_progress').length,
    resolved: countyReports.filter(r => r.status === 'resolved').length,
    noted: countyReports.filter(r => r.status === 'noted').length
  };

  const getReportsByStatus = (status) => {
    return countyReports.filter(report => report.status === status);
  };

  const getStatusColor = (status) => {
    const statusColors = {
      'submitted': 'bg-gray-100 text-gray-800',
      'verified': 'bg-orange-100 text-orange-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'noted': 'bg-blue-100 text-blue-800',
      'on_progress': 'bg-purple-100 text-purple-800',
      'resolved': 'bg-green-100 text-green-800'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusDisplay = (status) => {
    const statusDisplay = {
      'submitted': 'Submitted',
      'verified': 'Verified',
      'pending': 'Pending Review',
      'noted': 'Noted',
      'on_progress': 'In Progress',
      'resolved': 'Resolved'
    };
    return statusDisplay[status] || status;
  };

  if (!user?.county) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-8 bg-white rounded-2xl shadow-lg border border-red-100">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-red-600 mb-4">County Not Assigned</h2>
            <p className="text-gray-600 mb-6">
              Your account is not associated with any county. Please contact administration.
            </p>
            <button
              onClick={() => navigate('/citizen-dashboard')}
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors duration-200"
            >
              Go to Citizen Dashboard
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col">
      <Header />
      
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-8 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center space-x-4 mb-6 lg:mb-0">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-1">
                    Official Dashboard
                  </h1>
                  <p className="text-gray-600 text-lg">
                    {user.county.name || user.county} County • Welcome, {user.first_name}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleCreateReport}
                  className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Create Report
                </button>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6 text-center hover:shadow-xl transition-shadow duration-200">
              <div className="text-3xl font-bold text-blue-600 mb-2">{countyStats.totalReports}</div>
              <div className="text-gray-700 font-semibold">Total Reports</div>
              <div className="text-sm text-gray-500 mt-1">County Issues</div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg border border-orange-100 p-6 text-center hover:shadow-xl transition-shadow duration-200">
              <div className="text-3xl font-bold text-orange-600 mb-2">{countyStats.pendingReview}</div>
              <div className="text-gray-700 font-semibold">Pending Review</div>
              <div className="text-sm text-gray-500 mt-1">Awaiting Action</div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg border border-purple-100 p-6 text-center hover:shadow-xl transition-shadow duration-200">
              <div className="text-3xl font-bold text-purple-600 mb-2">{countyStats.inProgress}</div>
              <div className="text-gray-700 font-semibold">In Progress</div>
              <div className="text-sm text-gray-500 mt-1">Being Addressed</div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-6 text-center hover:shadow-xl transition-shadow duration-200">
              <div className="text-3xl font-bold text-green-600 mb-2">{countyStats.resolved}</div>
              <div className="text-gray-700 font-semibold">Resolved</div>
              <div className="text-sm text-gray-500 mt-1">Issues Fixed</div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 text-center hover:shadow-xl transition-shadow duration-200">
              <div className="text-3xl font-bold text-gray-600 mb-2">{countyStats.noted}</div>
              <div className="text-gray-700 font-semibold">Noted</div>
              <div className="text-sm text-gray-500 mt-1">Acknowledged</div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 mb-8">
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'pending', label: 'Pending Review', count: countyStats.pendingReview, status: 'verified' },
                { key: 'in-progress', label: 'In Progress', count: countyStats.inProgress, status: 'on_progress' },
                { key: 'noted', label: 'Noted', count: countyStats.noted, status: 'noted' },
                { key: 'resolved', label: 'Resolved', count: countyStats.resolved, status: 'resolved' },
                { key: 'all', label: 'All Reports', count: countyStats.totalReports }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                    activeTab === tab.key
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    activeTab === tab.key
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-300 text-gray-700'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Reports List */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading county reports...</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {(activeTab === 'all' ? countyReports : getReportsByStatus(
                  activeTab === 'pending' ? 'verified' : 
                  activeTab === 'in-progress' ? 'on_progress' : 
                  activeTab === 'noted' ? 'noted' : 
                  activeTab === 'resolved' ? 'resolved' : 'verified'
                )).map(report => (
                  <div key={report.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-1">{report.title}</h3>
                            <div className="flex flex-wrap gap-2 mb-2">
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(report.status)}`}>
                                {getStatusDisplay(report.status)}
                              </span>
                              {report.department && (
                                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                                  {report.department.department?.name || report.department}
                                </span>
                              )}
                              {report.verified_by_ai && (
                                <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                                  AI Verified ({Math.round((report.ai_confidence || 0) * 100)}%)
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-gray-700 mb-4 leading-relaxed">{report.description}</p>
                        
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                          <div className="flex items-center space-x-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>{report.ward?.name || report.subcounty?.name || report.county?.name}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span>By {report.reporter?.first_name} {report.reporter?.last_name}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{new Date(report.created_at).toLocaleDateString('en-KE')}</span>
                          </div>
                        </div>

                        {/* Engagement Stats */}
                        <div className="flex items-center space-x-6 text-sm text-gray-500">
                          <span>👁️ {report.views_count || 0} views</span>
                          <span>👍 {report.likes_count || 0} likes</span>
                          <span>💬 {report.comments_count || 0} comments</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col space-y-2 min-w-[200px]">
                        {report.status === 'verified' && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(report.id, 'noted')}
                              disabled={updatingStatus === report.id}
                              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {updatingStatus === report.id ? 'Updating...' : 'Mark as Noted'}
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(report.id, 'on_progress')}
                              disabled={updatingStatus === report.id}
                              className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {updatingStatus === report.id ? 'Updating...' : 'Start Work'}
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(report.id, 'resolved')}
                              disabled={updatingStatus === report.id}
                              className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {updatingStatus === report.id ? 'Updating...' : 'Mark Resolved'}
                            </button>
                          </>
                        )}
                        
                        {report.status === 'noted' && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(report.id, 'on_progress')}
                              disabled={updatingStatus === report.id}
                              className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {updatingStatus === report.id ? 'Updating...' : 'Start Work'}
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(report.id, 'resolved')}
                              disabled={updatingStatus === report.id}
                              className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {updatingStatus === report.id ? 'Updating...' : 'Mark Resolved'}
                            </button>
                          </>
                        )}
                        
                        {report.status === 'on_progress' && (
                          <button
                            onClick={() => handleStatusUpdate(report.id, 'resolved')}
                            disabled={updatingStatus === report.id}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {updatingStatus === report.id ? 'Updating...' : 'Mark Resolved'}
                          </button>
                        )}
                        
                        {(report.status === 'resolved' || report.status === 'noted') && (
                          <button
                            onClick={() => handleStatusUpdate(report.id, 'on_progress')}
                            disabled={updatingStatus === report.id}
                            className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {updatingStatus === report.id ? 'Updating...' : 'Reopen'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Empty State */}
                {countyReports.length === 0 && (
                  <div className="p-12 text-center">
                    <div className="text-gray-400 mb-4">
                      <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">No Reports in Your County</h3>
                    <p className="text-gray-600 mb-8 text-lg">
                      There are currently no reports submitted in {user.county.name || user.county} County.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OfficialDashboard;