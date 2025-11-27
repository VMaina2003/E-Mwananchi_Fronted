// src/components/developments/GovernmentProjectCard.jsx
import React, { useState } from 'react';

const GovernmentProjectCard = ({ project, onCommentClick, onLike, onProjectClick, isLast }) => {
  const [liked, setLiked] = useState(project.current_user_liked || false);
  const [likesCount, setLikesCount] = useState(project.likes_count || 0);

  const handleLike = (e) => {
    e.stopPropagation();
    setLiked(!liked);
    setLikesCount(liked ? likesCount - 1 : likesCount + 1);
    if (onLike) {
      onLike(project.id);
    }
  };

  const handleCardClick = (e) => {
    if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
      return;
    }
    if (onProjectClick) {
      onProjectClick(project);
    }
  };

  const handleCommentClick = (e) => {
    e.stopPropagation();
    if (onCommentClick) {
      onCommentClick(project);
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      'planned': 'bg-blue-100 text-blue-800 border-blue-200',
      'in_progress': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'completed': 'bg-green-100 text-green-800 border-green-200',
      'delayed': 'bg-orange-100 text-orange-800 border-orange-200',
      'cancelled': 'bg-red-100 text-red-800 border-red-200'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusText = (status) => {
    const statusText = {
      'planned': 'Planned',
      'in_progress': 'In Progress',
      'completed': 'Completed',
      'delayed': 'Delayed',
      'cancelled': 'Cancelled'
    };
    return statusText[status] || status;
  };

  const formatBudget = (budget) => {
    if (!budget) return 'Not specified';
    return `KSh ${parseFloat(budget).toLocaleString('en-KE')}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDepartmentName = (department) => {
    if (!department) return 'Not assigned';
    return department.department?.name || department.name || 'Department';
  };

  const getCountyName = (county) => {
    if (!county) return 'Not specified';
    return county.name || county;
  };

  return (
    <div 
      className={`p-6 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-all duration-200 cursor-pointer ${
        isLast ? 'rounded-b-xl' : ''
      }`}
      onClick={handleCardClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3 flex-1">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-gray-900 mb-1 leading-tight hover:text-green-600 transition-colors">
              {project.title}
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-xs px-3 py-1 rounded-full border font-semibold ${getStatusColor(project.status)}`}>
                {getStatusText(project.status)}
              </span>
              <span className="text-sm text-gray-600">
                {getCountyName(project.county)} County • {getDepartmentName(project.department)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-gray-700 mb-6 leading-relaxed text-lg">{project.description}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {project.budget && (
            <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v1m0 6v0m0-6h0m0 6h0" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-green-900">Budget</p>
                  <p className="text-lg font-bold text-green-700">{formatBudget(project.budget)}</p>
                </div>
              </div>
            </div>
          )}
          
          {(project.progress_percentage !== undefined && project.progress_percentage !== null) && (
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-900">Progress</p>
                  <p className="text-lg font-bold text-blue-700">{project.progress_percentage}% Complete</p>
                </div>
              </div>
            </div>
          )}

          {project.start_date && (
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-purple-900">Start Date</p>
                  <p className="text-lg font-bold text-purple-700">{formatDate(project.start_date)}</p>
                </div>
              </div>
            </div>
          )}

          {project.expected_completion && (
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-orange-900">Expected Completion</p>
                  <p className="text-lg font-bold text-orange-700">{formatDate(project.expected_completion)}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {(project.progress_percentage !== undefined && project.progress_percentage !== null) && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-semibold text-gray-700">Project Progress</span>
              <span className="text-sm font-bold text-green-600">{project.progress_percentage}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 shadow-inner">
              <div 
                className="bg-gradient-to-r from-green-500 to-green-600 h-4 rounded-full transition-all duration-500 ease-out shadow-sm"
                style={{ width: `${project.progress_percentage}%` }}
              ></div>
            </div>
          </div>
        )}

        {project.progress_updates && (
          <div className="mt-4 p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 shadow-sm">
            <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Latest Progress Update
            </h4>
            <p className="text-sm text-blue-800 leading-relaxed">{project.progress_updates}</p>
          </div>
        )}

        {project.images && project.images.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Project Images ({project.images.length})
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {project.images.slice(0, 4).map((image, index) => (
                <div key={index} className="aspect-square rounded-lg overflow-hidden border border-gray-300 bg-gray-100 shadow-sm">
                  <img
                    src={image.image_url || image.thumbnail_url || image.image}
                    alt={`Project image ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
              {project.images.length > 4 && (
                <div className="aspect-square rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center">
                  <span className="text-sm text-gray-500 font-medium">+{project.images.length - 4} more</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-6 text-gray-600">
          <button 
            onClick={handleLike}
            className={`flex items-center space-x-2 transition-all ${
              liked ? 'text-green-600 transform scale-110' : 'hover:text-green-600 hover:scale-105'
            }`}
          >
            <svg className="w-5 h-5" fill={liked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905a3.61 3.61 0 01-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
            </svg>
            <span className="text-sm font-semibold">{likesCount}</span>
          </button>

          <button 
            onClick={handleCommentClick}
            className="flex items-center space-x-2 hover:text-green-600 hover:scale-105 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="text-sm font-semibold">{project.comments_count || 0}</span>
          </button>

          <div className="flex items-center space-x-2 text-gray-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span className="text-sm font-semibold">{project.views_count || 0}</span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs text-gray-500 block">
            Created {formatDate(project.created_at)}
          </span>
          {project.created_by && (
            <span className="text-xs text-gray-600 font-medium">
              By {project.created_by.first_name} {project.created_by.last_name}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default GovernmentProjectCard;