// src/pages/reports/BrowseReports.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useNotification } from "../../context/NotificationContext";
import Header from "../../components/common/Header";
import Footer from "../../components/common/Footer";
import reportService from "../../services/api/reportService";
import locationService from "../../services/api/locationService";
import commentService from "../../services/api/commentService";

/**
 * BrowseReports Component
 * Main page for browsing and filtering community reports
 * Features: Like/comment functionality, filtering, statistics display
 */
const BrowseReports = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showSuccess, showError, showInfo } = useNotification();
  
  // State declarations
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showComments, setShowComments] = useState({});
  const [filters, setFilters] = useState({
    county: "",
    department: "", 
    status: "",
    search: ""
  });
  const [counties, setCounties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [stats, setStats] = useState({
    total_reports: 0,
    resolved_reports: 0,
    in_progress_reports: 0
  });
  const [likingReports, setLikingReports] = useState(new Set());

  // Load data on component mount and filter changes
  useEffect(() => {
    loadAllReports();
    loadLocationData();
    loadStats();
  }, [filters]);

  /**
   * Load all reports with current filters
   */
  const loadAllReports = async () => {
    try {
      setLoading(true);
      const reportsData = await reportService.getReports(filters);
      
      // Handle different response formats from API
      let reportsArray = [];
      if (Array.isArray(reportsData)) {
        reportsArray = reportsData;
      } else if (reportsData && Array.isArray(reportsData.results)) {
        reportsArray = reportsData.results;
      } else if (reportsData && Array.isArray(reportsData.data)) {
        reportsArray = reportsData.data;
      }
      
      setReports(reportsArray);
    } catch (error) {
      console.error("Failed to load reports:", error);
      showError("Failed to load reports. Please try again.");
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load statistics for dashboard cards
   */
  const loadStats = async () => {
    try {
      const statsData = await reportService.getStats();
      setStats(statsData);
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };

  /**
   * Load location data for filters (counties and departments)
   */
  const loadLocationData = async () => {
    try {
      const [countiesData, departmentsData] = await Promise.all([
        locationService.getCounties(),
        locationService.getDepartments(),
      ]);
      setCounties(countiesData);
      setDepartments(departmentsData);
    } catch (error) {
      console.error("Failed to load location data:", error);
    }
  };

  /**
   * Handle like/unlike with optimistic updates
   * @param {string} reportId - ID of report to like/unlike
   * @param {Event} e - Click event
   */
  const handleLikeOptimistic = async (reportId, e) => {
    e.stopPropagation();
    
    if (!user) {
      showError("Please login to like reports");
      return;
    }
    
    if (likingReports.has(reportId)) return;
    
    const report = reports.find(r => r.id === reportId);
    if (!report) return;

    const userLiked = isUserLiked(report);
    const currentLikes = report.likes_count || 0;
    
    // Store original state for rollback
    const originalReports = [...reports];
    
    // Optimistic update - immediately update UI
    const updatedReports = reports.map(r => {
      if (r.id === reportId) {
        if (userLiked) {
          // Unlike - decrement count
          return {
            ...r,
            likes_count: Math.max(0, currentLikes - 1),
            current_user_liked: false
          };
        } else {
          // Like - increment count
          return {
            ...r,
            likes_count: currentLikes + 1,
            current_user_liked: true
          };
        }
      }
      return r;
    });
    
    setReports(updatedReports);

    try {
      setLikingReports(prev => new Set(prev).add(reportId));
      
      // Make actual API call
      if (userLiked) {
        await reportService.unlikeReport(reportId);
        showInfo("Report unliked");
      } else {
        await reportService.likeReport(reportId);
        showSuccess("Report liked!");
      }
      
    } catch (error) {
      console.error("Failed to update like:", error);
      showError("Failed to update like. Please try again.");
      
      // Revert optimistic update on error
      setReports(originalReports);
    } finally {
      // Remove from loading set
      setLikingReports(prev => {
        const newSet = new Set(prev);
        newSet.delete(reportId);
        return newSet;
      });
    }
  };

  /**
   * Add comment to a report
   * @param {string} reportId - Report ID to comment on
   * @param {string} commentText - Comment content
   */
  const handleAddComment = async (reportId, commentText) => {
    try {
      const commentData = {
        report: reportId,
        content: commentText,
        comment_type: user.role === 'citizen' ? 'citizen' : 'official'
      };
      
      await commentService.createComment(commentData);
      showSuccess("Comment added successfully!");
      
      // Refresh the reports to get updated comment counts
      await loadAllReports();
    } catch (error) {
      console.error("Failed to add comment:", error);
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message ||
                          "Failed to add comment. Please try again.";
      showError(errorMessage);
      throw error;
    }
  };

  /**
   * Toggle comments section for a report
   * @param {string} reportId - Report ID to toggle comments
   * @param {Event} e - Click event
   */
  const handleCommentClick = (reportId, e) => {
    if (e) e.stopPropagation();
    setShowComments(prev => ({
      ...prev,
      [reportId]: !prev[reportId]
    }));
  };

  /**
   * Update filter values
   * @param {string} key - Filter key (county, department, status, search)
   * @param {string} value - Filter value
   */
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  /**
   * Reset all filters to default values
   */
  const clearFilters = () => {
    setFilters({
      county: "",
      department: "", 
      status: "",
      search: ""
    });
  };

  /**
   * Check if current user has liked a report
   * @param {Object} report - Report object to check
   * @returns {boolean} - True if user liked the report
   */
  const isUserLiked = (report) => {
    if (!report || !user) return false;
    
    // Check current_user_liked first (most reliable)
    if (report.current_user_liked !== undefined) {
      return report.current_user_liked;
    }
    
    // Check likes array
    if (report.likes && Array.isArray(report.likes)) {
      return report.likes.some(like => like.id === user.id);
    }
    
    return false;
  };

  /**
   * Get CSS classes for status badges
   * @param {string} status - Report status
   * @returns {string} - Tailwind CSS classes
   */
  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-800 border border-green-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'verified': return 'bg-purple-100 text-purple-800 border border-purple-200';
      case 'submitted': return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'pending': return 'bg-orange-100 text-orange-800 border border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  /**
   * Format date string to readable format
   * @param {string} dateString - ISO date string
   * @returns {string} - Formatted date
   */
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  // ... rest of the JSX remains the same ...


  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex flex-col">
      <Header />
      
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate(-1)}
                  className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span>Back</span>
                </button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Browse Community Reports</h1>
                  <p className="text-gray-600 mt-1">Discover issues and developments in your community</p>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => navigate("/my-reports")}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  My Reports
                </button>
                <button
                  onClick={() => navigate("/reports/create")}
                  className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Report Issue
                </button>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-6 text-center hover:shadow-xl transition-shadow duration-200">
              <div className="text-3xl font-bold text-green-600 mb-2">{stats.total_reports}</div>
              <div className="text-gray-700 font-semibold">Total Reports</div>
              <div className="text-sm text-gray-500 mt-1">Community Issues</div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6 text-center hover:shadow-xl transition-shadow duration-200">
              <div className="text-3xl font-bold text-blue-600 mb-2">{stats.resolved_reports}</div>
              <div className="text-gray-700 font-semibold">Resolved</div>
              <div className="text-sm text-gray-500 mt-1">Issues Fixed</div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg border border-orange-100 p-6 text-center hover:shadow-xl transition-shadow duration-200">
              <div className="text-3xl font-bold text-orange-600 mb-2">{stats.in_progress_reports}</div>
              <div className="text-gray-700 font-semibold">In Progress</div>
              <div className="text-sm text-gray-500 mt-1">Being Addressed</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Filters Section */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Filter Reports</h3>
                  <button
                    onClick={clearFilters}
                    className="text-sm text-green-600 hover:text-green-700 font-medium"
                  >
                    Clear Filters
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* County Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">County</label>
                    <select
                      value={filters.county}
                      onChange={(e) => handleFilterChange('county', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">All Counties</option>
                      {counties.map((county) => (
                        <option key={county.id} value={county.id}>
                          {county.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Department Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <select
                      value={filters.department}
                      onChange={(e) => handleFilterChange('department', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">All Departments</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.department?.name || dept.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={filters.status}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">All Status</option>
                      <option value="submitted">Submitted</option>
                      <option value="verified">Verified</option>
                      <option value="pending">Pending</option>
                      <option value="noted">Noted</option>
                      <option value="on_progress">On Progress</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>

                  {/* Search Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                    <input
                      type="text"
                      placeholder="Search reports..."
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Reports List */}
              <div className="space-y-6">
                {loading ? (
                  // Loading skeleton
                  <div className="space-y-6">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 animate-pulse">
                        <div className="flex space-x-4">
                          <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                          <div className="flex-1 space-y-3">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                            <div className="flex space-x-4 pt-3">
                              <div className="h-8 bg-gray-200 rounded w-20"></div>
                              <div className="h-8 bg-gray-200 rounded w-20"></div>
                              <div className="h-8 bg-gray-200 rounded w-20"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : reports.length === 0 ? (
                  // Empty State
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
                    <div className="text-gray-400 mb-6">
                      <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">No Reports Found</h3>
                    <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
                      No reports match your current filters. Try adjusting your search criteria or be the first to create a report!
                    </p>
                    <button
                      onClick={() => navigate("/reports/create")}
                      className="bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      Create First Report
                    </button>
                  </div>
                ) : (
                  // Reports List
                  reports.map((report) => {
                    const userLiked = isUserLiked(report);
                    const isLiking = likingReports.has(report.id);
                    
                    return (
                      <div 
                        key={report.id} 
                        className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-200 cursor-pointer"
                        onClick={() => navigate(`/reports/${report.id}`)}
                      >
                        {/* Report Card */}
                        <div className="p-6">
                          <div className="flex items-start space-x-4">
                            {/* User Avatar */}
                            <div className="flex-shrink-0">
                              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-md">
                                <span className="text-white font-bold text-sm">
                                  {report.reporter?.first_name?.charAt(0) || report.reporter?.email?.charAt(0) || 'U'}
                                </span>
                              </div>
                            </div>
                            
                            {/* Report Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-2">
                                <h3 className="text-lg font-semibold text-gray-900 truncate">
                                  {report.title}
                                </h3>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(report.status)}`}>
                                  {report.status?.replace('_', ' ').toUpperCase()}
                                </span>
                              </div>
                              
                              <p className="text-gray-600 mb-3 line-clamp-3">
                                {report.description}
                              </p>
                              
                              <div className="flex flex-wrap gap-2 text-sm text-gray-500 mb-4">
                                {report.county && (
                                  <span className="flex items-center space-x-1">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span>{report.county.name}</span>
                                  </span>
                                )}
                                {report.department && (
                                  <span className="flex items-center space-x-1">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                    <span>{report.department.department?.name || report.department.name}</span>
                                  </span>
                                )}
                                <span className="flex items-center space-x-1">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <span>{formatDate(report.created_at)}</span>
                                </span>
                              </div>
                              
                              {/* Engagement Actions */}
                              <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                                <div className="flex items-center space-x-6">
                                  {/* Like Button */}
                                  <button
                                    onClick={(e) => handleLikeOptimistic(report.id, e)}
                                    disabled={isLiking}
                                    className={`flex items-center space-x-2 transition-all duration-200 ${
                                      userLiked 
                                        ? 'text-red-600 hover:text-red-700' 
                                        : 'text-gray-500 hover:text-red-600'
                                    } ${isLiking ? 'opacity-50 cursor-not-allowed' : ''}`}
                                  >
                                    {isLiking ? (
                                      <svg className="w-5 h-5 animate-spin text-red-600" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                      </svg>
                                    ) : (
                                      <svg className="w-5 h-5" fill={userLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                      </svg>
                                    )}
                                    <span className="text-sm font-medium">{report.likes_count || 0}</span>
                                  </button>
                                  
                                  {/* Comment Button */}
                                  <button
                                    onClick={(e) => handleCommentClick(report.id, e)}
                                    className="flex items-center space-x-2 text-gray-500 hover:text-green-600 transition-colors duration-200"
                                  >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                    <span className="text-sm font-medium">{report.comments_count || 0}</span>
                                  </button>
                                  
                                  {/* View Button */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate(`/reports/${report.id}`);
                                    }}
                                    className="flex items-center space-x-2 text-gray-500 hover:text-blue-600 transition-colors duration-200"
                                  >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    <span className="text-sm font-medium">{report.views_count || 0}</span>
                                  </button>
                                </div>
                                
                                {/* AI Verification Badge */}
                                {report.verified_by_ai && (
                                  <div className="flex items-center space-x-1 text-sm text-purple-600 bg-purple-50 px-2 py-1 rounded-full border border-purple-200">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                    <span>AI Verified</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Comments Section */}
                        {showComments[report.id] && (
                          <div 
                            className="border-t border-gray-100 bg-gray-50 p-6"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <React.Suspense fallback={<div className="text-center py-4">Loading comments...</div>}>
                              <CommentSection 
                                reportId={report.id} 
                                user={user}
                                onAddComment={handleAddComment}
                              />
                            </React.Suspense>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
            
            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Quick Stats */}
              <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Quick Stats
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Reports</span>
                    <span className="font-semibold text-gray-900">{stats.total_reports}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Resolved</span>
                    <span className="font-semibold text-green-600">{stats.resolved_reports}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">In Progress</span>
                    <span className="font-semibold text-blue-600">{stats.in_progress_reports}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">AI Verified</span>
                    <span className="font-semibold text-purple-600">{stats.ai_verified_reports || 0}</span>
                  </div>
                </div>
              </div>
              
              {/* Quick Actions */}
              <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={() => navigate("/reports/create")}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white text-center py-3 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    Report New Issue
                  </button>
                  <button
                    onClick={() => navigate("/my-reports")}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white text-center py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    View My Reports
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BrowseReports;