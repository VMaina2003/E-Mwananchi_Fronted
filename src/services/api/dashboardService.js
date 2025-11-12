// src/services/api/dashboardService.js
import api from './api';

const dashboardService = {
  /**
   * Get professional statistics - uses report stats endpoint
   */
  getProfessionalStats: () => api.get('/reports/stats/'),
  
  /**
   * Get recent activity - uses report list with ordering
   */
  getRecentActivity: (limit = 10) => api.get(`/reports/?limit=${limit}&ordering=-created_at`),
  
  /**
   * Get citizen dashboard data
   */
  getCitizenDashboard: () => api.get('/reports/?ordering=-created_at'),
  
  /**
   * Get official dashboard data
   */
  getOfficialDashboard: () => api.get('/reports/?ordering=-created_at'),
  
  /**
   * Get admin dashboard data
   */
  getAdminDashboard: () => api.get('/reports/stats/'),
  
  /**
   * Get advanced analytics
   */
  getAdvancedAnalytics: (params = {}) => api.get('/reports/stats/', { params }),
  
  /**
   * Export dashboard data
   */
  exportDashboardData: (format = 'csv', filters = {}) => {
    return api.get('/reports/stats/', {
      params: { format, ...filters },
      responseType: 'blob'
    });
  }
};

export default dashboardService;