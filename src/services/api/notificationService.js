// src/services/api/notificationService.js
import api from './api';

class NotificationService {
  /**
   * Get all notifications for current user
   */
  async getNotifications(params = {}) {
    try {
      const response = await api.get('/notifications/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get a single notification by ID
   */
  async getNotification(notificationId) {
    try {
      const response = await api.get(`/notifications/${notificationId}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching notification ${notificationId}:`, error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId) {
    try {
      const response = await api.post(`/notifications/${notificationId}/mark-read/`);
      return response.data;
    } catch (error) {
      console.error(`Error marking notification ${notificationId} as read:`, error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead() {
    try {
      const response = await api.post('/notifications/mark-all-read/');
      return response.data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId) {
    try {
      const response = await api.delete(`/notifications/${notificationId}/`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting notification ${notificationId}:`, error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Create a new notification (admin only)
   */
  async createNotification(notificationData) {
    try {
      const response = await api.post('/notifications/', notificationData);
      return response.data;
    } catch (error) {
      console.error('Error creating notification:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get notification statistics
   */
  async getNotificationStats() {
    try {
      const response = await api.get('/notifications/stats/');
      return response.data;
    } catch (error) {
      console.error('Error fetching notification stats:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get unread notifications count
   */
  async getUnreadCount() {
    try {
      const response = await api.get('/notifications/unread-count/');
      return response.data;
    } catch (error) {
      console.error('Error fetching unread count:', error.response?.data || error.message);
      throw error;
    }
  }
}

export default new NotificationService();