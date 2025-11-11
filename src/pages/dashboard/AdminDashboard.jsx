// src/pages/dashboard/AdminDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import reportService from '../../services/api/reportService';
import userService from '../../services/api/userService';
import locationService from '../../services/api/locationService';
import departmentService from '../../services/api/departmentService';
import commentService from '../../services/api/commentService';
import notificationService from '../../services/api/notificationService';

const TABS = {
  OVERVIEW: 'overview',
  REPORTS: 'reports',
  USERS: 'users',
  DEPARTMENTS: 'departments',
  COMMENTS: 'comments',
  ANALYTICS: 'analytics'
};

const STATUS_COLORS = {
  submitted: 'bg-blue-100 text-blue-800',
  verified: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  noted: 'bg-purple-100 text-purple-800',
  on_progress: 'bg-orange-100 text-orange-800',
  resolved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  deleted: 'bg-gray-100 text-gray-800'
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(TABS.OVERVIEW);
  const [stats, setStats] = useState({
    totalReports: 0,
    activeUsers: 0,
    resolvedReports: 0,
    pendingReports: 0
  });
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [countyDepartments, setCountyDepartments] = useState([]);
  const [comments, setComments] = useState([]);
  const [counties, setCounties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({});

  const loadAdminData = useCallback(async () => {
    if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const requests = [
        reportService.getReportStats(),
        reportService.getReports({ limit: 50 }),
        userService.getUsers(),
        departmentService.getDepartments(),
        departmentService.getCountyDepartments(),
        commentService.getComments(),
        locationService.getCounties()
      ];

      const [
        statsData,
        reportsData,
        usersData,
        departmentsData,
        countyDepartmentsData,
        commentsData,
        countiesData
      ] = await Promise.all(requests.map(p => p.catch(err => {
        console.error('API Error:', err);
        return null;
      })));

      setStats(statsData || {});
      setReports(Array.isArray(reportsData) ? reportsData : (reportsData?.results || []));
      setUsers(Array.isArray(usersData) ? usersData : (usersData?.results || []));
      setDepartments(Array.isArray(departmentsData) ? departmentsData : (departmentsData?.results || []));
      setCountyDepartments(Array.isArray(countyDepartmentsData) ? countyDepartmentsData : (countyDepartmentsData?.results || []));
      setComments(Array.isArray(commentsData) ? commentsData : (commentsData?.results || []));
      setCounties(Array.isArray(countiesData) ? countiesData : []);

    } catch (err) {
      console.error('Failed to load admin data:', err);
      setError('Failed to load dashboard data. Please try again.');
      showError('Failed to load dashboard data. Please try again.', 'Loading Error');
    } finally {
      setLoading(false);
    }
  }, [user, showError]);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  const handleUserAction = async (userId, action, data = null) => {
    try {
      setActionLoading(prev => ({ ...prev, [userId]: true }));

      switch (action) {
        case 'activate':
          await userService.activateUser(userId);
          showSuccess('User activated successfully', 'User Management');
          break;
        case 'deactivate':
          await userService.deactivateUser(userId);
          showSuccess('User deactivated successfully', 'User Management');
          break;
        case 'update_role':
          await userService.updateUserRole(userId, data.role);
          showSuccess('User role updated successfully', 'User Management');
          break;
        case 'delete':
          if (window.confirm('Are you sure you want to delete this user?')) {
            await userService.deleteUser(userId);
            showSuccess('User deleted successfully', 'User Management');
          }
          break;
        default:
          console.warn('Unknown user action:', action);
      }

      await loadAdminData();
    } catch (err) {
      console.error('User action failed:', err);
      const errorMessage = `Failed to ${action} user: ${err.response?.data?.detail || err.message}`;
      setError(errorMessage);
      showError(errorMessage, 'Action Failed');
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleReportAction = async (reportId, action, data = null) => {
    try {
      setActionLoading(prev => ({ ...prev, [reportId]: true }));

      switch (action) {
        case 'delete':
          if (window.confirm('Are you sure you want to delete this report?')) {
            await reportService.deleteReport(reportId);
            showSuccess('Report deleted successfully', 'Report Management');
          }
          break;
        case 'update_status':
          await reportService.updateReportStatus(reportId, data.status);
          showSuccess('Report status updated successfully', 'Report Updated');
          break;
        default:
          console.warn('Unknown report action:', action);
      }

      await loadAdminData();
    } catch (err) {
      console.error('Report action failed:', err);
      const errorMessage = `Failed to ${action} report: ${err.response?.data?.detail || err.message}`;
      setError(errorMessage);
      showError(errorMessage, 'Action Failed');
    } finally {
      setActionLoading(prev => ({ ...prev, [reportId]: false }));
    }
  };

  const handleCommentAction = async (commentId, action) => {
    try {
      setActionLoading(prev => ({ ...prev, [commentId]: true }));

      switch (action) {
        case 'delete':
          if (window.confirm('Are you sure you want to delete this comment?')) {
            await commentService.deleteComment(commentId);
            showSuccess('Comment deleted successfully', 'Comment Management');
          }
          break;
        default:
          console.warn('Unknown comment action:', action);
      }

      await loadAdminData();
    } catch (err) {
      console.error('Comment action failed:', err);
      const errorMessage = `Failed to ${action} comment: ${err.response?.data?.detail || err.message}`;
      setError(errorMessage);
      showError(errorMessage, 'Action Failed');
    } finally {
      setActionLoading(prev => ({ ...prev, [commentId]: false }));
    }
  };

  const handleDepartmentAction = async (departmentId, action, data = null) => {
    try {
      setActionLoading(prev => ({ ...prev, [departmentId]: true }));

      switch (action) {
        case 'delete':
          if (window.confirm('Are you sure you want to delete this department?')) {
            await departmentService.deleteDepartment(departmentId);
            showSuccess('Department deleted successfully', 'Department Management');
          }
          break;
        case 'update':
          await departmentService.updateDepartment(departmentId, data);
          showSuccess('Department updated successfully', 'Department Management');
          break;
        default:
          console.warn('Unknown department action:', action);
      }

      await loadAdminData();
    } catch (err) {
      console.error('Department action failed:', err);
      const errorMessage = `Failed to ${action} department: ${err.response?.data?.detail || err.message}`;
      setError(errorMessage);
      showError(errorMessage, 'Action Failed');
    } finally {
      setActionLoading(prev => ({ ...prev, [departmentId]: false }));
    }
  };

  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-8 bg-white rounded-lg shadow border border-red-100">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-red-600 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-4">
              Administrator privileges required to access this dashboard.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-green-600 text-white px-4 py-2 rounded font-medium hover:bg-green-700 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded flex justify-between items-center">
              <div className="flex items-center">
                <svg className="w-4 h-4 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-red-700 text-sm">{error}</span>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-600 hover:text-red-800"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    System Administration
                  </h1>
                  <p className="text-gray-600">
                    Welcome, {user.first_name} {user.last_name} - {user.role.replace('_', ' ')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow border border-gray-200 p-4 mb-6">
            <div className="flex flex-wrap gap-2">
              {[
                { key: TABS.OVERVIEW, label: 'Overview' },
                { key: TABS.REPORTS, label: 'Reports' },
                { key: TABS.USERS, label: 'Users' },
                { key: TABS.DEPARTMENTS, label: 'Departments' },
                { key: TABS.COMMENTS, label: 'Comments' },
                { key: TABS.ANALYTICS, label: 'Analytics' }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-2 rounded font-medium text-sm transition-colors ${
                    activeTab === tab.key
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {loading && (
            <div className="bg-white rounded-lg shadow border border-gray-200 p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-3 text-gray-600">Loading administration data...</p>
            </div>
          )}

          {!loading && (
            <div className="space-y-6">
              {activeTab === TABS.OVERVIEW && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white rounded-lg shadow border border-gray-200 p-4 text-center">
                    <div className="text-2xl font-bold text-gray-900 mb-1">{reports.length}</div>
                    <div className="text-gray-700 font-medium">Total Reports</div>
                  </div>
                  <div className="bg-white rounded-lg shadow border border-gray-200 p-4 text-center">
                    <div className="text-2xl font-bold text-gray-900 mb-1">{users.length}</div>
                    <div className="text-gray-700 font-medium">Total Users</div>
                  </div>
                  <div className="bg-white rounded-lg shadow border border-gray-200 p-4 text-center">
                    <div className="text-2xl font-bold text-gray-900 mb-1">{departments.length}</div>
                    <div className="text-gray-700 font-medium">Departments</div>
                  </div>
                  <div className="bg-white rounded-lg shadow border border-gray-200 p-4 text-center">
                    <div className="text-2xl font-bold text-gray-900 mb-1">{comments.length}</div>
                    <div className="text-gray-700 font-medium">Comments</div>
                  </div>
                </div>
              )}

              {activeTab === TABS.REPORTS && (
                <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Reports Management</h3>
                    <p className="text-gray-600 text-sm">Manage and moderate all system reports</p>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {reports.length > 0 ? reports.map(report => (
                      <div key={report.id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 mb-1">{report.title}</h4>
                            <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                              {report.description?.substring(0, 100)}...
                            </p>
                            <div className="flex flex-wrap gap-1">
                              <span className={`px-2 py-1 text-xs rounded ${STATUS_COLORS[report.status] || 'bg-gray-100 text-gray-800'}`}>
                                {report.status}
                              </span>
                              <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                                {report.county?.name || 'Unknown County'}
                              </span>
                              {report.verified_by_ai && (
                                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                                  AI Verified
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 min-w-[140px]">
                            <select
                              onChange={(e) => handleReportAction(report.id, 'update_status', { status: e.target.value })}
                              value={report.status}
                              disabled={actionLoading[report.id]}
                              className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                            >
                              <option value="submitted">Submitted</option>
                              <option value="verified">Verified</option>
                              <option value="pending">Pending</option>
                              <option value="noted">Noted</option>
                              <option value="on_progress">On Progress</option>
                              <option value="resolved">Resolved</option>
                              <option value="rejected">Rejected</option>
                            </select>
                            <div className="flex gap-1">
                              <button
                                onClick={() => navigate(`/reports/${report.id}`)}
                                className="flex-1 px-2 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                              >
                                View
                              </button>
                              <button
                                onClick={() => handleReportAction(report.id, 'delete')}
                                disabled={actionLoading[report.id]}
                                className="flex-1 px-2 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors disabled:opacity-50"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="p-8 text-center text-gray-500">
                        <p>No reports found</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === TABS.USERS && (
                <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
                    <p className="text-gray-600 text-sm">Manage system users and permissions</p>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {users.length > 0 ? users.map(userItem => (
                      <div key={userItem.id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 mb-1">
                              {userItem.first_name} {userItem.last_name}
                            </h4>
                            <p className="text-gray-600 text-sm mb-2">{userItem.email}</p>
                            <div className="flex flex-wrap gap-1">
                              <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded capitalize">
                                {userItem.role?.replace('_', ' ')}
                              </span>
                              <span className={`px-2 py-1 text-xs rounded ${
                                userItem.is_active 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {userItem.is_active ? 'Active' : 'Inactive'}
                              </span>
                              {userItem.verified && (
                                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                                  Verified
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 min-w-[200px]">
                            <select
                              onChange={(e) => handleUserAction(userItem.id, 'update_role', { role: e.target.value })}
                              value={userItem.role}
                              disabled={actionLoading[userItem.id]}
                              className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                            >
                              <option value="citizen">Citizen</option>
                              <option value="viewer">Viewer</option>
                              <option value="county_official">County Official</option>
                              <option value="admin">Admin</option>
                              <option value="superadmin">Super Admin</option>
                            </select>
                            <div className="flex gap-1">
                              {userItem.is_active ? (
                                <button
                                  onClick={() => handleUserAction(userItem.id, 'deactivate')}
                                  disabled={actionLoading[userItem.id]}
                                  className="flex-1 px-2 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 transition-colors disabled:opacity-50"
                                >
                                  Deactivate
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleUserAction(userItem.id, 'activate')}
                                  disabled={actionLoading[userItem.id]}
                                  className="flex-1 px-2 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors disabled:opacity-50"
                                >
                                  Activate
                                </button>
                              )}
                              <button
                                onClick={() => handleUserAction(userItem.id, 'delete')}
                                disabled={actionLoading[userItem.id]}
                                className="flex-1 px-2 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors disabled:opacity-50"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="p-8 text-center text-gray-500">
                        <p>No users found. User management endpoints need to be created in the backend.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === TABS.DEPARTMENTS && (
                <div className="space-y-4">
                  <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900">Departments</h3>
                      <p className="text-gray-600 text-sm">Manage system departments</p>
                    </div>
                    <div className="divide-y divide-gray-200">
                      {departments.length > 0 ? departments.map(dept => (
                        <div key={dept.id} className="p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="font-medium text-gray-900">{dept.name}</h4>
                              <p className="text-gray-600 text-sm">{dept.description}</p>
                            </div>
                            <button
                              onClick={() => handleDepartmentAction(dept.id, 'delete')}
                              disabled={actionLoading[dept.id]}
                              className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )) : (
                        <div className="p-8 text-center text-gray-500">
                          <p>No departments found</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900">County Departments</h3>
                      <p className="text-gray-600 text-sm">Departments assigned to specific counties</p>
                    </div>
                    <div className="divide-y divide-gray-200">
                      {countyDepartments.length > 0 ? countyDepartments.map(countyDept => (
                        <div key={countyDept.id} className="p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-gray-900">{countyDept.department?.name}</h4>
                              <p className="text-gray-600 text-sm">County: {countyDept.county?.name}</p>
                              <p className="text-gray-600 text-sm">Email: {countyDept.email}</p>
                              <p className="text-gray-600 text-sm">Phone: {countyDept.phone_number}</p>
                            </div>
                            <div className={`px-2 py-1 text-xs rounded ${
                              countyDept.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {countyDept.is_active ? 'Active' : 'Inactive'}
                            </div>
                          </div>
                        </div>
                      )) : (
                        <div className="p-8 text-center text-gray-500">
                          <p>No county departments found</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === TABS.COMMENTS && (
                <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Comment Moderation</h3>
                    <p className="text-gray-600 text-sm">Manage and moderate all comments</p>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {comments.length > 0 ? comments.map(comment => (
                      <div key={comment.id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-medium text-gray-900">{comment.user?.first_name} {comment.user?.last_name}</span>
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded capitalize">
                                {comment.comment_type}
                              </span>
                            </div>
                            <p className="text-gray-700 text-sm mb-2">{comment.content}</p>
                            <p className="text-gray-500 text-xs">Report: {comment.report?.title}</p>
                          </div>
                          <button
                            onClick={() => handleCommentAction(comment.id, 'delete')}
                            disabled={actionLoading[comment.id]}
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )) : (
                      <div className="p-8 text-center text-gray-500">
                        <p>No comments found</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === TABS.ANALYTICS && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Reports by Status</h4>
                    <div className="space-y-2">
                      {Object.entries(STATUS_COLORS).map(([status, colorClass]) => (
                        <div key={status} className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 capitalize">{status.replace('_', ' ')}</span>
                          <span className="text-sm font-semibold">
                            {reports.filter(r => r.status === status).length}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">User Distribution</h4>
                    <div className="space-y-2">
                      {[
                        { role: 'citizen', label: 'Citizens' },
                        { role: 'county_official', label: 'Officials' },
                        { role: 'admin', label: 'Admins' },
                        { role: 'superadmin', label: 'Super Admins' }
                      ].map(({ role, label }) => (
                        <div key={role} className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">{label}</span>
                          <span className="text-sm font-semibold">
                            {users.filter(u => u.role === role).length}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdminDashboard;