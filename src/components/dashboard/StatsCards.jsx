import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import dashboardService from '../../services/api/dashboardService'; // ADD THIS

const StatsCards = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // USE THE REAL API CALL
      const response = await dashboardService.getDashboardStats();
      setStats(response.data);
      
    } catch (err) {
      console.error('Error fetching dashboard statistics:', err);
      setError('Failed to load statistics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Statistics configuration with professional icons and colors
  const statisticsConfig = [
    {
      key: 'total_reports',
      title: 'Total Reports',
      description: 'All citizen reports submitted',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      key: 'verified_reports',
      title: 'AI Verified',
      description: 'Reports automatically verified by AI system',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      key: 'pending_reports',
      title: 'Pending Review',
      description: 'Reports awaiting official assessment',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      key: 'resolved_reports',
      title: 'Resolved Issues',
      description: 'Successfully addressed and closed reports',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      key: 'recent_reports_count',
      title: 'Last 7 Days',
      description: 'New reports submitted this week',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      key: 'reports_with_images',
      title: 'With Evidence',
      description: 'Reports containing photographic evidence',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: 'bg-indigo-500',
      textColor: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    }
  ];

  // Loading state component
  const renderLoadingState = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {statisticsConfig.map((_, index) => (
        <div key={index} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            </div>
            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      ))}
    </div>
  );

  // Error state component
  const renderErrorState = () => (
    <div className="bg-white rounded-xl border border-red-200 p-6 mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-red-800 mb-2">Statistics Unavailable</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchStats}
            className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Retry Loading Statistics
          </button>
        </div>
        <div className="text-red-500">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
      </div>
    </div>
  );

  // Calculate resolution rate for progress display
  const calculateResolutionRate = () => {
    if (!stats || !stats.total_reports || !stats.resolved_reports) return 0;
    return Math.round((stats.resolved_reports / stats.total_reports) * 100);
  };

  // Main statistics cards render
  const renderStatisticsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {statisticsConfig.map((stat) => {
        const value = stats?.[stat.key] || 0;
        const isResolutionCard = stat.key === 'resolved_reports';
        
        return (
          <div 
            key={stat.key}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <h3 className={`text-sm font-semibold uppercase tracking-wide ${stat.textColor} mb-1`}>
                  {stat.title}
                </h3>
                <p className="text-3xl font-bold text-gray-900 mb-2">
                  {typeof value === 'number' ? value.toLocaleString() : value}
                </p>
                <p className="text-xs text-gray-500 font-medium">
                  {stat.description}
                </p>
              </div>
              <div className={`p-3 rounded-full ${stat.bgColor} ${stat.textColor}`}>
                {stat.icon}
              </div>
            </div>

            {/* Progress bar for resolution rate */}
            {isResolutionCard && stats?.total_reports > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-medium text-gray-600">Resolution Progress</span>
                  <span className="text-xs font-semibold text-green-600">
                    {calculateResolutionRate()}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${calculateResolutionRate()}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {stats.resolved_reports} of {stats.total_reports} reports resolved
                </p>
              </div>
            )}

            {/* Trend indicator for recent reports */}
            {stat.key === 'recent_reports_count' && stats?.total_reports > 0 && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Weekly Activity</span>
                  <span className={`font-semibold ${
                    value > (stats.total_reports / 52) ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {value > (stats.total_reports / 52) ? 'Above Average' : 'Normal'}
                  </span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  // Conditional rendering based on state
  if (loading) return renderLoadingState();
  if (error) return renderErrorState();
  if (!stats) return renderErrorState();

  return renderStatisticsCards();
};

// Prop validation
StatsCards.propTypes = {};

export default StatsCards;