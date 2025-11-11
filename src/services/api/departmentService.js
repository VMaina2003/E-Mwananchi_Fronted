// src/services/api/departmentService.js
import api from './api';

class DepartmentService {
  /**
   * Get all departments
   */
  async getDepartments() {
    try {
      const response = await api.get('/department/departments/');
      return response.data;
    } catch (error) {
      console.error('Error fetching departments:', error);
      throw error;
    }
  }

  /**
   * Get county departments with filtering
   */
  async getCountyDepartments(params = {}) {
    try {
      const response = await api.get('/department/county-departments/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching county departments:', error);
      throw error;
    }
  }

  /**
   * Create department - check if this endpoint exists
   */
  async createDepartment(departmentData) {
    try {
      const response = await api.post('/department/departments/', departmentData);
      return response.data;
    } catch (error) {
      console.error('Error creating department:', error);
      throw error;
    }
  }

  /**
   * Update department
   */
  async updateDepartment(departmentId, departmentData) {
    try {
      const response = await api.patch(`/department/departments/${departmentId}/`, departmentData);
      return response.data;
    } catch (error) {
      console.error(`Error updating department ${departmentId}:`, error);
      throw error;
    }
  }

  /**
   * Delete department
   */
  async deleteDepartment(departmentId) {
    try {
      const response = await api.delete(`/department/departments/${departmentId}/`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting department ${departmentId}:`, error);
      throw error;
    }
  }

  /**
   * Create county department
   */
  async createCountyDepartment(countyDepartmentData) {
    try {
      const response = await api.post('/department/county-departments/', countyDepartmentData);
      return response.data;
    } catch (error) {
      console.error('Error creating county department:', error);
      throw error;
    }
  }

  /**
   * Update county department
   */
  async updateCountyDepartment(countyDepartmentId, countyDepartmentData) {
    try {
      const response = await api.patch(`/department/county-departments/${countyDepartmentId}/`, countyDepartmentData);
      return response.data;
    } catch (error) {
      console.error(`Error updating county department ${countyDepartmentId}:`, error);
      throw error;
    }
  }

  /**
   * Delete county department
   */
  async deleteCountyDepartment(countyDepartmentId) {
    try {
      const response = await api.delete(`/department/county-departments/${countyDepartmentId}/`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting county department ${countyDepartmentId}:`, error);
      throw error;
    }
  }
}

export default new DepartmentService();