// src/services/api/developmentService.js
import api from './api';

class DevelopmentService {
  /**
   * Get all government development projects
   */
  async getGovernmentProjects(params = {}) {
    try {
      const response = await api.get('/government-developments/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching government projects:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get a single government project by ID
   */
  async getGovernmentProject(id) {
    try {
      const response = await api.get(`/government-developments/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching government project ${id}:`, error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Create a new government development project
   */
  async createGovernmentProject(projectData) {
    try {
      const response = await api.post('/government-developments/', projectData);
      return response.data;
    } catch (error) {
      console.error('Error creating government project:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Update a government development project
   */
  async updateGovernmentProject(id, projectData) {
    try {
      const response = await api.patch(`/government-developments/${id}/`, projectData);
      return response.data;
    } catch (error) {
      console.error(`Error updating government project ${id}:`, error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Update project progress
   */
  async updateProjectProgress(id, progressData) {
    try {
      const response = await api.post(`/government-developments/${id}/update-progress/`, progressData);
      return response.data;
    } catch (error) {
      console.error(`Error updating project progress ${id}:`, error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get projects by county
   */
  async getProjectsByCounty(countyId) {
    try {
      const response = await api.get(`/government-developments/?county=${countyId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching projects for county ${countyId}:`, error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get projects by department
   */
  async getProjectsByDepartment(departmentId) {
    try {
      const response = await api.get(`/government-developments/?department=${departmentId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching projects for department ${departmentId}:`, error.response?.data || error.message);
      throw error;
    }
  }
}

export default new DevelopmentService();