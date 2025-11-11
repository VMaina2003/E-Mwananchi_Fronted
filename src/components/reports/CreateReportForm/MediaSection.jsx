import React, { useRef, useState } from 'react';

const MediaSection = ({ formData, setFormData, validationErrors }) => {
  const fileInputRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Handle file selection from gallery
  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...imageFiles]
      }));
    }
  };

  // Start camera
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Prefer rear camera
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });
      
      setStream(mediaStream);
      setCameraActive(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Camera access failed:', error);
      alert(`Camera access denied: ${error.message}. Please allow camera permissions or use gallery upload.`);
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  };

  // Capture photo from camera
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert canvas to blob
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `camera-capture-${Date.now()}.jpg`, {
            type: 'image/jpeg'
          });
          
          setFormData(prev => ({
            ...prev,
            images: [...prev.images, file]
          }));
        }
      }, 'image/jpeg', 0.8);
      
      // Stop camera after capture
      stopCamera();
    }
  };

  // Remove image
  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  // Trigger file input
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Media Evidence</h2>
      
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        multiple
        className="hidden"
      />

      {/* Camera Interface */}
      {cameraActive && (
        <div className="mb-6 p-4 border border-blue-300 rounded-lg bg-blue-50">
          <h3 className="text-lg font-medium text-blue-900 mb-3">Camera Mode</h3>
          
          {/* Video Preview */}
          <div className="relative bg-black rounded-lg overflow-hidden mb-3">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-64 object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />
          </div>
          
          {/* Camera Controls */}
          <div className="flex justify-center gap-4">
            <button
              type="button"
              onClick={capturePhoto}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              Capture Photo
            </button>
            <button
              type="button"
              onClick={stopCamera}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Upload Options */}
      {!cameraActive && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Take Photo Button */}
          <button
            type="button"
            onClick={startCamera}
            className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors group"
          >
            <svg className="w-12 h-12 text-blue-500 mb-2 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-lg font-semibold text-blue-700">Take Photo</span>
            <span className="text-sm text-gray-600 text-center mt-1">Use your camera to capture evidence</span>
          </button>

          {/* Choose from Gallery */}
          <button
            type="button"
            onClick={triggerFileInput}
            className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-green-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors group"
          >
            <svg className="w-12 h-12 text-green-500 mb-2 group-hover:text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-lg font-semibold text-green-700">Choose from Gallery</span>
            <span className="text-sm text-gray-600 text-center mt-1">Select photos from your device</span>
          </button>
        </div>
      )}

      {/* Selected Images Preview */}
      {formData.images.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            Selected Photos ({formData.images.length})
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {formData.images.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={URL.createObjectURL(image)}
                  alt={`Evidence ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border border-gray-300"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
                <div className="text-xs text-gray-600 mt-1 truncate">
                  {image.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="mt-4 text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg p-3">
        <p className="font-medium">Photo Guidelines:</p>
        <ul className="list-disc list-inside mt-1 space-y-1">
          <li>Clear photos help officials understand the issue better</li>
          <li>Include multiple angles if possible</li>
          <li>Ensure good lighting for better clarity</li>
          <li>Maximum 10 photos per report</li>
        </ul>
      </div>

      {/* Validation Error */}
      {validationErrors.images && (
        <p className="mt-2 text-sm text-red-600">{validationErrors.images}</p>
      )}
    </div>
  );
};

export default MediaSection;