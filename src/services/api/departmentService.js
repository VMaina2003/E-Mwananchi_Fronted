// src/services/api/departmentService.js - UPDATED
import api from './api';

class DepartmentService {
  async getDepartments() {
    try {
      const response = await api.get('/department/departments/');
      
      // Handle different response formats
      let departmentsData = [];
      
      if (Array.isArray(response.data)) {
        departmentsData = response.data;
      } else if (response.data.results && Array.isArray(response.data.results)) {
        departmentsData = response.data.results;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        departmentsData = response.data.data;
      } else {
        console.warn('Unexpected departments API response format:', response.data);
        departmentsData = [];
      }
      
      console.log(`Loaded ${departmentsData.length} departments`);
      return departmentsData;
    } catch (error) {
      console.error('Error fetching departments:', error.response?.data || error.message);
      return [];
    }
  }

  async getCountyDepartments(params = {}) {
    try {
      const response = await api.get('/department/county-departments/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching county departments:', error.response?.data || error.message);
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
      console.error(`Error updating department ${departmentId}:`, error.response?.data || error.message);
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
      console.error(`Error deleting department ${departmentId}:`, error.response?.data || error.message);
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
      console.error('Error creating county department:', error.response?.data || error.message);
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
      console.error(`Error updating county department ${countyDepartmentId}:`, error.response?.data || error.message);
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
      console.error(`Error deleting county department ${countyDepartmentId}:`, error.response?.data || error.message);
      throw error;
    }
  }
}

export default new DepartmentService();