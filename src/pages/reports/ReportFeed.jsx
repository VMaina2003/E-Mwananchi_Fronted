// src/pages/reports/ReportFeed.jsx - PROFESSIONAL VERSION
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ReportCard from '../../components/reports/ReportCard';
import reportService from '../../services/api/reportService';
import { useNotification } from '../../context/NotificationContext';

const ReportFeed = ({
  initialFilters = {},
  showFilters = false,
  limit = 20,
  enableInteractions = true
}) => {
  const { user, isAuthenticated } = useAuth();
  const { showError } = useNotification();
  const navigate = useNavigate();
  
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState(initialFilters);

  const fetchReports = useCallback(async (pageNum = 1, reset = false) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const params = {
        page: pageNum,
        limit: limit,
        ...filters
      };

      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });

      const response = await reportService.getReports(params);
      const reportsData = response.results || response;

      if (reset) {
        setReports(reportsData);
      } else {
        setReports(prev => [...prev, ...reportsData]);
      }

      if (response.next === null || reportsData.length < limit) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }

    } catch (error) {
      console.error('Error fetching reports:', error);
      showError('Failed to load reports. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filters, showError, limit]);

  useEffect(() => {
    setPage(1);
    fetchReports(1, true);
  }, [fetchReports]);

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchReports(nextPage, false);
    }
  };

  const handleReportClick = (reportId) => {
    navigate(`/reports/${reportId}`);
  };

  const handleLike = async (reportId) => {
    if (!isAuthenticated) {
      showError('Please log in to like reports');
      return;
    }

    try {
      const report = reports.find(r => r.id === reportId);
      if (report.current_user_liked) {
        await reportService.unlikeReport(reportId);
        setReports(prev => prev.map(r => 
          r.id === reportId 
            ? { 
                ...r, 
                likes_count: r.likes_count - 1,
                current_user_liked: false 
              }
            : r
        ));
      } else {
        await reportService.likeReport(reportId);
        setReports(prev => prev.map(r => 
          r.id === reportId 
            ? { 
                ...r, 
                likes_count: r.likes_count + 1,
                current_user_liked: true 
              }
            : r
        ));
      }
    } catch (error) {
      console.error('Error liking report:', error);
      showError('Failed to like report');
    }
  };

  const handleCommentClick = (reportId) => {
    navigate(`/reports/${reportId}#comments`);
  };

  if (loading && reports.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading community reports</p>
        </div>
      </div>
    );
  }

  return (
    <div className="report-feed">
      {reports.length === 0 ? (
        <div className="p-8 text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Reports Found
          </h3>
          <p className="text-gray-600 mb-4">
            {Object.values(filters).some(f => f) 
              ? 'Try adjusting your search criteria to see more results.'
              : 'There are currently no reports in the system.'
            }
          </p>
          {isAuthenticated && (
            <button
              onClick={() => navigate('/reports/create')}
              className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Create Report
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="divide-y divide-gray-200">
            {reports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                onCardClick={handleReportClick}
                onLike={handleLike}
                onComment={handleCommentClick}
                currentUser={user}
                showEngagement={enableInteractions}
              />
            ))}
          </div>

          {hasMore && (
            <div className="text-center mt-8 pb-8">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {loadingMore ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2"></div>
                    Loading more reports
                  </div>
                ) : (
                  'Load More Reports'
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ReportFeed;