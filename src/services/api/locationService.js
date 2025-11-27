// src/services/api/locationService.js
import api from './api';

class LocationService {
  /**
   * Get counties from /api/location/counties
   */
  async getCounties() {
    try {
      let allCounties = [];
      let nextUrl = '/location/counties/';
      let page = 1;
      
      while (nextUrl && page <= 10) {
        const response = await api.get(nextUrl);
        const data = response.data;
        
        let pageCounties = [];
        
        if (data.results && Array.isArray(data.results)) {
          pageCounties = data.results;
          nextUrl = data.next;
        } else if (Array.isArray(data)) {
          pageCounties = data;
          nextUrl = null;
        } else if (data.data && Array.isArray(data.data)) {
          pageCounties = data.data;
          nextUrl = data.next;
        } else {
          nextUrl = null;
        }
        
        allCounties = [...allCounties, ...pageCounties];
        
        if (allCounties.length >= 47 || !nextUrl) {
          break;
        }
        
        page++;
      }
      
      console.log(`Total counties loaded: ${allCounties.length}`);
      return allCounties;
    } catch (error) {
      console.error('Error fetching all counties:', error.message);
      throw error;
    }
  }
  /**
   * Get ALL counties with pagination
   */
  async getAllCounties() {
    try {
      let allCounties = [];
      let nextUrl = '/location/counties/';
      let page = 1;
      
      while (nextUrl && page <= 10) {
        const response = await api.get(nextUrl);
        const data = response.data;
        
        let pageCounties = [];
        
        if (data.results && Array.isArray(data.results)) {
          pageCounties = data.results;
          nextUrl = data.next;
        } else if (Array.isArray(data)) {
          pageCounties = data;
          nextUrl = null;
        } else if (data.data && Array.isArray(data.data)) {
          pageCounties = data.data;
          nextUrl = data.next;
        } else {
          nextUrl = null;
        }
        
        allCounties = [...allCounties, ...pageCounties];
        
        if (allCounties.length >= 47 || !nextUrl) {
          break;
        }
        
        page++;
      }
      
      console.log(`Total counties loaded: ${allCounties.length}`);
      return allCounties;
    } catch (error) {
      console.error('Error fetching all counties:', error.message);
      throw error;
    }
  }

  async getSubcounties(countyId) {
    try {
      if (!countyId) {
        return [];
      }
      
      const response = await api.get('/location/subcounties/', {
        params: {
          county: countyId,
          limit: 100
        }
      });
      
      let subcounties = [];
      
      if (response.data && response.data.results) {
        subcounties = response.data.results;
      } else if (Array.isArray(response.data)) {
        subcounties = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        subcounties = response.data.data;
      }
      
      console.log(`Loaded ${subcounties.length} subcounties for county ${countyId}`);
      return subcounties;
    } catch (error) {
      console.error(`Error fetching subcounties for county ${countyId}:`, error.message);
      return [];
    }
  }

  async getWards(subcountyId) {
    try {
      if (!subcountyId) {
        return [];
      }
      
      const response = await api.get('/location/wards/', {
        params: {
          subcounty: subcountyId,
          limit: 100
        }
      });
      
      let wards = [];
      
      if (response.data && response.data.results) {
        wards = response.data.results;
      } else if (Array.isArray(response.data)) {
        wards = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        wards = response.data.data;
      }
      
      console.log(`Loaded ${wards.length} wards for subcounty ${subcountyId}`);
      return wards;
    } catch (error) {
      console.error(`Error fetching wards for subcounty ${subcountyId}:`, error.message);
      return [];
    }
  }

  async getDepartments() {
    try {
      const response = await api.get('/department/departments/');
      const data = response.data;
      
      let departments = [];
      if (data && data.results) {
        departments = data.results;
      } else if (Array.isArray(data)) {
        departments = data;
      } else if (data && Array.isArray(data.data)) {
        departments = data.data;
      }
      
      return departments;
    } catch (error) {
      console.error('Error fetching departments:', error.message);
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
      console.error('Error reverse geocoding:', error.message);
      throw error;
    }
  }
}

export default new LocationService();