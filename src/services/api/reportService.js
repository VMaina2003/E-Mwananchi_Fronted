// services/api/reportService.js - PRODUCTION READY
import api from "./api";

class ReportService {
  async createReport(reportData) {
    try {
      console.log("ReportService: Starting report creation");
      
      const formData = new FormData();

      // Append basic fields
      const basicFields = [
        "title", "description", "county", "subcounty", "ward", 
        "department", "priority", "is_anonymous", "anonymous_display_name",
      ];

      basicFields.forEach((field) => {
        const value = reportData[field];
        if (value !== undefined && value !== null && value !== "") {
          if (typeof value === "boolean") {
            formData.append(field, value.toString());
          } else {
            formData.append(field, value);
          }
        }
      });

      // Handle coordinates
      if (reportData.latitude && reportData.latitude !== "") {
        const lat = parseFloat(reportData.latitude);
        if (!isNaN(lat)) {
          formData.append("latitude", lat.toFixed(6));
        }
      }

      if (reportData.longitude && reportData.longitude !== "") {
        const lng = parseFloat(reportData.longitude);
        if (!isNaN(lng)) {
          formData.append("longitude", lng.toFixed(6));
        }
      }

      // Append images
      if (reportData.images && reportData.images.length > 0) {
        reportData.images.forEach((image) => {
          if (image instanceof File || image instanceof Blob) {
            formData.append("images", image);
          }
        });
      }

      const response = await api.post("/reports/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 30000,
      });

      return {
        success: true,
        reportId: response.data.id,
        data: response.data,
      };
    } catch (error) {
      console.error("ReportService: Error creating report:", error);
      return this.handleError(error);
    }
  }

  async getReports(params = {}) {
    try {
      const response = await api.get("/reports/", { params });
      return response.data;
    } catch (error) {
      console.error("ReportService: Error fetching reports:", error);
      throw this.handleError(error);
    }
  }

  async getReport(id) {
    try {
      const response = await api.get(`/reports/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`ReportService: Error fetching report ${id}:`, error);
      throw this.handleError(error);
    }
  }

  async updateReport(id, reportData) {
    try {
      const response = await api.patch(`/reports/${id}/`, reportData);
      return response.data;
    } catch (error) {
      console.error(`ReportService: Error updating report ${id}:`, error);
      throw this.handleError(error);
    }
  }

  async deleteReport(id) {
    try {
      const response = await api.delete(`/reports/${id}/`);
      
      // Return silent success for admin dashboard
      return {
        success: true,
        message: "Report deleted successfully",
        data: response.data,
        silent: true
      };
    } catch (error) {
      console.error(`ReportService: Error deleting report ${id}:`, error);
      
      // Return silent error for admin dashboard
      const errorResult = this.handleError(error);
      return {
        ...errorResult,
        message: "Failed to delete report",
        silent: true
      };
    }
  }

  async updateReportStatus(id, status) {
    try {
      const response = await api.post(`/reports/${id}/update_status/`, {
        status,
      });
      
      // Return silent success for admin dashboard
      return {
        success: true,
        message: `Report status updated to ${status}`,
        data: response.data,
        silent: true
      };
    } catch (error) {
      console.error(`ReportService: Error updating report ${id} status:`, error);
      
      // Return silent error for admin dashboard
      const errorResult = this.handleError(error);
      return {
        ...errorResult,
        message: "Failed to update report status",
        silent: true
      };
    }
  }

  async likeReport(id) {
    try {
      const response = await api.post(`/reports/${id}/like/`);
      return response.data;
    } catch (error) {
      console.error(`ReportService: Error liking report ${id}:`, error);
      throw this.handleError(error);
    }
  }

  async unlikeReport(id) {
    try {
      const response = await api.post(`/reports/${id}/unlike/`);
      return response.data;
    } catch (error) {
      console.error(`ReportService: Error unliking report ${id}:`, error);
      throw this.handleError(error);
    }
  }

  async addComment(id, comment) {
    try {
      const response = await api.post(`/reports/${id}/comments/`, { comment });
      return response.data;
    } catch (error) {
      console.error(`ReportService: Error adding comment to report ${id}:`, error);
      throw this.handleError(error);
    }
  }

  async getComments(id) {
    try {
      const response = await api.get(`/reports/${id}/comments/`);
      return response.data;
    } catch (error) {
      console.error(`ReportService: Error fetching comments for report ${id}:`, error);
      throw this.handleError(error);
    }
  }

  async getStats(timeframe = "all") {
    try {
      const response = await api.get("/reports/stats/", {
        params: { timeframe }
      });
      return response.data;
    } catch (error) {
      console.error("ReportService: Error fetching stats:", error);
      return {
        total_reports: 0,
        resolved_reports: 0,
        in_progress_reports: 0,
        pending_reports: 0,
        user_reports_count: 0,
        user_resolved_reports: 0,
      };
    }
  }

  async getCategories() {
    try {
      const response = await api.get("/reports/categories/");
      return response.data;
    } catch (error) {
      console.error("ReportService: Error fetching categories:", error);
      return [];
    }
  }

  async uploadImage(imageFile) {
    try {
      const formData = new FormData();
      formData.append("image", imageFile);
      
      const response = await api.post("/reports/upload_image/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      return response.data;
    } catch (error) {
      console.error("ReportService: Error uploading image:", error);
      throw this.handleError(error);
    }
  }

  async searchReports(query, filters = {}) {
    try {
      const params = {
        search: query,
        ...filters
      };
      const response = await api.get("/reports/", { params });
      return response.data;
    } catch (error) {
      console.error("ReportService: Error searching reports:", error);
      throw this.handleError(error);
    }
  }

  async getMyReports(params = {}) {
    try {
      const response = await api.get("/reports/my_reports/", { params });
      return response.data;
    } catch (error) {
      console.error("ReportService: Error fetching user reports:", error);
      throw this.handleError(error);
    }
  }

  handleError(error) {
    if (!error.response) {
      if (error.code === "ECONNABORTED") {
        return {
          success: false,
          error: "Request timeout. Please try again.",
        };
      }
      return {
        success: false,
        error: "Network error. Please check your connection.",
      };
    }

    const status = error.response.status;
    const data = error.response.data;

    console.error(`ReportService: HTTP ${status} error:`, data);

    if (status === 400) {
      let errorMessage = "Please check your input";
      let fieldErrors = {};
      
      if (data.errors) {
        fieldErrors = data.errors;
        const firstError = Object.entries(data.errors).find(([field, errors]) => 
          Array.isArray(errors) && errors.length > 0
        )?.[1]?.[0];
        
        if (firstError) {
          errorMessage = firstError;
        }
      } else if (data.detail) {
        errorMessage = data.detail;
      }

      return {
        success: false,
        error: errorMessage,
        details: data,
        validationErrors: fieldErrors,
        isValidationError: true,
      };
    }

    switch (status) {
      case 401:
        return {
          success: false,
          error: "Please log in again to continue.",
          requiresLogin: true,
        };
      case 403:
        return {
          success: false,
          error: "You don't have permission to perform this action.",
        };
      case 404:
        return {
          success: false,
          error: "Report not found.",
        };
      case 413:
        return {
          success: false,
          error: "File too large. Please reduce image sizes.",
        };
      case 500:
        return {
          success: false,
          error: "Server error. Please try again later.",
          isServerError: true,
        };
      default:
        return {
          success: false,
          error: `Request failed (${status}). Please try again.`,
        };
    }
  }
}

export default new ReportService();