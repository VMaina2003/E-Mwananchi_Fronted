// components/reports/ReportCard/index.jsx - PROFESSIONAL VERSION
import React, { useState, useCallback } from 'react';

const ReportCard = ({ 
  report, 
  onCardClick, 
  onLike, 
  onComment, 
  currentUser,
  showEngagement = true,
  compact = false
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Professional status configuration
  const statusConfig = {
    submitted: { 
      color: 'bg-blue-50 text-blue-700 border-blue-200', 
      text: 'Submitted'
    },
    verified: { 
      color: 'bg-green-50 text-green-700 border-green-200', 
      text: 'Verified'
    },
    pending: { 
      color: 'bg-yellow-50 text-yellow-700 border-yellow-200', 
      text: 'Pending Review'
    },
    noted: { 
      color: 'bg-purple-50 text-purple-700 border-purple-200', 
      text: 'Noted'
    },
    on_progress: { 
      color: 'bg-orange-50 text-orange-700 border-orange-200', 
      text: 'In Progress'
    },
    resolved: { 
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200', 
      text: 'Resolved'
    },
    rejected: { 
      color: 'bg-red-50 text-red-700 border-red-200', 
      text: 'Rejected'
    }
  };

  const getReporterDisplay = useCallback(() => {
    if (report.is_anonymous) {
      return report.anonymous_display_name || 'Anonymous Citizen';
    }
    return report.reporter_name || report.reporter?.display_name || 'User';
  }, [report]);

  const getImageUrl = useCallback(() => {
    const sources = [
      report.main_image_url,
      report.thumbnail_url,
      report.image_url,
    ];

    for (const source of sources) {
      if (source && typeof source === 'string' && source.trim()) {
        return source;
      }
    }

    if (report.images && report.images.length > 0) {
      const firstImage = report.images[0];
      const imageSources = [
        firstImage?.image_url,
        firstImage?.thumbnail_url,
      ];

      for (const source of imageSources) {
        if (source && typeof source === 'string' && source.trim()) {
          return source;
        }
      }
    }

    return null;
  }, [report]);

  const hasImages = Boolean(
    report.main_image_url ||
    report.thumbnail_url ||
    report.image_url ||
    (report.images && report.images.length > 0) ||
    report.has_images ||
    (report.image_count && report.image_count > 0)
  );

  const imageUrl = getImageUrl();
  const imageCount = report.image_count || (report.images ? report.images.length : 0);

  const formatRelativeTime = useCallback((dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInSeconds = Math.floor((now - date) / 1000);
      
      if (diffInSeconds < 60) return 'Just now';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
      if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
      
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    } catch (error) {
      return '';
    }
  }, []);

  const handleLike = useCallback((e) => {
    e.stopPropagation();
    if (onLike && report.id) {
      onLike(report.id);
    }
  }, [onLike, report.id]);

  const handleComment = useCallback((e) => {
    e.stopPropagation();
    if (onComment && report.id) {
      onComment(report.id);
    }
  }, [onComment, report.id]);

  const handleCardClick = useCallback(() => {
    if (onCardClick && report.id) {
      onCardClick(report.id);
    }
  }, [onCardClick, report.id]);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setImageLoaded(false);
  }, []);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
    setImageError(false);
  }, []);

  const statusInfo = statusConfig[report.status] || { 
    color: 'bg-gray-50 text-gray-700 border-gray-200', 
    text: report.status || 'Unknown'
  };

  const reporterDisplay = getReporterDisplay();
  const isOfficialReport = report.is_development_showcase;

  if (compact) {
    return (
      <div 
        className="bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 cursor-pointer"
        onClick={handleCardClick}
      >
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center space-x-2 flex-1 min-w-0">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-medium text-xs flex-shrink-0">
                {reporterDisplay.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900 text-sm truncate">
                  {reporterDisplay}
                </p>
                <p className="text-gray-500 text-xs">
                  {formatRelativeTime(report.created_at)}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end space-y-1">
              {isOfficialReport && (
                <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium border border-blue-200">
                  Official
                </span>
              )}
              <span className={`px-2 py-1 rounded text-xs font-medium border ${statusInfo.color}`}>
                {statusInfo.text}
              </span>
            </div>
          </div>

          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 text-sm">
            {report.title}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-2 mb-2">
            {report.description}
          </p>

          <div className="flex items-center text-gray-500 text-xs mb-2">
            <span className="mr-3">{report.county_name || report.county?.name || 'Location not specified'}</span>
            {report.department_name && (
              <span>{report.department_name}</span>
            )}
          </div>

          {showEngagement && (
            <div className="flex items-center justify-between text-gray-500 text-xs">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleComment}
                  className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
                >
                  <span>Comments</span>
                  <span>({report.comments_count || 0})</span>
                </button>
                <button
                  onClick={handleLike}
                  className={`flex items-center space-x-1 transition-colors ${
                    report.current_user_liked ? 'text-red-600' : 'hover:text-red-600'
                  }`}
                >
                  <span>Likes</span>
                  <span>({report.likes_count || 0})</span>
                </button>
                <div className="flex items-center space-x-1">
                  <span>Views</span>
                  <span>({report.views_count || 0})</span>
                </div>
              </div>
              {hasImages && (
                <div className="text-gray-400">
                  {imageCount} image{imageCount !== 1 ? 's' : ''}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`bg-white border-b border-gray-200 transition-colors duration-200 cursor-pointer group ${
        isOfficialReport ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'hover:bg-gray-50'
      }`}
      onClick={handleCardClick}
    >
      <div className="flex p-4 space-x-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-medium text-sm">
            {reporterDisplay.charAt(0).toUpperCase()}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="font-semibold text-gray-900 text-sm">
              {reporterDisplay}
            </span>
            <span className="text-gray-400 text-sm">•</span>
            <span className="text-gray-500 text-sm">
              {formatRelativeTime(report.created_at)}
            </span>
            
            {isOfficialReport && (
              <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium border border-blue-200">
                Official Government Project
              </span>
            )}
            
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}>
              {statusInfo.text}
            </span>

            {report.verified_by_ai && (
              <span className="bg-green-50 text-green-700 px-2 py-1 rounded-full text-xs font-medium border border-green-200">
                AI Verified
              </span>
            )}

            {report.is_anonymous && (
              <span className="bg-gray-50 text-gray-600 px-2 py-1 rounded-full text-xs font-medium border border-gray-200">
                Anonymous
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 text-gray-600 text-sm mb-3">
            <span className="font-medium">
              {report.county_name || report.county?.name || 'Location not specified'}
            </span>
            {report.subcounty_name && (
              <span className="text-gray-500">• {report.subcounty_name}</span>
            )}
            
            {report.department_name && (
              <span className="font-medium">{report.department_name}</span>
            )}
          </div>

          <div className="mb-4">
            <h3 className="text-gray-900 font-bold text-lg mb-2 leading-tight group-hover:text-green-700 transition-colors">
              {report.title}
            </h3>
            <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">
              {report.description}
            </p>
          </div>

          {hasImages && imageUrl && !imageError ? (
            <div className="mb-4 rounded-lg overflow-hidden border border-gray-200 max-w-md">
              <div className="relative">
                <img
                  src={imageUrl}
                  alt={`Evidence for ${report.title}`}
                  className={`w-full h-64 object-cover transition-all duration-300 ${
                    imageLoaded ? 'group-hover:brightness-105' : 'blur-sm'
                  }`}
                  onError={handleImageError}
                  onLoad={handleImageLoad}
                />
                {!imageLoaded && !imageError && (
                  <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                    <div className="text-center text-gray-400">
                      <div className="text-sm mb-1">Loading image</div>
                    </div>
                  </div>
                )}
              </div>
              
              {imageCount > 1 && (
                <div className="absolute top-3 right-3 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs font-medium">
                  +{imageCount - 1} more
                </div>
              )}
            </div>
          ) : hasImages && (imageError || !imageUrl) ? (
            <div className="mb-4 rounded-lg border border-gray-200 max-w-md">
              <div className="w-full h-64 bg-gray-100 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <div className="text-sm font-medium">Image not available</div>
                  <div className="text-xs mt-1">Click to view report details</div>
                </div>
              </div>
            </div>
          ) : null}

          {showEngagement && (
            <div className="flex items-center justify-between max-w-md">
              <div className="flex items-center space-x-6 text-gray-500">
                <button
                  onClick={handleComment}
                  className="flex items-center space-x-2 hover:text-blue-600 transition-colors"
                >
                  <div className="p-2 rounded-full hover:bg-blue-50 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <span className="font-medium text-sm">{report.comments_count || 0}</span>
                </button>

                <button
                  onClick={handleLike}
                  className={`flex items-center space-x-2 transition-colors ${
                    report.current_user_liked ? 'text-red-600' : 'hover:text-red-600'
                  }`}
                >
                  <div className={`p-2 rounded-full transition-colors ${
                    report.current_user_liked ? 'bg-red-50' : 'hover:bg-red-50'
                  }`}>
                    <svg 
                      className="w-5 h-5" 
                      fill={report.current_user_liked ? "currentColor" : "none"} 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <span className="font-medium text-sm">{report.likes_count || 0}</span>
                </button>

                <div className="flex items-center space-x-2">
                  <div className="p-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <span className="font-medium text-sm">{report.views_count || 0}</span>
                </div>
              </div>

              {hasImages && imageCount > 1 && (
                <div className="text-gray-400 text-sm">
                  {imageCount} images
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(ReportCard);