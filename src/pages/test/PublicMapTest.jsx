import React, { useState } from 'react';
import GoogleMapWrapper from '../../components/maps/GoogleMapWrapper';

const PublicMapTest = () => {
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
        <h1 className="text-3xl font-bold text-green-800 mb-2">🗺️ Public Map Test</h1>
        <p className="text-gray-600 mb-6">No login required - testing Google Maps integration</p>
        
        {/* Map */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Interactive Map</h2>
          <p className="text-gray-600 mb-4">Click anywhere on the map to place a marker</p>
          
          <GoogleMapWrapper
            onMapClick={handleMapClick}
            markerPosition={markerPosition}
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

        {/* Location Detection Info */}
        <div className="bg-white p-6 rounded-lg shadow-md mt-6">
          <h2 className="text-xl font-semibold mb-4">Location Detection</h2>
          <p className="text-yellow-600 mb-4">
            ⚠️ GPS location detection requires login. 
            <a href="/login" className="text-blue-600 underline ml-2">Login here</a> to test full features.
          </p>
          <a 
            href="/test-map" 
            className="inline-block bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors"
          >
            Test Full Map Features (Login Required)
          </a>
        </div>
      </div>
    </div>
  );
};

export default PublicMapTest;