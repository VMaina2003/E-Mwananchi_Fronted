// src/services/api/developmentService.js - FIXED VERSION
import api from "./api";

class DevelopmentService {
  async createGovernmentProject(projectData) {
    try {
      console.log("DevelopmentService: Creating government project with FormData");

      // projectData is now FormData, send it directly with multipart headers
      const response = await api.post("/reports/", projectData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("DevelopmentService: Project created successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error(
        "DevelopmentService: Error creating government project:",
        error.response?.data || error.message
      );
      throw error;
    }
  }

 
  async getGovernmentProjects(params = {}) {
    try {
      console.log("DevelopmentService: Fetching government projects with params:", params);
      
      const response = await api.get("/reports/", {
        params: {
          ...params,
          is_development_showcase: true,
        },
      });

      const reportsData = Array.isArray(response.data)
        ? response.data
        : response.data?.results || response.data?.data || [];

      console.log("DevelopmentService: Raw API response:", reportsData);

      const developmentProjects = reportsData
        .filter((report) => {
          const isDevShowcase = report.is_development_showcase === true;
          console.log(`Report ${report.id}: is_development_showcase = ${report.is_development_showcase}`);
          return isDevShowcase;
        })
        .map((report) => this.transformReportToProject(report));

      console.log("DevelopmentService: Transformed projects:", developmentProjects);

      return {
        results: developmentProjects,
        count: developmentProjects.length,
      };
    } catch (error) {
      console.error(
        "DevelopmentService: Error fetching government projects:",
        error.response?.data || error.message
      );
      return {
        results: [],
        count: 0,
      };
    }
  }

  async updateGovernmentProject(id, projectData) {
    try {
      // For updates, check if we have files to upload
      let response;
      if (projectData instanceof FormData) {
        response = await api.patch(`/reports/${id}/`, projectData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        response = await api.patch(`/reports/${id}/`, projectData);
      }
      return response.data;
    } catch (error) {
      console.error(
        `DevelopmentService: Error updating government project ${id}:`,
        error.response?.data || error.message
      );
      throw error;
    }
  }

  async updateProjectProgress(id, progressData) {
    try {
      const updateData = {
        development_progress: progressData.progress_percentage,
        government_response: progressData.progress_updates,
      };

      this.cleanObject(updateData);

      const response = await api.patch(`/reports/${id}/`, updateData);
      return response.data;
    } catch (error) {
      console.error(
        `DevelopmentService: Error updating project progress ${id}:`,
        error.response?.data || error.message
      );
      throw error;
    }
  }

  async likeProject(id) {
    try {
      const response = await api.post(`/reports/${id}/like/`);
      return response.data;
    } catch (error) {
      console.error(
        `DevelopmentService: Error liking project ${id}:`,
        error.response?.data || error.message
      );
      throw error;
    }
  }

  async unlikeProject(id) {
    try {
      const response = await api.post(`/reports/${id}/unlike/`);
      return response.data;
    } catch (error) {
      console.error(
        `DevelopmentService: Error unliking project ${id}:`,
        error.response?.data || error.message
      );
      throw error;
    }
  }

  async getDevelopmentStats() {
    try {
      const response = await api.get("/reports/");
      const reports = Array.isArray(response.data)
        ? response.data
        : response.data?.results || response.data?.data || [];

      const developmentReports = reports.filter(
        (report) => report.is_development_showcase
      );

      const stats = {
        total_projects: developmentReports.length,
        completed_projects: developmentReports.filter(
          (p) => p.status === "resolved"
        ).length,
        in_progress_projects: developmentReports.filter(
          (p) => p.status === "on_progress"
        ).length,
        planned_projects: developmentReports.filter((p) =>
          ["submitted", "verified", "pending", "noted"].includes(p.status)
        ).length,
        delayed_projects: developmentReports.filter(
          (p) => p.status === "delayed" || (p.completion_date && new Date(p.completion_date) < new Date())
        ).length,
        cancelled_projects: developmentReports.filter(
          (p) => p.status === "rejected"
        ).length,
      };

      return stats;
    } catch (error) {
      console.error(
        "DevelopmentService: Error fetching development stats:",
        error.response?.data || error.message
      );

      return {
        total_projects: 0,
        completed_projects: 0,
        in_progress_projects: 0,
        planned_projects: 0,
        delayed_projects: 0,
        cancelled_projects: 0,
      };
    }
  }

  async getProjectsByCounty(countyId) {
    try {
      const response = await api.get("/reports/", {
        params: {
          county: countyId,
          is_development_showcase: true,
        },
      });

      const reportsData = Array.isArray(response.data)
        ? response.data
        : response.data?.results || response.data?.data || [];

      const projects = reportsData.map((report) => 
        this.transformReportToProject(report)
      );

      return {
        results: projects,
        count: projects.length,
      };
    } catch (error) {
      console.error(
        `DevelopmentService: Error fetching projects for county ${countyId}:`,
        error.response?.data || error.message
      );
      throw error;
    }
  }

  async getProjectsByDepartment(departmentId) {
    try {
      const response = await api.get("/reports/", {
        params: {
          department: departmentId,
          is_development_showcase: true,
        },
      });

      const reportsData = Array.isArray(response.data)
        ? response.data
        : response.data?.results || response.data?.data || [];

      const projects = reportsData.map((report) => 
        this.transformReportToProject(report)
      );

      return {
        results: projects,
        count: projects.length,
      };
    } catch (error) {
      console.error(
        `DevelopmentService: Error fetching projects for department ${departmentId}:`,
        error.response?.data || error.message
      );
      throw error;
    }
  }

  transformReportToProject(report) {
    return {
      id: report.id,
      title: report.title,
      description: report.description,
      county: report.county,
      department: report.department,
      budget: report.development_budget,
      start_date: report.created_at?.split("T")[0],
      expected_completion: report.completion_date,
      actual_completion: report.completion_date,
      status: this.mapReportStatusToProjectStatus(report.status),
      progress_percentage: report.development_progress || 0,
      progress_updates: report.government_response || "",
      likes_count: report.likes_count || 0,
      comments_count: report.comments_count || 0,
      views_count: report.views_count || 0,
      created_by: report.reporter,
      created_at: report.created_at,
      updated_at: report.updated_at,
      images: report.images || [],
      report_images: report.images || [],
      is_development_showcase: true,
    };
  }

  mapReportStatusToProjectStatus(reportStatus) {
    const statusMap = {
      submitted: "planned",
      verified: "planned",
      pending: "planned",
      noted: "planned",
      on_progress: "in_progress",
      resolved: "completed",
      rejected: "cancelled",
      deleted: "cancelled",
    };
    return statusMap[reportStatus] || "planned";
  }

  mapProjectStatusToReportStatus(projectStatus) {
    const statusMap = {
      planned: "verified",
      in_progress: "on_progress",
      completed: "resolved",
      delayed: "on_progress",
      cancelled: "rejected",
    };
    return statusMap[projectStatus] || "verified";
  }

  cleanObject(obj) {
    Object.keys(obj).forEach((key) => {
      if (obj[key] === null || obj[key] === undefined || obj[key] === "") {
        delete obj[key];
      }
    });
    return obj;
  }
}

export default new DevelopmentService();