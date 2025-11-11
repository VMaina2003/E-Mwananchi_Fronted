// components/reports/ReportCard/index.jsx (UPDATED)
import React from 'react';

const ReportCard = ({ report, onCardClick, showComments = false, onCommentClick }) => {
  const getStatusColor = (status) => {
    const colors = {
      submitted: 'bg-blue-100 text-blue-800 border-blue-200',
      verified: 'bg-green-100 text-green-800 border-green-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      noted: 'bg-purple-100 text-purple-800 border-purple-200',
      on_progress: 'bg-orange-100 text-orange-800 border-orange-200',
      resolved: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
      deleted: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusDisplay = (status) => {
    const displays = {
      submitted: 'Submitted',
      verified: 'Verified',
      pending: 'Pending',
      noted: 'Noted',
      on_progress: 'In Progress',
      resolved: 'Resolved',
      rejected: 'Rejected',
      deleted: 'Deleted'
    };
    return displays[status] || status;
  };

  const getDepartmentIcon = (departmentName) => {
    if (!departmentName) return null;
    
    const icons = {
      'health': 'Health',
      'education': 'Education',
      'roads': 'Roads',
      'security': 'Security',
      'agriculture': 'Agriculture',
      'environment': 'Environment',
      'water': 'Water',
      'finance': 'Finance',
      'housing': 'Housing',
      'ict': 'ICT',
      'transport': 'Transport',
      'trade': 'Trade'
    };

    const deptLower = departmentName.toLowerCase();
    for (const [key, displayName] of Object.entries(icons)) {
      if (deptLower.includes(key)) {
        return displayName;
      }
    }
    
    return departmentName;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const truncateText = (text, maxLength) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header with Image */}
      {report.images && report.images.length > 0 ? (
        <div className="h-48 overflow-hidden">
          <img
            src={report.images[0].image}
            alt={report.title}
            className="w-full h-full object-cover cursor-pointer"
            onClick={onCardClick}
          />
        </div>
      ) : (
        <div 
          className="h-32 bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center cursor-pointer"
          onClick={onCardClick}
        >
          <div className="text-green-600 font-semibold text-lg">
            {getDepartmentIcon(report.department_name) || 'Report'}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        {/* Status and Date */}
        <div className="flex justify-between items-start mb-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(report.status)}`}>
            {getStatusDisplay(report.status)}
          </span>
          <span className="text-xs text-gray-500">
            {formatDate(report.created_at)}
          </span>
        </div>

        {/* Title */}
        <h3 
          className="font-semibold text-gray-900 mb-2 line-clamp-2 cursor-pointer hover:text-green-700"
          onClick={onCardClick}
        >
          {report.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-3">
          {truncateText(report.description, 120)}
        </p>

        {/* Location and Department */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-xs text-gray-500">
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {report.county_name}
            {report.subcounty_name && `, ${report.subcounty_name}`}
          </div>

          {report.department_name && (
            <div className="flex items-center text-xs text-gray-500">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              {getDepartmentIcon(report.department_name)}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
          <div className="flex items-center text-xs text-gray-500">
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {report.reporter_name || 'Anonymous'}
          </div>

          <div className="flex items-center space-x-4">
            {/* AI Verification Badge */}
            {report.verified_by_ai && (
              <div className="flex items-center text-xs bg-green-50 text-green-700 px-2 py-1 rounded">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                AI Verified
              </div>
            )}

            {/* Comments Button */}
            {showComments && (
              <button
                onClick={onCommentClick}
                className="flex items-center text-xs text-gray-500 hover:text-green-600"
              >
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Comment
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportCard;