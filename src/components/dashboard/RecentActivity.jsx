// src/components/dashboard/RecentActivity.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Professional Recent Activity Component
 * Displays system-wide activity and notifications in a clean, organized manner
 */
const RecentActivity = ({ limit = 10, showHeader = true }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Simulate API call - replace with actual activity endpoint
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // TODO: Replace with actual API call
      // const response = await activityService.getRecentActivities({ limit });
      // setActivities(response.data);
      
      // Mock data for demonstration
      setTimeout(() => {
        setActivities(generateMockActivities());
        setLoading(false);
      }, 1000);
      
    } catch (err) {
      console.error('Error fetching recent activities:', err);
      setError('Failed to load recent activity');
      setLoading(false);
    }
  };

  // Activity type configuration
  const activityConfig = {
    report_submitted: {
      label: 'Report Submitted',
      color: 'bg-blue-100 text-blue-800',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      action: 'submitted a new report'
    },
    report_verified: {
      label: 'Report Verified',
      color: 'bg-green-100 text-green-800',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      action: 'verified a report'
    },
    status_updated: {
      label: 'Status Updated',
      color: 'bg-purple-100 text-purple-800',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
      action: 'updated report status'
    },
    comment_added: {
      label: 'Comment Added',
      color: 'bg-indigo-100 text-indigo-800',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      action: 'commented on a report'
    },
    development_added: {
      label: 'Project Added',
      color: 'bg-orange-100 text-orange-800',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      action: 'added a new development project'
    },
    user_registered: {
      label: 'User Registered',
      color: 'bg-teal-100 text-teal-800',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      ),
      action: 'joined the platform'
    }
  };

  // Generate mock activities for demonstration
  const generateMockActivities = () => {
    const activityTypes = Object.keys(activityConfig);
    const mockActivities = [];
    
    for (let i = 0; i < limit; i++) {
      const type = activityTypes[Math.floor(Math.random() * activityTypes.length)];
      const hoursAgo = Math.floor(Math.random() * 24);
      
      mockActivities.push({
        id: `activity-${i}`,
        type,
        user: {
          name: ['John Kamau', 'Mary Wanjiku', 'David Ochieng', 'Grace Akinyi', 'Paul Mwangi'][Math.floor(Math.random() * 5)],
          role: ['citizen', 'county_official', 'admin'][Math.floor(Math.random() * 3)]
        },
        target: {
          id: `report-${Math.floor(Math.random() * 1000)}`,
          title: ['Road Repair Needed', 'Water Supply Issue', 'Health Center Concerns', 'Education Facilities'][Math.floor(Math.random() * 4)]
        },
        timestamp: new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString(),
        metadata: {
          county: ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru'][Math.floor(Math.random() * 4)],
          department: ['Roads', 'Health', 'Education', 'Water'][Math.floor(Math.random() * 4)]
        }
      });
    }
    
    return mockActivities;
  };

  // Format relative time
  const formatRelativeTime = (timestamp) => {
    const date = new Date(timestamp);
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
      month: 'short',
      day: 'numeric'
    });
  };

  // Handle activity click
  const handleActivityClick = (activity) => {
    if (activity.target?.id && activity.type.includes('report')) {
      navigate(`/reports/${activity.target.id}`);
    }
  };

  // Loading skeleton
  const renderLoadingSkeleton = () => (
    <div className="space-y-4">
      {[...Array(limit)].map((_, index) => (
        <div key={index} className="flex items-start space-x-3 p-3 animate-pulse">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  );

  // Error state
  const renderErrorState = () => (
    <div className="text-center py-8">
      <div className="text-red-500 mb-3">
        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <p className="text-red-600 mb-4">{error}</p>
      <button
        onClick={fetchActivities}
        className="text-red-600 hover:text-red-700 font-medium text-sm"
      >
        Retry
      </button>
    </div>
  );

  // Empty state
  const renderEmptyState = () => (
    <div className="text-center py-8">
      <div className="text-gray-400 mb-3">
        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <p className="text-gray-500">No recent activity to display</p>
    </div>
  );

  // Individual activity item
  const ActivityItem = ({ activity }) => {
    const config = activityConfig[activity.type] || activityConfig.report_submitted;
    
    return (
      <div 
        className={`flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors ${
          activity.target ? 'cursor-pointer' : 'cursor-default'
        }`}
        onClick={() => activity.target && handleActivityClick(activity)}
      >
        {/* Activity Icon */}
        <div className={`p-2 rounded-full ${config.color} flex-shrink-0`}>
          {config.icon}
        </div>

        {/* Activity Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900">
                <span className="font-semibold">{activity.user.name}</span>
                <span className="text-gray-600"> {config.action}</span>
                {activity.target && (
                  <span className="font-medium text-gray-900"> {activity.target.title}</span>
                )}
              </p>
              
              {/* Metadata */}
              <div className="flex items-center space-x-2 mt-1">
                {activity.metadata?.county && (
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {activity.metadata.county}
                  </span>
                )}
                {activity.metadata?.department && (
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {activity.metadata.department}
                  </span>
                )}
                <span className="text-xs text-gray-400">
                  {formatRelativeTime(activity.timestamp)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      {/* Header */}
      {showHeader && (
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          <p className="text-sm text-gray-600 mt-1">Latest updates from the platform</p>
        </div>
      )}

      {/* Activity List */}
      <div className="divide-y divide-gray-100">
        {loading && renderLoadingSkeleton()}
        {error && renderErrorState()}
        {!loading && !error && activities.length === 0 && renderEmptyState()}
        {!loading && !error && activities.length > 0 && (
          activities.map((activity) => (
            <ActivityItem key={activity.id} activity={activity} />
          ))
        )}
      </div>

      {/* Footer */}
      {!loading && !error && activities.length > 0 && (
        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <button 
            onClick={() => navigate('/activity')}
            className="text-sm text-green-600 hover:text-green-700 font-medium w-full text-center"
          >
            View All Activity
          </button>
        </div>
      )}
    </div>
  );
};

export default RecentActivity;