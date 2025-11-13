// src/services/api/commentService.js
import api from './api';

/**
 * CommentService - API service for comment operations
 * Handles CRUD operations for comments and comment-related functionality
 */
class CommentService {
  /**
   * Get all comments with optional filtering
   * @param {Object} params - Filter parameters (report, comment_type, etc.)
   * @returns {Promise<Array>} - Array of comments
   */
  async getComments(params = {}) {
    try {
      const response = await api.get('/comments/comments/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching comments:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get comments for a specific report
   * @param {string} reportId - ID of the report
   * @returns {Promise<Array>} - Array of comments for the report
   */
  async getCommentsByReport(reportId) {
    try {
      const response = await api.get('/comments/comments/', { 
        params: { report: reportId } 
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching comments for report ${reportId}:`, error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get a single comment by ID
   * @param {string} commentId - ID of the comment
   * @returns {Promise<Object>} - Comment object
   */
  async getComment(commentId) {
    try {
      const response = await api.get(`/comments/comments/${commentId}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching comment ${commentId}:`, error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Create a new comment
   * @param {Object} commentData - Comment data (report, user, content, comment_type)
   * @returns {Promise<Object>} - Created comment object
   */
  async createComment(commentData) {
    try {
      const response = await api.post('/comments/comments/', commentData);
      return response.data;
    } catch (error) {
      console.error('Error creating comment:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Update a comment
   */
  async updateComment(commentId, commentData) {
    try {
      const response = await api.patch(`/comments/comments/${commentId}/`, commentData);
      return response.data;
    } catch (error) {
      console.error(`Error updating comment ${commentId}:`, error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Delete a comment
   */
  async deleteComment(commentId) {
    try {
      const response = await api.delete(`/comments/comments/${commentId}/`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting comment ${commentId}:`, error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get comments by type (citizen/official)
   */
  async getCommentsByType(commentType, reportId = null) {
    try {
      const params = { comment_type: commentType };
      if (reportId) {
        params.report = reportId;
      }
      const response = await api.get('/comments/comments/', { params });
      return response.data;
    } catch (error) {
      console.error(`Error fetching comments by type ${commentType}:`, error.response?.data || error.message);
      throw error;
    }
  }
}

export default new CommentService();