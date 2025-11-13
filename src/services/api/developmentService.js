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
      
      // Return empty results instead of throwing error
      return {
        results: [],
        count: 0
      };
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
      const response = await api.post(`/government-developments/${id}/update_progress/`, progressData);
      return response.data;
    } catch (error) {
      console.error(`Error updating project progress ${id}:`, error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Like a government project
   */
  async likeProject(id) {
    try {
      const response = await api.post(`/government-developments/${id}/like/`);
      return response.data;
    } catch (error) {
      console.error(`Error liking project ${id}:`, error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Unlike a government project
   */
  async unlikeProject(id) {
    try {
      const response = await api.post(`/government-developments/${id}/unlike/`);
      return response.data;
    } catch (error) {
      console.error(`Error unliking project ${id}:`, error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get development statistics
   */
  async getDevelopmentStats() {
    try {
      const response = await api.get('/government-developments/stats/');
      return response.data;
    } catch (error) {
      console.error('Error fetching development stats:', error.response?.data || error.message);
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