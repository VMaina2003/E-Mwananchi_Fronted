// components/comments/CommentSection.jsx
import React, { useState, useEffect } from 'react';
import commentService from '../../services/api/commentService';

const CommentSection = ({ reportId, user }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchComments = async () => {
    try {
      const data = await commentService.getCommentsByReport(reportId);
      setComments(data);
      setError('');
    } catch (error) {
      console.error('Failed to fetch comments:', error);
      setError('Failed to load comments');
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    setLoading(true);
    setError('');
    
    try {
      await commentService.createComment({
        report: reportId,
        content: newComment.trim(),
        comment_type: user.role === 'county_official' ? 'official' : 'citizen'
      });
      
      setNewComment('');
      fetchComments(); // Refresh comments
    } catch (error) {
      console.error('Failed to post comment:', error);
      setError('Failed to post comment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      await commentService.deleteComment(commentId);
      fetchComments(); // Refresh comments
    } catch (error) {
      console.error('Failed to delete comment:', error);
      setError('Failed to delete comment');
    }
  };

  useEffect(() => {
    if (reportId) {
      fetchComments();
    }
  }, [reportId]);

  const canDeleteComment = (comment) => {
    if (!user) return false;
    return user.id === comment.user || 
           user.role === 'admin' || 
           user.role === 'superadmin' || 
           user.role === 'county_official';
  };

  return (
    <div className="border-t border-gray-100 p-4 bg-gray-50">
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4 mb-6">
        <h4 className="font-semibold text-gray-700">Comments ({comments.length})</h4>
        
        {comments.length === 0 ? (
          <p className="text-gray-500 text-sm">No comments yet. Be the first to comment!</p>
        ) : (
          comments.map(comment => (
            <div key={comment.id} className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 text-sm font-semibold">
                        {comment.user_name?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold text-sm text-gray-900">
                        {comment.user_name || 'Anonymous'}
                      </span>
                      {comment.comment_type === 'official' && (
                        <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                          Official
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm">{comment.content}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">
                      {new Date(comment.created_at).toLocaleDateString('en-KE', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    
                    {canDeleteComment(comment) && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-red-600 hover:text-red-800 text-xs"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Comment Input (Only for authenticated users) */}
      {user ? (
        <form onSubmit={handleSubmitComment} className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-semibold">
                  {user.first_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                </span>
              </div>
            </div>
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add your comment..."
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                disabled={loading}
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-500">
                  {user.role === 'county_official' ? 'Posting as official' : 'Posting as citizen'}
                </span>
                <button
                  type="submit"
                  disabled={!newComment.trim() || loading}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="text-center py-4 border border-gray-200 rounded-lg bg-white">
          <p className="text-gray-600 text-sm">
            <button 
              onClick={() => window.location.href = '/login'}
              className="text-green-600 hover:text-green-700 font-medium"
            >
              Sign in
            </button> to join the conversation
          </p>
        </div>
      )}
    </div>
  );
};

export default CommentSection;