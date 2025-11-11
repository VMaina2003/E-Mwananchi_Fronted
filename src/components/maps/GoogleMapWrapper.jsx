import React from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const mapContainerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '8px',
  border: '2px solid #e5e7eb'
};

const defaultCenter = {
  lat: -1.286389, // Nairobi coordinates
  lng: 36.817223
};

const GoogleMapWrapper = ({ 
  center = defaultCenter, 
  onMapClick, 
  markerPosition,
  zoom = 10 
}) => {
  return (
    <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={zoom}
        onClick={onMapClick}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true,
        }}
      >
        {markerPosition && (
          <Marker 
            position={markerPosition}
            animation={window.google && window.google.maps.Animation.DROP}
          />
        )}
      </GoogleMap>
    </LoadScript>
  );
};

export default GoogleMapWrapper;