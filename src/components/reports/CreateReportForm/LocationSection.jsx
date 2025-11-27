// src/components/reports/CreateReportForm/LocationSection.jsx
import React, { useState, useEffect } from 'react';
import { useNotification } from '../../../context/NotificationContext';
import useLocation from '../../../hooks/useLocation';
import locationService from '../../../services/api/locationService';

const LocationSection = ({
  formData,
  setFormData,
  counties = [],
  subCounties = [],
  wards = [],
  onCountyChange,
  onSubCountyChange,
  loadingCounties = false,
  loadingSubCounties = false,
  loadingWards = false,
  validationErrors = {}
}) => {
  const { showSuccess, showError, showInfo } = useNotification();
  const { 
    detectedArea, 
    loading: locationLoading, 
    error: locationError, 
    getCurrentLocation 
  } = useLocation();

  const [localCounties, setLocalCounties] = useState([]);
  const [localSubCounties, setLocalSubCounties] = useState([]);
  const [localWards, setLocalWards] = useState([]);
  const [isLoadingCounties, setIsLoadingCounties] = useState(false);

  // Load counties only once on component mount
  useEffect(() => {
    const loadCounties = async () => {
      // If parent already provided sufficient counties, use them
      if (counties && counties.length >= 47) {
        setLocalCounties(counties);
        return;
      }

      // Only load if we haven't already loaded counties and not currently loading
      if (localCounties.length === 0 && !isLoadingCounties) {
        setIsLoadingCounties(true);
        try {
          const countiesData = await locationService.getAllCounties();
          setLocalCounties(countiesData);
        } catch (error) {
          console.error('Failed to load counties:', error);
          showError('Failed to load counties. Please try again.', 'Location Data Error');
        } finally {
          setIsLoadingCounties(false);
        }
      }
    };

    loadCounties();
  }, []); // Empty dependency array - run only once on mount

  // Load subcounties when county changes
  useEffect(() => {
    const loadSubCounties = async () => {
      if (!formData.county) {
        setLocalSubCounties([]);
        return;
      }

      try {
        const subCountiesData = await locationService.getSubcounties(formData.county);
        setLocalSubCounties(subCountiesData);
      } catch (error) {
        console.error(`Failed to load subcounties:`, error);
        setLocalSubCounties([]);
      }
    };

    loadSubCounties();
  }, [formData.county]);

  // Load wards when subcounty changes
  useEffect(() => {
    const loadWards = async () => {
      if (!formData.subcounty) {
        setLocalWards([]);
        return;
      }

      try {
        const wardsData = await locationService.getWards(formData.subcounty);
        setLocalWards(wardsData);
      } catch (error) {
        console.error(`Failed to load wards:`, error);
        setLocalWards([]);
      }
    };

    loadWards();
  }, [formData.subcounty]);

  const handleAutoDetectLocation = async () => {
    const areaData = await getCurrentLocation();
    
    if (areaData && areaData.latitude && areaData.longitude) {
      try {
        const locationInfo = await locationService.reverseGeocode(
          areaData.latitude, 
          areaData.longitude
        );
        
        if (locationInfo.county) {
          setFormData(prev => ({
            ...prev,
            latitude: areaData.latitude.toString(),
            longitude: areaData.longitude.toString(),
            county: locationInfo.county.id,
            subcounty: locationInfo.subcounty?.id || '',
            ward: locationInfo.ward?.id || ''
          }));
          
          if (locationInfo.confidence === 'high') {
            showSuccess(
              `Location detected successfully! Your area: ${locationInfo.ward?.name || ''}, ${locationInfo.subcounty?.name || ''}, ${locationInfo.county.name}`,
              'Location Detected'
            );
          } else {
            showInfo(
              `Location detected! Please confirm your administrative area: ${locationInfo.county.name}`,
              'Location Detected'
            );
          }
        }
        
      } catch (error) {
        console.error('Reverse geocoding failed:', error);
        setFormData(prev => ({
          ...prev,
          latitude: areaData.latitude.toString(),
          longitude: areaData.longitude.toString()
        }));
        
        showInfo(
          'Location detected! Please select your county, sub-county, and ward from the dropdowns.',
          'Location Detected'
        );
      }
    }
  };

  const handleCountyChange = (e) => {
    const countyId = e.target.value;
    
    setFormData(prev => ({
      ...prev,
      county: countyId,
      subcounty: '',
      ward: ''
    }));
    
    if (onCountyChange) {
      onCountyChange(countyId);
    }
  };

  const handleSubCountyChange = (e) => {
    const subcountyId = e.target.value;
    
    setFormData(prev => ({
      ...prev,
      subcounty: subcountyId,
      ward: ''
    }));
    
    if (onSubCountyChange) {
      onSubCountyChange(subcountyId);
    }
  };

  const displayCounties = (counties && counties.length >= 47) ? counties : localCounties;
  const displaySubCounties = (subCounties && subCounties.length > 0) ? subCounties : localSubCounties;
  const displayWards = (wards && wards.length > 0) ? wards : localWards;
  const actualLoadingCounties = loadingCounties || isLoadingCounties;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Location Details</h2>
      
      <div className="mb-6">
        <button
          type="button"
          onClick={handleAutoDetectLocation}
          disabled={locationLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
        >
          {locationLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Detecting Your Location...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Auto Detect My Location
            </>
          )}
        </button>
        
        {locationError && (
          <div className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
              </svg>
              {locationError}
            </div>
          </div>
        )}
        
        {detectedArea && !locationError && (
          <div className="mt-2 text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
              </svg>
              Location detected successfully! Please confirm your administrative area below.
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="county" className="block text-sm font-medium text-gray-700 mb-2">
            County *
          </label>
          <select
            id="county"
            name="county"
            value={formData.county}
            onChange={handleCountyChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={actualLoadingCounties}
          >
            <option value="">
              {actualLoadingCounties 
                ? 'Loading counties...' 
                : `Select County (${displayCounties.length} available)`
              }
            </option>
            {displayCounties.map((county) => (
              <option key={county.id} value={county.id}>
                {county.name}
              </option>
            ))}
          </select>
          {validationErrors.county && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.county}</p>
          )}
        </div>

        <div>
          <label htmlFor="subcounty" className="block text-sm font-medium text-gray-700 mb-2">
            Sub-County
          </label>
          <select
            id="subcounty"
            name="subcounty"
            value={formData.subcounty}
            onChange={handleSubCountyChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={!formData.county || loadingSubCounties}
          >
            <option value="">
              {!formData.county 
                ? 'Select County First' 
                : loadingSubCounties 
                  ? 'Loading sub-counties...' 
                  : `Select Sub-County (${displaySubCounties.length} available)`
              }
            </option>
            {displaySubCounties.map((subCounty) => (
              <option key={subCounty.id} value={subCounty.id}>
                {subCounty.name}
              </option>
            ))}
          </select>
          {!formData.county && (
            <p className="mt-1 text-sm text-gray-500">Please select a county first</p>
          )}
        </div>

        <div>
          <label htmlFor="ward" className="block text-sm font-medium text-gray-700 mb-2">
            Ward
          </label>
          <select
            id="ward"
            name="ward"
            value={formData.ward}
            onChange={(e) => setFormData(prev => ({ ...prev, ward: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={!formData.subcounty || loadingWards}
          >
            <option value="">
              {!formData.subcounty 
                ? 'Select Sub-County First' 
                : loadingWards 
                  ? 'Loading wards...' 
                  : `Select Ward (${displayWards.length} available)`
              }
            </option>
            {displayWards.map((ward) => (
              <option key={ward.id} value={ward.id}>
                {ward.name}
              </option>
            ))}
          </select>
          {!formData.subcounty && (
            <p className="mt-1 text-sm text-gray-500">Please select a sub-county first</p>
          )}
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="font-medium">Location Selection Guide:</p>
        <p>Select your county first, then sub-county, then ward. Use "Auto Detect My Location" for automatic filling.</p>
        <p>Your exact coordinates will be saved privately for accurate issue mapping.</p>
      </div>
    </div>
  );
};

export default LocationSection;