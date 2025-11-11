import React from 'react';
import useLocation from '../../../hooks/useLocation';
import locationService from '../../../services/api/locationService';

const LocationSection = ({
  formData,
  setFormData,
  counties,
  subCounties,
  wards,
  loadingCounties,
  loadingSubCounties,
  loadingWards,
  validationErrors
}) => {
  const { 
    detectedArea, 
    loading: locationLoading, 
    error: locationError, 
    getCurrentLocation 
  } = useLocation();

  const handleAutoDetectLocation = async () => {
    const areaData = await getCurrentLocation();
    
    if (areaData && areaData.latitude && areaData.longitude) {
      try {
        // Use the reverse geocoding service to get exact administrative areas
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
          
          // Show success message based on confidence level
          if (locationInfo.confidence === 'high') {
            alert(`Location detected successfully! Your area: ${locationInfo.ward.name}, ${locationInfo.subcounty.name}, ${locationInfo.county.name}`);
          } else {
            alert(`Location detected! Please confirm your administrative area: ${locationInfo.county.name}`);
          }
        }
        
      } catch (error) {
        console.error('Reverse geocoding failed:', error);
        // Fallback: just set coordinates and let user select manually
        setFormData(prev => ({
          ...prev,
          latitude: areaData.latitude.toString(),
          longitude: areaData.longitude.toString()
        }));
        
        alert('Location detected! Please select your county, sub-county, and ward from the dropdowns.');
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
  };

  const handleSubCountyChange = (e) => {
    const subcountyId = e.target.value;
    setFormData(prev => ({
      ...prev,
      subcounty: subcountyId,
      ward: ''
    }));
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Location Details</h2>
      
      {/* Auto Detect Location Button */}
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

      {/* Manual Location Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* County Selection */}
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
            disabled={loadingCounties}
          >
            <option value="">Select County</option>
            {counties.map((county) => (
              <option key={county.id} value={county.id}>
                {county.name}
              </option>
            ))}
          </select>
          {validationErrors.county && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.county}</p>
          )}
        </div>

        {/* Sub-County Selection */}
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
            <option value="">{!formData.county ? 'Select County First' : loadingSubCounties ? 'Loading...' : 'Select Sub-County'}</option>
            {subCounties.map((subCounty) => (
              <option key={subCounty.id} value={subCounty.id}>
                {subCounty.name}
              </option>
            ))}
          </select>
          {!formData.county && (
            <p className="mt-1 text-sm text-gray-500">Please select a county first</p>
          )}
        </div>

        {/* Ward Selection */}
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
            <option value="">{!formData.subcounty ? 'Select Sub-County First' : loadingWards ? 'Loading...' : 'Select Ward'}</option>
            {wards.map((ward) => (
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

      {/* Help Text */}
      <div className="mt-4 text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="font-medium">Location Selection Guide:</p>
        <p>Select your county first, then sub-county, then ward. Use "Auto Detect My Location" for automatic filling.</p>
        <p>Your exact coordinates will be saved privately for accurate issue mapping.</p>
      </div>
    </div>
  );
};

export default LocationSection;