// src/services/api/locationService.js
import api from './api';

class LocationService {
  async getCounties() {
    try {
      const response = await api.get('/location/counties/');
      return response.data.results || response.data || [];
    } catch (error) {
      console.error('Error fetching counties:', error.response?.data || error.message);
      throw error;
    }
  }

  async getSubcounties(countyId) {
    try {
      const response = await api.get(`/location/subcounties/?county=${countyId}`);
      return response.data.results || response.data || [];
    } catch (error) {
      console.error(`Error fetching subcounties for county ${countyId}:`, error.response?.data || error.message);
      throw error;
    }
  }

  async getWards(subcountyId) {
    try {
      const response = await api.get(`/location/wards/?subcounty=${subcountyId}`);
      return response.data.results || response.data || [];
    } catch (error) {
      console.error(`Error fetching wards for subcounty ${subcountyId}:`, error.response?.data || error.message);
      throw error;
    }
  }

  async getDepartments() {
    try {
      const response = await api.get('/department/departments/');
      return response.data.results || response.data || [];
    } catch (error) {
      console.error('Error fetching departments:', error.response?.data || error.message);
      throw error;
    }
  }

  async getCountyDepartments() {
    try {
      const response = await api.get('/department/county-departments/');
      return response.data.results || response.data || [];
    } catch (error) {
      console.error('Error fetching county departments:', error.response?.data || error.message);
      throw error;
    }
  }

  async getCountyDepartmentsByCounty(countyId) {
    try {
      const response = await api.get(`/department/county-departments/?county=${countyId}`);
      return response.data.results || response.data || [];
    } catch (error) {
      console.error(`Error fetching county departments for county ${countyId}:`, error.response?.data || error.message);
      throw error;
    }
  }

  async reverseGeocode(latitude, longitude) {
    try {
      const response = await api.post('/location/reverse-geocode/', {
        latitude,
        longitude
      });
      return response.data;
    } catch (error) {
      console.error('Error reverse geocoding:', error.response?.data || error.message);
      throw error;
    }
  }
}

export default new LocationService();