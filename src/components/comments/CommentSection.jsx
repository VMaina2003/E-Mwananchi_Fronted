// CommentSection.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import commentService from '../../services/api/commentService';

const CommentSection = ({ reportId, user, onAddComment }) => {
  const { showSuccess, showError, showInfo } = useNotification();
  const [comments, setComments] = useState({
    official: [],
    citizen: []
  });
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Load comments
  const loadComments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await commentService.getCommentsByReport(reportId);
      setComments({
        official: response.official_responses || [],
        citizen: response.citizen_comments || []
      });
    } catch (error) {
      console.error('Failed to load comments:', error);
      showError('Failed to load comments');
    } finally {
      setLoading(false);
    }
  }, [reportId, showError]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  // Add new comment
  const handleAddComment = async (commentType = 'citizen') => {
    if (!newComment.trim()) {
      showError('Please enter a comment');
      return;
    }

    try {
      setSubmitting(true);
      const commentData = {
        report: reportId,
        content: newComment.trim(),
        comment_type: user?.role === 'citizen' ? 'citizen' : commentType
      };

      await commentService.createComment(commentData);
      setNewComment('');
      await loadComments();
      
      if (onAddComment) {
        onAddComment(reportId, newComment);
      }
      
      showSuccess(
        commentType === 'official' ? 'Official response posted' : 'Comment added successfully'
      );
    } catch (error) {
      console.error('Failed to add comment:', error);
      showError(error.response?.data?.detail || 'Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  // Add reply to comment
  const handleAddReply = async (parentComment) => {
    if (!replyContent.trim()) {
      showError('Please enter a reply');
      return;
    }

    try {
      setSubmitting(true);
      await commentService.replyToComment(parentComment.id, {
        content: replyContent.trim()
      });

      setReplyContent('');
      setReplyingTo(null);
      await loadComments();
      showSuccess('Reply added successfully');
    } catch (error) {
      console.error('Failed to add reply:', error);
      showError(error.response?.data?.detail || 'Failed to add reply');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete comment
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      await commentService.deleteComment(commentId);
      await loadComments();
      showSuccess('Comment deleted successfully');
    } catch (error) {
      console.error('Failed to delete comment:', error);
      showError(error.response?.data?.detail || 'Failed to delete comment');
    }
  };

  // Comment item component
  const CommentItem = ({ comment, depth = 0 }) => {
    const canDelete = comment.can_delete || (user && user.id === comment.user);
    const canReply = user && depth === 0 && comment.comment_type === 'citizen';

    return (
      <div className={`comment-item ${depth > 0 ? 'ml-8 border-l-2 border-gray-200 pl-4' : ''}`}>
        <div className={`p-4 rounded-lg ${
          comment.comment_type === 'official' 
            ? 'bg-blue-50 border border-blue-200' 
            : 'bg-gray-50 border border-gray-200'
        }`}>
          {/* Comment Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold ${
                comment.comment_type === 'official' 
                  ? 'bg-blue-600' 
                  : 'bg-green-600'
              }`}>
                {comment.user_avatar || 'U'}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-gray-900">
                    {comment.user_display_name}
                  </span>
                  {comment.comment_type === 'official' && (
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      Official
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(comment.created_at).toLocaleDateString()} at{' '}
                  {new Date(comment.created_at).toLocaleTimeString()}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              {canReply && (
                <button
                  onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Reply
                </button>
              )}
              {canDelete && (
                <button
                  onClick={() => handleDeleteComment(comment.id)}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              )}
            </div>
          </div>

          {/* Comment Content */}
          <div className="text-gray-700 mb-3">
            {comment.content}
          </div>

          {/* Reply Form */}
          {replyingTo === comment.id && (
            <div className="mt-3">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write your reply..."
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                rows="2"
              />
              <div className="flex justify-end space-x-2 mt-2">
                <button
                  onClick={() => {
                    setReplyingTo(null);
                    setReplyContent('');
                  }}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleAddReply(comment)}
                  disabled={submitting || !replyContent.trim()}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {submitting ? 'Posting...' : 'Post Reply'}
                </button>
              </div>
            </div>
          )}

          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-3 space-y-3">
              {comment.replies.map(reply => (
                <CommentItem 
                  key={reply.id} 
                  comment={reply} 
                  depth={depth + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <span className="ml-3 text-gray-600">Loading comments...</span>
      </div>
    );
  }

  return (
    <div className="comment-section space-y-6">
      {/* Official Responses Section */}
      {comments.official.length > 0 && (
        <div className="official-comments">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <svg className="w-6 h-6 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Official Responses ({comments.official.length})
          </h3>
          <div className="space-y-4">
            {comments.official.map(comment => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
          </div>
        </div>
      )}

      {/* Community Comments Section */}
      <div className="citizen-comments">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <svg className="w-6 h-6 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 005 10c0-1.777.833-3.357 2.125-4.418A5 5 0 0010 11z" clipRule="evenodd" />
          </svg>
          Community Comments ({comments.citizen.length})
        </h3>

        {/* Add Comment Form */}
        {user && (
          <div className="add-comment-form bg-white rounded-lg border border-gray-200 p-4 mb-6">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={
                user.role === 'county_official' 
                  ? 'Add an official response or community comment...'
                  : 'Share your thoughts with the community...'
              }
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
              rows="3"
            />
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-3 space-y-3 sm:space-y-0">
              <div className="flex items-center space-x-4">
                {user.role !== 'citizen' && (
                  <div className="flex items-center space-x-2">
                    <label className="flex items-center space-x-2 text-sm text-gray-700">
                      <input
                        type="radio"
                        name="commentType"
                        value="citizen"
                        defaultChecked
                        className="text-green-600 focus:ring-green-500"
                      />
                      <span>Community Comment</span>
                    </label>
                    <label className="flex items-center space-x-2 text-sm text-gray-700">
                      <input
                        type="radio"
                        name="commentType"
                        value="official"
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span>Official Response</span>
                    </label>
                  </div>
                )}
              </div>
              
              <button
                onClick={() => {
                  const commentType = document.querySelector('input[name="commentType"]:checked')?.value || 'citizen';
                  handleAddComment(commentType);
                }}
                disabled={submitting || !newComment.trim()}
                className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {submitting ? 'Posting...' : 'Post Comment'}
              </button>
            </div>
          </div>
        )}

        {/* Comments List */}
        <div className="space-y-4">
          {comments.citizen.length > 0 ? (
            comments.citizen.map(comment => (
              <CommentItem key={comment.id} comment={comment} />
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p>No comments yet. Be the first to share your thoughts!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentSection;