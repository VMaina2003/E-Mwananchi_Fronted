// src/components/developments/GovernmentProjectCard.jsx
import React, { useState } from 'react';

const GovernmentProjectCard = ({ project, onCommentClick }) => {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(project.likes_count || 0);

  const handleLike = () => {
    setLiked(!liked);
    setLikesCount(liked ? likesCount - 1 : likesCount + 1);
  };

  const getStatusColor = (status) => {
    const statusColors = {
      'planned': 'bg-blue-100 text-blue-800',
      'in_progress': 'bg-yellow-100 text-yellow-800',
      'completed': 'bg-green-100 text-green-800',
      'delayed': 'bg-orange-100 text-orange-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
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

  return (
    <div className="p-6 border-b border-gray-100 last:border-b-0">
      {/* Project Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">{project.title}</h3>
            <p className="text-sm text-gray-500">
              Government Project • {project.county?.name || project.county} • {project.department?.department?.name || project.department}
            </p>
          </div>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(project.status)}`}>
          {getStatusText(project.status)}
        </span>
      </div>

      {/* Project Content */}
      <div className="mb-4">
        <p className="text-gray-700 mb-4 leading-relaxed">{project.description}</p>
        
        {/* Project Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4 p-3 bg-gray-50 rounded-lg">
          {project.budget && (
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v1m0 6v0m0-6h0m0 6h0" />
              </svg>
              <span><strong>Budget:</strong> KSh {project.budget.toLocaleString()}</span>
            </div>
          )}
          
          {project.start_date && (
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span><strong>Start:</strong> {new Date(project.start_date).toLocaleDateString('en-KE')}</span>
            </div>
          )}
          
          {project.expected_completion && (
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span><strong>Expected:</strong> {new Date(project.expected_completion).toLocaleDateString('en-KE')}</span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {(project.progress_percentage !== undefined && project.progress_percentage !== null) && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Project Progress</span>
              <span className="text-sm font-semibold text-green-600">{project.progress_percentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-green-600 h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${project.progress_percentage}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Progress Updates */}
        {project.progress_updates && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">Latest Update</h4>
            <p className="text-sm text-blue-800">{project.progress_updates}</p>
          </div>
        )}
      </div>

      {/* Engagement Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-6 text-gray-500">
          <button 
            onClick={handleLike}
            className={`flex items-center space-x-2 transition-colors ${
              liked ? 'text-green-600' : 'hover:text-green-600'
            }`}
          >
            <svg className="w-5 h-5" fill={liked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905a3.61 3.61 0 01-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
            </svg>
            <span className="text-sm font-medium">{likesCount}</span>
          </button>

          <button 
            onClick={onCommentClick}
            className="flex items-center space-x-2 hover:text-green-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="text-sm font-medium">{project.comments_count || 0}</span>
          </button>

          <button className="flex items-center space-x-2 hover:text-green-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            <span className="text-sm font-medium">Share</span>
          </button>
        </div>

        <div className="text-right">
          <span className="text-xs text-gray-400 block">
            Posted {new Date(project.created_at).toLocaleDateString('en-KE')}
          </span>
          {project.created_by && (
            <span className="text-xs text-gray-500">
              By {project.created_by.first_name} {project.created_by.last_name}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default GovernmentProjectCard;