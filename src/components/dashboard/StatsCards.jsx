// src/components/dashboard/StatsCards.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import dashboardService from '../../services/api/dashboardService';

const StatsCards = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProfessionalStats();
  }, []);

  const fetchProfessionalStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await dashboardService.getProfessionalStats();
      setStats(response.data);
      
    } catch (err) {
      console.error('Error fetching professional dashboard statistics:', err);
      setError('Failed to load professional statistics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Professional SVG Icons
  const SVGIcon = ({ icon, className = "w-8 h-8" }) => {
    const icons = {
      reports: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      ai: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      uptime: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
      engagement: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      resolution: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      response: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      rank: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
      efficiency: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      success: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      myreports: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    };

    return icons[icon] || icons.reports;
  };

  // Professional statistics configuration based on user role
  const getStatisticsConfig = () => {
    const baseConfig = [
      {
        key: 'total_reports',
        title: 'Total Reports',
        description: 'All citizen reports submitted',
        icon: 'reports',
        color: 'bg-blue-500',
        textColor: 'text-blue-600',
        bgColor: 'bg-blue-50'
      },
      {
        key: 'verified_reports',
        title: 'AI Verified',
        description: 'Reports automatically verified by AI system',
        icon: 'ai',
        color: 'bg-green-500',
        textColor: 'text-green-600',
        bgColor: 'bg-green-50'
      }
    ];

    if (user?.is_superadmin || user?.is_admin) {
      return [
        ...baseConfig,
        {
          key: 'performance_metrics.system_uptime',
          title: 'System Uptime',
          description: 'Platform availability percentage',
          icon: 'uptime',
          color: 'bg-purple-500',
          textColor: 'text-purple-600',
          bgColor: 'bg-purple-50',
          format: 'percentage'
        },
        {
          key: 'user_analytics.user_engagement_rate',
          title: 'User Engagement',
          description: 'Active platform participation rate',
          icon: 'engagement',
          color: 'bg-indigo-500',
          textColor: 'text-indigo-600',
          bgColor: 'bg-indigo-50',
          format: 'percentage'
        },
        {
          key: 'performance_metrics.resolution_rate',
          title: 'Resolution Rate',
          description: 'Successfully resolved issues',
          icon: 'resolution',
          color: 'bg-teal-500',
          textColor: 'text-teal-600',
          bgColor: 'bg-teal-50',
          format: 'percentage'
        },
        {
          key: 'performance_metrics.response_time_avg',
          title: 'Avg Response Time',
          description: 'Average official response time (hours)',
          icon: 'response',
          color: 'bg-orange-500',
          textColor: 'text-orange-600',
          bgColor: 'bg-orange-50',
          format: 'hours'
        }
      ];
    }

    if (user?.is_county_official) {
      return [
        ...baseConfig,
        {
          key: 'performance_metrics.county_rank',
          title: 'County Rank',
          description: 'Performance ranking among counties',
          icon: 'rank',
          color: 'bg-yellow-500',
          textColor: 'text-yellow-600',
          bgColor: 'bg-yellow-50'
        },
        {
          key: 'performance_metrics.response_efficiency',
          title: 'Response Efficiency',
          description: 'County response performance score',
          icon: 'efficiency',
          color: 'bg-red-500',
          textColor: 'text-red-600',
          bgColor: 'bg-red-50',
          format: 'percentage'
        },
        {
          key: 'recent_activity.new_reports_today',
          title: 'New Today',
          description: 'Reports submitted today',
          icon: 'reports',
          color: 'bg-blue-500',
          textColor: 'text-blue-600',
          bgColor: 'bg-blue-50'
        },
        {
          key: 'recent_activity.pending_actions',
          title: 'Pending Actions',
          description: 'Reports awaiting your response',
          icon: 'response',
          color: 'bg-orange-500',
          textColor: 'text-orange-600',
          bgColor: 'bg-orange-50'
        }
      ];
    }

    // Citizen stats
    return [
      {
        key: 'personal_analytics.my_total_reports',
        title: 'My Reports',
        description: 'Reports submitted by you',
        icon: 'myreports',
        color: 'bg-green-500',
        textColor: 'text-green-600',
        bgColor: 'bg-green-50'
      },
      {
        key: 'personal_analytics.my_resolved_reports',
        title: 'Resolved',
        description: 'Your successfully resolved reports',
        icon: 'resolution',
        color: 'bg-teal-500',
        textColor: 'text-teal-600',
        bgColor: 'bg-teal-50'
      },
      {
        key: 'personal_analytics.report_success_rate',
        title: 'Success Rate',
        description: 'Your report resolution rate',
        icon: 'success',
        color: 'bg-purple-500',
        textColor: 'text-purple-600',
        bgColor: 'bg-purple-50',
        format: 'percentage'
      },
      {
        key: 'impact_metrics.response_rate_to_my_reports',
        title: 'Response Rate',
        description: 'Official responses to your reports',
        icon: 'response',
        color: 'bg-blue-500',
        textColor: 'text-blue-600',
        bgColor: 'bg-blue-50',
        format: 'percentage'
      }
    ];
  };

  const formatValue = (value, format) => {
    if (value === undefined || value === null) return '0';
    
    if (format === 'percentage') {
      return `${typeof value === 'number' ? value.toFixed(1) : value}%`;
    }
    if (format === 'hours') {
      return `${typeof value === 'number' ? value.toFixed(1) : value}h`;
    }
    return typeof value === 'number' ? value.toLocaleString() : value;
  };

  const getNestedValue = (obj, key) => {
    return key.split('.').reduce((o, k) => (o || {})[k], obj);
  };

  // Loading state component
  const renderLoadingState = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
      {getStatisticsConfig().map((_, index) => (
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
            onClick={fetchProfessionalStats}
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

  // Main statistics cards render
  const renderStatisticsCards = () => {
    const statisticsConfig = getStatisticsConfig();
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {statisticsConfig.map((stat) => {
          const value = getNestedValue(stats, stat.key);
          const displayValue = formatValue(value, stat.format);
          
          return (
            <div 
              key={stat.key}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  <h3 className={`text-sm font-semibold uppercase tracking-wide ${stat.textColor} mb-1`}>
                    {stat.title}
                  </h3>
                  <p className="text-3xl font-bold text-gray-900 mb-2 group-hover:scale-105 transition-transform">
                    {displayValue}
                  </p>
                  <p className="text-xs text-gray-500 font-medium">
                    {stat.description}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor} ${stat.textColor} group-hover:scale-110 transition-transform`}>
                  <SVGIcon icon={stat.icon} />
                </div>
              </div>

              {/* Progress indicator for percentage values */}
              {(stat.format === 'percentage' && typeof value === 'number') && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-medium text-gray-600">Performance</span>
                    <span className="text-xs font-semibold text-green-600">
                      {value}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${value}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Trend indicator for time-based metrics */}
              {stat.format === 'hours' && typeof value === 'number' && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Response Efficiency</span>
                    <span className={`font-semibold ${
                      value < 24 ? 'text-green-600' : value < 48 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {value < 24 ? 'Excellent' : value < 48 ? 'Good' : 'Needs Improvement'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Conditional rendering based on state
  if (loading) return renderLoadingState();
  if (error) return renderErrorState();
  if (!stats) return renderErrorState();

  return renderStatisticsCards();
};

export default StatsCards;