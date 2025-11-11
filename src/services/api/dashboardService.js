// src/services/api/dashboardService.js
import api from './api';

const dashboardService = {
  // Main dashboard statistics
  getDashboardStats: () => {
    return api.get('/dashboard/stats/overview/');
  },

  // Recent activity
  getRecentActivity: (limit = 10) => {
    return api.get(`/dashboard/stats/recent-activity/?limit=${limit}`);
  },

  // Role-specific dashboards
  getCitizenDashboard: () => {
    return api.get('/dashboard/citizen/');
  },

  getOfficialDashboard: () => {
    return api.get('/dashboard/official/');
  },

  getAdminDashboard: () => {
    return api.get('/dashboard/admin/');
  },

  // Reports analytics with filters
  getReportsAnalytics: (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params.append(key, filters[key]);
      }
    });
    return api.get(`/reports/stats/?${params.toString()}`);
  }
};

export default dashboardService;