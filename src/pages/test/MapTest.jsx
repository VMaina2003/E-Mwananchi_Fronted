import React, { useState } from 'react';
import GoogleMapWrapper from '../../components/maps/GoogleMapWrapper';
import useLocation from '../../hooks/useLocation';

const MapTest = () => {
  const { location, loading, error, getCurrentLocation } = useLocation();
  const [markerPosition, setMarkerPosition] = useState(null);

  const handleMapClick = (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    setMarkerPosition({ lat, lng });
    console.log('Map clicked:', { lat, lng });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-green-800 mb-6">🗺️ Map Test</h1>
        
        {/* Controls */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <button
            onClick={getCurrentLocation}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 px-6 rounded-lg flex items-center gap-2 transition-colors mb-4"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Detecting Location...
              </>
            ) : (
              <>
                <span>📍</span>
                Check My Location
              </>
            )}
          </button>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {location && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              ✅ Location detected: 
              <br />
              Latitude: {location.lat.toFixed(6)}
              <br />
              Longitude: {location.lng.toFixed(6)}
              <br />
              Accuracy: {location.accuracy} meters
            </div>
          )}
        </div>

        {/* Map */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Interactive Map</h2>
          <p className="text-gray-600 mb-4">Click anywhere on the map to place a marker</p>
          
          <GoogleMapWrapper
            center={location || undefined}
            onMapClick={handleMapClick}
            markerPosition={markerPosition || location}
          />

          {markerPosition && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-blue-700">
                📍 Marker placed at: 
                <br />
                Lat: {markerPosition.lat.toFixed(6)}, Lng: {markerPosition.lng.toFixed(6)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapTest;