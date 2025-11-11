import { useState } from 'react';
import locationService from '../services/api/locationService';

const useLocation = () => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [detectedArea, setDetectedArea] = useState(null);

  const getCurrentLocation = async () => {
    setLoading(true);
    setError(null);
    setDetectedArea(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      setLoading(false);
      return null;
    }

    try {
      // Get GPS coordinates
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 60000
        });
      });

      const { latitude, longitude } = position.coords;
      
      const locationData = {
        lat: latitude,
        lng: longitude,
        accuracy: position.coords.accuracy
      };
      
      setLocation(locationData);

      // Reverse geocode to Kenyan administrative areas
      const areaData = await reverseGeocodeToKenyanArea(latitude, longitude);
      setDetectedArea(areaData);
      
      setLoading(false);
      return areaData;

    } catch (err) {
      let errorMessage = 'Location access denied.';
      switch (err.code) {
        case err.PERMISSION_DENIED:
          errorMessage = 'Location access denied. Please enable location permissions in your browser settings.';
          break;
        case err.POSITION_UNAVAILABLE:
          errorMessage = 'Your location is unavailable. Please check your device location services.';
          break;
        case err.TIMEOUT:
          errorMessage = 'Location request timed out. Please try again.';
          break;
        default:
          errorMessage = 'Unable to detect your location. Please try again or select manually.';
          break;
      }
      setError(errorMessage);
      setLoading(false);
      return null;
    }
  };

  // Reverse geocode coordinates to Kenyan administrative areas
  const reverseGeocodeToKenyanArea = async (lat, lng) => {
    try {
      // First, try to find the closest ward using your location data
      const allCounties = await locationService.getCounties();
      
      // This is a simplified approach - in production you'd use a proper spatial query
      // For now, we'll return the coordinates and let the frontend handle the matching
      // We'll implement the actual matching in the LocationSection component
      
      return {
        latitude: lat,
        longitude: lng,
        county: null, // Will be determined by frontend matching
        subcounty: null,
        ward: null
      };
      
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      return {
        latitude: lat,
        longitude: lng,
        county: null,
        subcounty: null,
        ward: null
      };
    }
  };

  // Clear location
  const clearLocation = () => {
    setLocation(null);
    setDetectedArea(null);
    setError(null);
  };

  return {
    location,
    detectedArea,
    loading,
    error,
    getCurrentLocation,
    clearLocation
  };
};

export default useLocation;