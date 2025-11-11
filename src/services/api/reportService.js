import api from './api';

class ReportService {
  /**
   * Get all reports with optional filtering
   */
  async getReports(params = {}) {
    try {
      console.log('Fetching reports with params:', params);
      const response = await api.get('/reports/', { params });
      console.log('Reports fetched successfully');
      return response.data;
    } catch (error) {
      console.error('Error fetching reports:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get a single report by ID
   */
  async getReport(id) {
    try {
      console.log(`Fetching report ${id}`);
      const response = await api.get(`/reports/${id}/`);
      console.log('Report fetched successfully');
      return response.data;
    } catch (error) {
      console.error(`Error fetching report ${id}:`, error.response?.data || error.message);
      throw error;
    }
  }

/**
 * Create a new report with image support - FIXED COORDINATES
 */
async createReport(reportData) {
  try {
    console.log('Creating report with data:', { 
      title: reportData.title,
      county: reportData.county,
      imageCount: reportData.new_images?.length || 0 
    });

    const formData = new FormData();

    // Add ALL fields - even null ones, but handle them properly
    const fields = [
      'title', 'description', 'county', 'subcounty', 'ward', 
      'department', 'priority'
    ];

    fields.forEach(field => {
      if (reportData[field] !== null && reportData[field] !== undefined && reportData[field] !== '') {
        formData.append(field, reportData[field]);
      }
    });

    // Format coordinates to max 6 decimal places
    if (reportData.latitude) {
      const lat = parseFloat(reportData.latitude).toFixed(6);
      formData.append('latitude', lat);
    }
    
    if (reportData.longitude) {
      const lng = parseFloat(reportData.longitude).toFixed(6);
      formData.append('longitude', lng);
    }

    // Add images using EXACTLY 'new_images' as your serializer expects
    if (reportData.new_images && reportData.new_images.length > 0) {
      reportData.new_images.forEach((image) => {
        formData.append('new_images', image);
      });
    }

    // Log FormData contents for debugging
    console.log('FormData contents:');
    for (let pair of formData.entries()) {
      console.log(pair[0] + ': ', pair[1]);
    }

    const response = await api.post('/reports/', formData, {
      headers: { 
        'Content-Type': 'multipart/form-data',
      }
    });
    
    console.log('Report created successfully with images');
    return response.data;
  } catch (error) {
    console.error('Error creating report:', error.response?.data || error.message);
    throw error;
  }
}
  /**
   * Upload additional images to existing report
   */
  async uploadReportImages(reportId, images) {
    try {
      console.log(`Uploading ${images.length} images to report ${reportId}`);
      const formData = new FormData();
      
      images.forEach((image, index) => {
        formData.append('image', image);
        if (image.caption) {
          formData.append('caption', image.caption);
        }
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
   * Update report status
   */
  async updateReportStatus(id, status) {
    try {
      console.log(`Updating report ${id} status to: ${status}`);
      const response = await api.post(`/reports/${id}/update_status/`, { status });
      console.log('Status updated successfully');
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
      console.log('Fetching report statistics');
      const response = await api.get('/reports/stats/');
      console.log('Statistics fetched successfully');
      return response.data;
    } catch (error) {
      console.error('Error fetching report statistics:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Update a report (general update)
   */
  async updateReport(id, reportData) {
    try {
      console.log(`Updating report ${id}`);
      const response = await api.patch(`/reports/${id}/`, reportData);
      console.log('Report updated successfully');
      return response.data;
    } catch (error) {
      console.error(`Error updating report ${id}:`, error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Delete a report (soft delete)
   */
  async deleteReport(id) {
    try {
      console.log(`Deleting report ${id}`);
      const response = await api.delete(`/reports/${id}/`);
      console.log('Report deleted successfully');
      return response.data;
    } catch (error) {
      console.error(`Error deleting report ${id}:`, error.response?.data || error.message);
      throw error;
    }
  }
}

export default new ReportService();