// services/api/commentService.js - UPDATED VERSION
import api from "./api";

class CommentService {
  /**
   * Get all comments with optional filtering
   */
  async getComments(params = {}) {
    try {
      const response = await api.get("/comments/comments/", { params });
      return response.data;
    } catch (error) {
      console.error(
        "Error fetching comments:",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  /**
   * Get comments for a specific report
   */
  async getCommentsByReport(reportId) {
    try {
      const response = await api.get("/comments/comments/", {
        params: { report: reportId },
      });
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching comments for report ${reportId}:`,
        error.response?.data || error.message
      );
      throw error;
    }
  }

  // services/api/commentService.js - FIXED CREATE METHOD
  async createComment(commentData) {
    try {
      console.log("Creating comment with data:", commentData);

      // Remove user field - let Django handle it automatically
      const { user, ...cleanCommentData } = commentData;

      const response = await api.post("/comments/comments/", cleanCommentData);
      return response.data;
    } catch (error) {
      console.error(
        "Error creating comment:",
        error.response?.data || error.message
      );
      throw error;
    }
  }
  /**
   * Get a single comment by ID
   */
  async getComment(commentId) {
    try {
      const response = await api.get(`/comments/comments/${commentId}/`);
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching comment ${commentId}:`,
        error.response?.data || error.message
      );
      throw error;
    }
  }

  /**
   * Update a comment
   */
  async updateComment(commentId, commentData) {
    try {
      const response = await api.patch(
        `/comments/comments/${commentId}/`,
        commentData
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error updating comment ${commentId}:`,
        error.response?.data || error.message
      );
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
      console.error(
        `Error deleting comment ${commentId}:`,
        error.response?.data || error.message
      );
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
      const response = await api.get("/comments/comments/", { params });
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching comments by type ${commentType}:`,
        error.response?.data || error.message
      );
      throw error;
    }
  }
}

export default new CommentService();
