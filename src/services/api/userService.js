// src/services/api/userService.js
import api from './api';

class UserService {
  /**
   * Get all users
   */
  async getUsers(params = {}) {
    try {
      const response = await api.get('/auth/users/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  async getUser(userId) {
    try {
      const response = await api.get(`/auth/users/${userId}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Update user
   */
  async updateUser(userId, userData) {
    try {
      const response = await api.patch(`/auth/users/${userId}/`, userData);
      return response.data;
    } catch (error) {
      console.error(`Error updating user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Delete user
   */
  async deleteUser(userId) {
    try {
      const response = await api.delete(`/auth/users/${userId}/`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Activate user
   */
  async activateUser(userId) {
    try {
      const response = await api.post(`/auth/users/${userId}/activate/`);
      return response.data;
    } catch (error) {
      console.error(`Error activating user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Deactivate user
   */
  async deactivateUser(userId) {
    try {
      const response = await api.post(`/auth/users/${userId}/deactivate/`);
      return response.data;
    } catch (error) {
      console.error(`Error deactivating user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Update user role
   */
  async updateUserRole(userId, role) {
    return this.updateUser(userId, { role });
  }
}

export default new UserService();