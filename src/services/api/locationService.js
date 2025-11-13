// src/services/api/locationService.js
import api from './api';

class LocationService {
  async getCounties() {
    try {
      console.log('Fetching all counties...');
      const response = await api.get('/location/counties/', {
        params: {
          limit: 100,
          page_size: 100,
          ordering: 'name'
        }
      });
      
      console.log('Counties API Response:', response.data);
      
      let counties = [];
      if (response.data && response.data.results) {
        counties = response.data.results;
      } else if (Array.isArray(response.data)) {
        counties = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        counties = response.data.data;
      }
      
      console.log('Loaded counties:', counties.length);
      return counties;
    } catch (error) {
      console.error('Error fetching counties:', error.response?.data || error.message);
      throw error;
    }
  }

  // ADD THIS METHOD - getAllCounties for paginated fetching
  async getAllCounties() {
    try {
      console.log('Fetching all counties with pagination...');
      let allCounties = [];
      let nextUrl = '/location/counties/';
      
      while (nextUrl) {
        const response = await api.get(nextUrl);
        const data = response.data;
        
        if (data.results) {
          allCounties = [...allCounties, ...data.results];
          nextUrl = data.next;
        } else if (Array.isArray(data)) {
          allCounties = [...allCounties, ...data];
          nextUrl = null;
        } else if (data.data && Array.isArray(data.data)) {
          allCounties = [...allCounties, ...data.data];
          nextUrl = data.next;
        } else {
          nextUrl = null;
        }
      }
      
      console.log('Total counties loaded:', allCounties.length);
      return allCounties;
    } catch (error) {
      console.error('Error fetching all counties:', error.response?.data || error.message);
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