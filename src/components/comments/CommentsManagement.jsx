import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import commentService from '../../services/api/commentService'; // adjust path
import { showSuccess, showError } from '../../utils/alerts'; // adjust path
import { STATUS_CONFIG } from '../../constants/statusConfig'; // adjust path

const CommentsManagement = ({ comments = [], loadAdminData }) => {
  const navigate = useNavigate();
  const [selectedComment, setSelectedComment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleDeleteComment = async (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment? This action cannot be undone.')) {
      try {
        await commentService.deleteComment(commentId);
        showSuccess('Comment deleted successfully', 'Comment Management');
        loadAdminData(); // reload data after deletion
      } catch (error) {
        console.error(error);
        showError('Failed to delete comment', 'Deletion Error');
      }
    }
  };

  const handleViewReport = (comment) => {
    if (comment.report) {
      navigate(`/reports/${comment.report.id}`);
    }
  };

  const filteredComments = comments.filter(comment =>
    comment.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comment.user?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comment.user?.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Comments Management</h3>
            <p className="text-gray-600 text-sm">Manage and moderate user comments</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Search comments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div className="divide-y divide-gray-200">
        {filteredComments.length > 0 ? (
          filteredComments.map(comment => (
            <div key={comment.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                {/* Comment Info */}
                <div className="flex-1">
                  <div className="flex items-start space-x-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-semibold text-xs">
                        {comment.user?.first_name?.charAt(0)}
                        {comment.user?.last_name?.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="text-sm font-medium text-gray-900">
                          {comment.user?.first_name} {comment.user?.last_name}
                        </h4>
                        <span
                          className={`px-2 py-1 text-xs rounded ${
                            comment.comment_type === 'official'
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : 'bg-gray-100 text-gray-800 border border-gray-200'
                          }`}
                        >
                          {comment.comment_type === 'official' ? 'Official' : 'Citizen'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(comment.created_at).toLocaleDateString('en-KE', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-3">{comment.content}</p>

                      {/* Related Report */}
                      {comment.report && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-blue-900">
                                Related Report: {comment.report.title}
                              </p>
                              <p className="text-xs text-blue-700">
                                Status:{' '}
                                {STATUS_CONFIG[comment.report.status]?.label || comment.report.status}
                              </p>
                            </div>
                            <button
                              onClick={() => handleViewReport(comment)}
                              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                            >
                              View Report
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedComment(comment)}
                    className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Details
                  </button>
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 text-center">
            <svg
              className="w-16 h-16 text-gray-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Comments Found</h3>
            <p className="text-gray-600">No comments available in the system.</p>
          </div>
        )}
      </div>

      {/* Comment Details Modal */}
      {selectedComment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Comment Details</h3>
              <button
                onClick={() => setSelectedComment(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Commenter</label>
                  <p className="text-gray-900">
                    {selectedComment.user?.first_name} {selectedComment.user?.last_name}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Comment Type</label>
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      selectedComment.comment_type === 'official'
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : 'bg-gray-100 text-gray-800 border border-gray-200'
                    }`}
                  >
                    {selectedComment.comment_type === 'official' ? 'Official' : 'Citizen'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Comment Content</label>
                <p className="text-gray-900">{selectedComment.content}</p>
              </div>

              {selectedComment.report && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-blue-900 mb-1">
                    Related Report: {selectedComment.report.title}
                  </p>
                  <p className="text-xs text-blue-700">
                    Status:{' '}
                    {STATUS_CONFIG[selectedComment.report.status]?.label ||
                      selectedComment.report.status}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentsManagement;
