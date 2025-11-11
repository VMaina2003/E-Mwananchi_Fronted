// src/services/api/commentService.js
import api from './api';

class CommentService {
  /**
   * Get all comments with filtering
   */
  async getComments(params = {}) {
    try {
      const response = await api.get('/comments/comments', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }
  }

  /**
   * Get comments for a specific report
   */
  async getCommentsByReport(reportId) {
    try {
      const response = await api.get('/comments/comments', { 
        params: { report: reportId } 
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching comments for report ${reportId}:`, error);
      throw error;
    }
  }

  /**
   * Get a single comment by ID
   */
  async getComment(commentId) {
    try {
      const response = await api.get(`/comments/comments/${commentId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching comment ${commentId}:`, error);
      throw error;
    }
  }

  /**
   * Create a new comment
   */
  async createComment(commentData) {
    try {
      const response = await api.post('/comments/comments', commentData);
      return response.data;
    } catch (error) {
      console.error('Error creating comment:', error);
      throw error;
    }
  }

  /**
   * Update a comment
   */
  async updateComment(commentId, commentData) {
    try {
      const response = await api.patch(`/comments/${commentId}`, commentData);
      return response.data;
    } catch (error) {
      console.error(`Error updating comment ${commentId}:`, error);
      throw error;
    }
  }

  /**
   * Delete a comment
   */
  async deleteComment(commentId) {
    try {
      const response = await api.delete(`/comments/comments/${commentId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting comment ${commentId}:`, error);
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
      const response = await api.get('/comments/comments', { params });
      return response.data;
    } catch (error) {
      console.error(`Error fetching comments by type ${commentType}:`, error);
      throw error;
    }
  }
}

export default new CommentService();