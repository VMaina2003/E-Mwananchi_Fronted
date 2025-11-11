// src/services/api/notificationService.js
import api from './api';

class NotificationService {
  /**
   * Get all notifications for current user
   */
  async getNotifications(params = {}) {
    try {
      const response = await api.get('/api/notifications/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  /**
   * Get a single notification by ID
   */
  async getNotification(notificationId) {
    try {
      const response = await api.get(`/api/notifications/${notificationId}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching notification ${notificationId}:`, error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId) {
    try {
      const response = await api.post(`/api/notifications/${notificationId}/mark-read/`);
      return response.data;
    } catch (error) {
      console.error(`Error marking notification ${notificationId} as read:`, error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead() {
    try {
      const response = await api.post('/api/notifications/mark-all-read/');
      return response.data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId) {
    try {
      const response = await api.delete(`/api/notifications/${notificationId}/`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting notification ${notificationId}:`, error);
      throw error;
    }
  }

  /**
   * Create a new notification (admin only)
   */
  async createNotification(notificationData) {
    try {
      const response = await api.post('/api/notifications/', notificationData);
      return response.data;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Get notification statistics
   */
  async getNotificationStats() {
    try {
      const response = await api.get('/api/notifications/stats/');
      return response.data;
    } catch (error) {
      console.error('Error fetching notification stats:', error);
      throw error;
    }
  }

  /**
   * Get unread notifications count
   */
  async getUnreadCount() {
    try {
      const response = await api.get('/api/notifications/unread-count/');
      return response.data;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      throw error;
    }
  }
}

export default new NotificationService();