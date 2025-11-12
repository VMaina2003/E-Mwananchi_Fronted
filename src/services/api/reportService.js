// src/services/api/reportService.js
import api from './api';

class ReportService {
  /**
   * Get all reports with optional filtering
   */
  async getReports(params = {}) {
    try {
      console.log('🔍 Fetching reports with params:', params);
      
      // Clean up params - remove empty values
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([_, value]) => 
          value !== '' && value !== null && value !== undefined
        )
      );

      const response = await api.get('/reports/', { params: cleanParams });
      
      console.log('✅ Reports fetched successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching reports:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get a single report by ID
   */
  async getReport(id) {
    try {
      const response = await api.get(`/reports/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching report ${id}:`, error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Create a new report
   */
  async createReport(reportData) {
    try {
      console.log('Creating report with data:', { 
        title: reportData.title,
        county: reportData.county,
        imageCount: reportData.new_images?.length || 0 
      });

      const formData = new FormData();

      // Add text fields
      const fields = [
        'title', 'description', 'county', 'subcounty', 'ward', 
        'department', 'priority', 'status'
      ];

      fields.forEach(field => {
        if (reportData[field] !== null && reportData[field] !== undefined && reportData[field] !== '') {
          formData.append(field, reportData[field]);
        }
      });

      // Add coordinates
      if (reportData.latitude) {
        formData.append('latitude', parseFloat(reportData.latitude).toFixed(6));
      }
      if (reportData.longitude) {
        formData.append('longitude', parseFloat(reportData.longitude).toFixed(6));
      }

      // Add images
      if (reportData.new_images && reportData.new_images.length > 0) {
        reportData.new_images.forEach((image) => {
          formData.append('new_images', image);
        });
      }

      const response = await api.post('/reports/', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
        }
      });
      
      console.log('Report created successfully');
      return response.data;
    } catch (error) {
      console.error('Error creating report:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Update report status
   */
  async updateReportStatus(id, status) {
    try {
      const response = await api.post(`/reports/${id}/update_status/`, { status });
      return response.data;
    } catch (error) {
      console.error(`Error updating status for report ${id}:`, error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get report statistics
   */
  async getReportStats() {
    try {
      const response = await api.get('/reports/stats/');
      return response.data;
    } catch (error) {
      console.error('Error fetching report statistics:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Upload images to existing report
   */
  async uploadReportImages(reportId, images) {
    try {
      const formData = new FormData();
      
      images.forEach((image, index) => {
        formData.append('image', image);
      });

      const response = await api.post(`/reports/${reportId}/upload_images/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      
      console.log('Images uploaded successfully');
      return response.data;
    } catch (error) {
      console.error(`Error uploading images to report ${reportId}:`, error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Update a report
   */
  async updateReport(id, reportData) {
    try {
      const response = await api.patch(`/reports/${id}/`, reportData);
      return response.data;
    } catch (error) {
      console.error(`Error updating report ${id}:`, error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Delete a report
   */
  async deleteReport(id) {
    try {
      const response = await api.delete(`/reports/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting report ${id}:`, error.response?.data || error.message);
      throw error;
    }
  }

  // Alias for compatibility
  async getStats() {
    return this.getReportStats();
  }
}

export default new ReportService();