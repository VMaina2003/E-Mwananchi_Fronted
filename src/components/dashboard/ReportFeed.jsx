// src/components/dashboard/ReportFeed.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import reportService from '../../services/api/reportService';
import commentService from '../../services/api/commentService';

/**
 * Professional Report Feed Component
 * Twitter-like interface with full backend integration
 */
const ReportFeed = ({ 
  initialFilters = {}, 
  showFilters = true, 
  limit = 15,
  enableInteractions = true 
}) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    county: '',
    department: '',
    search: '',
    ordering: '-created_at',
    ...initialFilters
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0
  });
  const [interactionLoading, setInteractionLoading] = useState({});
  const [expandedComments, setExpandedComments] = useState({});
  const [commentText, setCommentText] = useState({});

  // Fetch reports with current filters
  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = {
        ...filters,
        limit,
        offset: (pagination.currentPage - 1) * limit
      };

      // Clean undefined or empty values
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key] === '' || queryParams[key] === undefined) {
          delete queryParams[key];
        }
      });

      const response = await reportService.getReports(queryParams);
      
      if (response && (response.results || Array.isArray(response))) {
        setReports(response.results || response);
        
        // Update pagination if available from API
        if (response.count !== undefined) {
          setPagination(prev => ({
            ...prev,
            totalCount: response.count,
            totalPages: Math.ceil(response.count / limit)
          }));
        }
      } else {
        setReports([]);
      }
    } catch (err) {
      console.error('Error fetching reports feed:', err);
      setError('Unable to load reports. Please check your connection and try again.');
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.currentPage, limit]);

  // Handle like/unlike interaction
  const handleLike = async (reportId) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      setInteractionLoading(prev => ({ ...prev, [reportId]: true }));
      
      // TODO: Implement like functionality in backend
      // For now, we'll simulate the action
      const updatedReports = reports.map(report => 
        report.id === reportId 
          ? { 
              ...report, 
              likes_count: (report.likes_count || 0) + 1,
              user_has_liked: true 
            }
          : report
      );
      
      setReports(updatedReports);
      
      // Backend call would be:
      // await reportService.likeReport(reportId);
      
    } catch (err) {
      console.error('Error liking report:', err);
      // Revert optimistic update on error
      fetchReports();
    } finally {
      setInteractionLoading(prev => ({ ...prev, [reportId]: false }));
    }
  };

  // Handle comment submission
  const handleCommentSubmit = async (reportId) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const text = commentText[reportId]?.trim();
    if (!text) return;

    try {
      setInteractionLoading(prev => ({ ...prev, [`comment-${reportId}`]: true }));
      
      // Submit comment to backend
      await commentService.createComment({
        report: reportId,
        content: text,
        comment_type: user?.role === 'county_official' ? 'official' : 'citizen'
      });

      // Clear comment input
      setCommentText(prev => ({ ...prev, [reportId]: '' }));
      
      // Refresh comments for this report
      await fetchReportComments(reportId);
      
    } catch (err) {
      console.error('Error submitting comment:', err);
      setError('Failed to submit comment. Please try again.');
    } finally {
      setInteractionLoading(prev => ({ ...prev, [`comment-${reportId}`]: false }));
    }
  };

  // Fetch comments for a specific report
  const fetchReportComments = async (reportId) => {
    try {
      const comments = await commentService.getComments({ report: reportId });
      
      // Update report with new comments
      setReports(prev => prev.map(report =>
        report.id === reportId
          ? { ...report, comments: comments, comments_count: comments.length }
          : report
      ));
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
  };

  // Toggle comments visibility
  const toggleComments = async (reportId) => {
    if (expandedComments[reportId]) {
      setExpandedComments(prev => ({ ...prev, [reportId]: false }));
    } else {
      // Fetch comments if not already loaded
      if (!reports.find(r => r.id === reportId)?.comments) {
        await fetchReportComments(reportId);
      }
      setExpandedComments(prev => ({ ...prev, [reportId]: true }));
    }
  };

  // Update comment text
  const handleCommentChange = (reportId, text) => {
    setCommentText(prev => ({ ...prev, [reportId]: text }));
  };

  // Fetch reports when dependencies change
  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Status configuration
  const statusConfig = {
    submitted: {
      label: 'Submitted',
      color: 'bg-blue-100 text-blue-800 border-blue-200'
    },
    verified: {
      label: 'Verified',
      color: 'bg-green-100 text-green-800 border-green-200'
    },
    pending: {
      label: 'Under Review',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    },
    noted: {
      label: 'Official Review',
      color: 'bg-purple-100 text-purple-800 border-purple-200'
    },
    on_progress: {
      label: 'In Progress',
      color: 'bg-orange-100 text-orange-800 border-orange-200'
    },
    resolved: {
      label: 'Resolved',
      color: 'bg-green-100 text-green-800 border-green-200'
    },
    rejected: {
      label: 'Rejected',
      color: 'bg-red-100 text-red-800 border-red-200'
    }
  };

  // Format timestamp
  const formatTimestamp = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Individual Report Card Component
  const ReportCard = ({ report }) => {
    const status = statusConfig[report.status] || statusConfig.submitted;
    const showComments = expandedComments[report.id];
    const currentCommentText = commentText[report.id] || '';

    return (
      <div className="bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all duration-300">
        {/* Report Header */}
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-semibold text-sm uppercase">
                  {report.reporter_name?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-semibold text-gray-900 text-lg truncate">
                    {report.title}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${status.color}`}>
                    {status.label}
                  </span>
                </div>
                <p className="text-gray-600 text-sm">
                  {report.reporter_name} • {report.county_name} • {formatTimestamp(report.created_at)}
                </p>
              </div>
            </div>
          </div>

          {/* Report Content */}
          <div className="mb-4">
            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
              {report.description}
            </p>
          </div>

          {/* Report Metadata */}
          <div className="flex flex-wrap gap-2 mb-4">
            {report.department_name && (
              <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                {report.department_name}
              </span>
            )}
            {report.verified_by_ai && (
              <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                AI Verified
              </span>
            )}
            {report.image_count > 0 && (
              <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                {report.image_count} Photo{report.image_count !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Engagement Actions */}
          {enableInteractions && (
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center space-x-6">
                {/* Like Button */}
                <button
                  onClick={() => handleLike(report.id)}
                  disabled={interactionLoading[report.id]}
                  className={`flex items-center space-x-2 text-sm font-medium transition-colors ${
                    report.user_has_liked 
                      ? 'text-green-600' 
                      : 'text-gray-500 hover:text-green-600'
                  }`}
                >
                  <svg className="w-5 h-5" fill={report.user_has_liked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905a3.61 3.61 0 01-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                  </svg>
                  <span>{report.likes_count || 0}</span>
                </button>

                {/* Comment Button */}
                <button
                  onClick={() => toggleComments(report.id)}
                  className="flex items-center space-x-2 text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span>{report.comments_count || 0}</span>
                </button>

                {/* View Details Button */}
                <button
                  onClick={() => navigate(`/reports/${report.id}`)}
                  className="flex items-center space-x-2 text-sm font-medium text-gray-500 hover:text-green-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span>View Details</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="border-t border-gray-100 bg-gray-50">
            {/* Comment Input */}
            {isAuthenticated && (
              <div className="p-4 border-b border-gray-200">
                <div className="flex space-x-3">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex-shrink-0"></div>
                  <div className="flex-1">
                    <textarea
                      value={currentCommentText}
                      onChange={(e) => handleCommentChange(report.id, e.target.value)}
                      placeholder="Add a comment..."
                      rows="2"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    />
                    <div className="flex justify-end mt-2">
                      <button
                        onClick={() => handleCommentSubmit(report.id)}
                        disabled={!currentCommentText.trim() || interactionLoading[`comment-${report.id}`]}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {interactionLoading[`comment-${report.id}`] ? 'Posting...' : 'Post Comment'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Comments List */}
            <div className="p-4 space-y-4">
              {report.comments && report.comments.length > 0 ? (
                report.comments.map(comment => (
                  <div key={comment.id} className="flex space-x-3">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-medium text-gray-900 text-sm">
                            {comment.user_name}
                          </span>
                          {comment.comment_type === 'official' && (
                            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">
                              Official
                            </span>
                          )}
                          <span className="text-gray-500 text-xs">
                            {formatTimestamp(comment.created_at)}
                          </span>
                        </div>
                        <p className="text-gray-800 text-sm">{comment.content}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500 text-sm">No comments yet. Be the first to comment!</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Loading skeleton
  const renderLoadingSkeleton = () => (
    <div className="space-y-6">
      {[...Array(5)].map((_, index) => (
        <div key={index} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3 flex-1">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
            <div className="w-20 h-6 bg-gray-200 rounded-full"></div>
          </div>
          <div className="space-y-2 mb-4">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
          <div className="flex space-x-4">
            <div className="w-16 h-6 bg-gray-200 rounded"></div>
            <div className="w-16 h-6 bg-gray-200 rounded"></div>
            <div className="w-16 h-6 bg-gray-200 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );

  // Error state
  const renderErrorState = () => (
    <div className="bg-white rounded-xl border border-red-200 p-8 text-center">
      <div className="text-red-500 mb-4">
        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-red-800 mb-2">Unable to Load Reports</h3>
      <p className="text-red-600 mb-4">{error}</p>
      <button
        onClick={fetchReports}
        className="bg-red-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
      >
        Retry Loading
      </button>
    </div>
  );

  // Empty state
  const renderEmptyState = () => (
    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
      <div className="text-gray-400 mb-4">
        <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-3">No Reports Found</h3>
      <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
        {filters.search || filters.status || filters.county 
          ? 'Try adjusting your filters to see more results.'
          : 'Be the first to report an issue in your community.'
        }
      </p>
      {!filters.search && !filters.status && !filters.county && (
        <button
          onClick={() => navigate('/reports/create')}
          className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
        >
          Create First Report
        </button>
      )}
    </div>
  );

  return (
    <div className="w-full">
      {/* Reports Feed */}
      <div className="space-y-6">
        {loading && renderLoadingSkeleton()}
        {error && renderErrorState()}
        {!loading && !error && reports.length === 0 && renderEmptyState()}
        {!loading && !error && reports.length > 0 && (
          reports.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))
        )}
      </div>
    </div>
  );
};

export default ReportFeed;