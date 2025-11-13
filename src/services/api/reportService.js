// src/services/api/reportService.js - OPTIMIZED & CLEANED
import api from "./api";

class ReportService {
  /**
   * Get reports with optional filtering
   * For Browse Reports: Shows ALL reports
   * For My Reports: Use getMyReports() method
   */
  async getReports(params = {}) {
    try {
      console.log("📋 Fetching reports with params:", params);

      // Clean parameters - remove empty values
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([_, value]) => 
          value !== "" && value !== null && value !== undefined
        )
      );

      // Set default parameters
      const finalParams = {
        limit: 50,
        ordering: "-created_at",
        ...cleanParams,
      };

      const response = await api.get("/reports/", { params: finalParams });

      const reportsData = response.data;
      const reportsCount = reportsData.results?.length || reportsData.length || 0;
      
      console.log(`✅ Successfully fetched ${reportsCount} reports`);
      return reportsData;
    } catch (error) {
      console.error("❌ Error fetching reports:", {
        message: error.response?.data || error.message,
        status: error.response?.status,
        params: params,
      });
      throw this._handleError(error, "Failed to fetch reports");
    }
  }

  /**
   * Get only the current user's reports
   */
  async getMyReports(params = {}) {
    try {
      console.log("👤 Fetching current user's reports");
      
      // Method 1: Using dedicated endpoint if available
      try {
        const response = await api.get("/reports/my_reports/", { params });
        console.log(`✅ Successfully fetched user's reports`);
        return response.data;
      } catch (endpointError) {
        // Method 2: Fallback to filtering by reporter
        console.log("🔄 Using fallback method for user reports");
        const userParams = {
          ...params,
          my_reports: true, // Use the query parameter approach
          ordering: "-created_at",
        };
        return await this.getReports(userParams);
      }
    } catch (error) {
      console.error("❌ Error fetching user's reports:", error);
      throw this._handleError(error, "Failed to fetch your reports");
    }
  }

  /**
   * Get a single report by ID
   */
  async getReport(id) {
    try {
      if (!id) {
        throw new Error("Report ID is required");
      }

      console.log(`📄 Fetching report: ${id}`);
      const response = await api.get(`/reports/${id}/`);
      
      console.log(`✅ Successfully fetched report: ${id}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Error fetching report ${id}:`, error);
      throw this._handleError(error, "Failed to fetch report");
    }
  }

  /**
   * Like a report
   */
  async likeReport(reportId) {
    try {
      if (!reportId) {
        throw new Error("Report ID is required");
      }

      console.log(`❤️ Liking report: ${reportId}`);
      const response = await api.post(`/reports/${reportId}/like/`);
      
      console.log(`✅ Successfully liked report: ${reportId}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Error liking report ${reportId}:`, error);
      throw this._handleError(error, "Failed to like report");
    }
  }

  /**
   * Unlike a report
   */
  async unlikeReport(reportId) {
    try {
      if (!reportId) {
        throw new Error("Report ID is required");
      }

      console.log(`💔 Unliking report: ${reportId}`);
      const response = await api.post(`/reports/${reportId}/unlike/`);
      
      console.log(`✅ Successfully unliked report: ${reportId}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Error unliking report ${reportId}:`, error);
      throw this._handleError(error, "Failed to unlike report");
    }
  }

  /**
   * Increment report views
   */
  async incrementViews(reportId) {
    try {
      if (!reportId) {
        throw new Error("Report ID is required");
      }

      console.log(`👀 Incrementing views for report: ${reportId}`);
      const response = await api.post(`/reports/${reportId}/increment_views/`);
      
      console.log(`✅ Successfully incremented views for report: ${reportId}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Error incrementing views for report ${reportId}:`, error);
      throw this._handleError(error, "Failed to update view count");
    }
  }

  /**
   * Get users who liked a report
   */
  async getReportLikes(reportId) {
    try {
      if (!reportId) {
        throw new Error("Report ID is required");
      }

      console.log(`👍 Fetching likes for report: ${reportId}`);
      const response = await api.get(`/reports/${reportId}/likes/`);
      
      console.log(`✅ Successfully fetched likes for report: ${reportId}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Error fetching likes for report ${reportId}:`, error);
      throw this._handleError(error, "Failed to fetch likes");
    }
  }

  /**
   * Create a new report
   */
  async createReport(reportData) {
    try {
      console.log("📝 Creating new report:", {
        title: reportData.title,
        county: reportData.county,
        imageCount: reportData.new_images?.length || 0,
      });

      const formData = new FormData();

      // Add text fields
      const textFields = [
        "title", "description", "county", "subcounty", "ward", 
        "department", "priority", "status"
      ];

      textFields.forEach((field) => {
        if (reportData[field] !== null && reportData[field] !== undefined && reportData[field] !== "") {
          formData.append(field, reportData[field]);
        }
      });

      // Add coordinates with precision
      if (reportData.latitude) {
        formData.append("latitude", parseFloat(reportData.latitude).toFixed(6));
      }
      if (reportData.longitude) {
        formData.append("longitude", parseFloat(reportData.longitude).toFixed(6));
      }

      // Add images
      if (reportData.new_images && reportData.new_images.length > 0) {
        reportData.new_images.forEach((image, index) => {
          if (image instanceof File) {
            formData.append("new_images", image);
          } else {
            console.warn(`⚠️ Skipping invalid image at index ${index}`);
          }
        });
      }

      const response = await api.post("/reports/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 30000,
      });

      console.log(`✅ Report created successfully with ID: ${response.data.id}`);
      return response.data;
    } catch (error) {
      console.error("❌ Error creating report:", error);
      throw this._handleError(error, "Failed to create report");
    }
  }

  /**
   * Update report status
   */
  async updateReportStatus(id, status) {
    try {
      if (!id || !status) {
        throw new Error("Report ID and status are required");
      }

      console.log(`🔄 Updating report status: ${id} to ${status}`);
      const response = await api.post(`/reports/${id}/update_status/`, { status });
      
      console.log(`✅ Successfully updated report status: ${id}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Error updating status for report ${id}:`, error);
      throw this._handleError(error, "Failed to update report status");
    }
  }

  /**
   * Get report statistics
   */
  async getReportStats() {
    try {
      console.log("📊 Fetching report statistics");
      const response = await api.get("/reports/stats/");
      
      console.log("✅ Successfully fetched report statistics");
      return response.data;
    } catch (error) {
      console.error("❌ Error fetching report statistics:", error);
      
      // Return fallback stats
      return {
        total_reports: 0,
        resolved_reports: 0,
        in_progress_reports: 0,
        user_reports_count: 0,
        user_resolved_reports: 0,
        verified_reports: 0,
        pending_reports: 0,
        rejected_reports: 0,
        reports_with_images: 0,
        ai_verified_reports: 0,
        recent_reports_count: 0,
        reports_by_status: {},
        reports_by_county: {},
        reports_by_department: {},
        error: true
      };
    }
  }

  /**
   * Upload images to an existing report
   */
  async uploadReportImages(reportId, images) {
    try {
      if (!reportId || !images || images.length === 0) {
        throw new Error("Report ID and images are required");
      }

      console.log(`🖼️ Uploading ${images.length} images to report: ${reportId}`);
      const formData = new FormData();

      images.forEach((image, index) => {
        if (image instanceof File) {
          formData.append("images", image);
        }
      });

      const response = await api.post(`/reports/${reportId}/upload_images/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 30000,
      });

      console.log(`✅ Successfully uploaded images to report: ${reportId}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Error uploading images to report ${reportId}:`, error);
      throw this._handleError(error, "Failed to upload images");
    }
  }

  /**
   * Update report details
   */
  async updateReport(id, reportData) {
    try {
      if (!id) {
        throw new Error("Report ID is required");
      }

      console.log(`✏️ Updating report: ${id}`);
      const response = await api.patch(`/reports/${id}/`, reportData);
      
      console.log(`✅ Successfully updated report: ${id}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Error updating report ${id}:`, error);
      throw this._handleError(error, "Failed to update report");
    }
  }

  /**
   * Delete a report
   */
  async deleteReport(id) {
    try {
      if (!id) {
        throw new Error("Report ID is required");
      }

      console.log(`🗑️ Deleting report: ${id}`);
      const response = await api.delete(`/reports/${id}/`);
      
      console.log(`✅ Successfully deleted report: ${id}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Error deleting report ${id}:`, error);
      throw this._handleError(error, "Failed to delete report");
    }
  }

  /**
   * Get reports by specific user
   */
  async getUserReports(userId, params = {}) {
    try {
      if (!userId) {
        throw new Error("User ID is required");
      }

      const userParams = {
        ...params,
        reporter: userId,
        ordering: "-created_at",
      };

      console.log(`👥 Fetching reports for user: ${userId}`);
      return await this.getReports(userParams);
    } catch (error) {
      console.error(`❌ Error fetching reports for user ${userId}:`, error);
      throw this._handleError(error, "Failed to fetch user reports");
    }
  }

  /**
   * Get reports by county
   */
  async getReportsByCounty(countyId, params = {}) {
    try {
      if (!countyId) {
        throw new Error("County ID is required");
      }

      const countyParams = {
        ...params,
        county: countyId,
        ordering: "-created_at",
      };

      console.log(`🏙️ Fetching reports for county: ${countyId}`);
      return await this.getReports(countyParams);
    } catch (error) {
      console.error(`❌ Error fetching reports for county ${countyId}:`, error);
      throw this._handleError(error, "Failed to fetch county reports");
    }
  }

  /**
   * Get reports by department
   */
  async getReportsByDepartment(departmentId, params = {}) {
    try {
      if (!departmentId) {
        throw new Error("Department ID is required");
      }

      const deptParams = {
        ...params,
        department: departmentId,
        ordering: "-created_at",
      };

      console.log(`🏢 Fetching reports for department: ${departmentId}`);
      return await this.getReports(deptParams);
    } catch (error) {
      console.error(`❌ Error fetching reports for department ${departmentId}:`, error);
      throw this._handleError(error, "Failed to fetch department reports");
    }
  }

  /**
   * Search reports
   */
  async searchReports(searchTerm, params = {}) {
    try {
      if (!searchTerm || searchTerm.trim() === "") {
        return await this.getReports(params);
      }

      const searchParams = {
        ...params,
        search: searchTerm.trim(),
        ordering: "-created_at",
      };

      console.log(`🔍 Searching reports for: "${searchTerm}"`);
      return await this.getReports(searchParams);
    } catch (error) {
      console.error(`❌ Error searching reports for "${searchTerm}":`, error);
      throw this._handleError(error, "Failed to search reports");
    }
  }

  /**
   * Get analytics data
   */
  async getAnalytics(timeRange = "month") {
    try {
      console.log(`📈 Fetching analytics for time range: ${timeRange}`);
      const response = await api.get("/reports/analytics/", {
        params: { time_range: timeRange },
      });

      console.log("✅ Successfully fetched analytics");
      return response.data;
    } catch (error) {
      console.error("❌ Error fetching analytics:", error);
      throw this._handleError(error, "Failed to fetch analytics");
    }
  }

  /**
   * Alias for getReportStats for backward compatibility
   */
  async getStats() {
    return this.getReportStats();
  }

  /**
   * Error handler utility
   */
  _handleError(error, defaultMessage) {
    const status = error.response?.status;
    const data = error.response?.data;
    
    // Create enhanced error object
    const enhancedError = new Error(data?.detail || data?.message || defaultMessage);
    enhancedError.status = status;
    enhancedError.data = data;
    enhancedError.originalError = error;
    
    return enhancedError;
  }

  /**
   * Check if user has liked a report
   * Utility method for frontend
   */
  hasUserLikedReport(report, userId) {
    if (!report || !userId) return false;
    
    // Check if report has likes array and user is in it
    if (report.likes && Array.isArray(report.likes)) {
      return report.likes.some(like => like.id === userId);
    }
    
    // Fallback: check if user ID is in likes (if stored as IDs)
    if (report.likes_count > 0 && report.liked_by) {
      return report.liked_by.includes(userId);
    }
    
    return false;
  }

  /**
   * Format report for display
   */
  formatReportForDisplay(report) {
    if (!report) return null;
    
    return {
      ...report,
      display_status: report.status?.replace('_', ' ').toUpperCase(),
      display_date: new Date(report.created_at).toLocaleDateString(),
      display_time: new Date(report.created_at).toLocaleTimeString(),
      is_editable: report.status === 'submitted' || report.status === 'pending'
    };
  }
}

// Create and export singleton instance
const reportService = new ReportService();
export default reportService;