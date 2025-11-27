import React, { useRef, useState, useCallback, useEffect } from "react";
import { useNotification } from "../../../context/NotificationContext";

const MediaSection = ({ formData, setFormData, validationErrors }) => {
  const { showError, showInfo } = useNotification();
  const fileInputRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const MAX_IMAGES = 10;
  const SUPPORTED_FORMATS = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  // Debug function to track image state
  const debugImageState = (action, images = formData.images) => {
    console.log(`MediaSection: ${action}`, {
      imageCount: images.length,
      images: images.map((img, index) => ({
        index,
        name: img.name,
        size: img.size,
        type: img.type,
        isFile: img instanceof File,
        constructor: img.constructor.name,
      })),
    });
  };

  // Validate file before processing
  const validateFile = (file) => {
    if (!SUPPORTED_FORMATS.includes(file.type)) {
      throw new Error(
        `Unsupported file format: ${file.type}. Please use JPEG, PNG, or WebP.`
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new Error(
        `File too large: ${(file.size / 1024 / 1024).toFixed(
          1
        )}MB. Maximum size is 5MB.`
      );
    }

    return true;
  };

  // Camera management
  const startCamera = useCallback(async () => {
    try {
      if (formData.images.length >= MAX_IMAGES) {
        showError(`Maximum ${MAX_IMAGES} images reached. Please remove some images first.`, 'Image Limit');
        return;
      }

      console.log('MediaSection: Starting camera...');
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
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
      
      console.log('MediaSection: Camera started successfully');
    } catch (error) {
      console.error('MediaSection: Camera access failed:', error);
      
      let errorMessage = 'Camera access denied. ';
      if (error.name === 'NotAllowedError') {
        errorMessage += 'Please allow camera permissions in your browser settings.';
      } else if (error.name === 'NotFoundError') {
        errorMessage += 'No camera found on your device.';
      } else {
        errorMessage += `Error: ${error.message}`;
      }
      
      showError(errorMessage, 'Camera Error');
    }
  }, [formData.images.length, showError]);

  const stopCamera = useCallback(() => {
    console.log('MediaSection: Stopping camera...');
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
      });
      setStream(null);
    }
    setCameraActive(false);
  }, [stream]);

  // Handle file selection
  const handleFileSelect = useCallback(
    (event) => {
      const files = Array.from(event.target.files);

      console.log("MediaSection: Raw files from input:", files);

      if (files.length === 0) return;

      const validFiles = [];
      const errors = [];

      files.forEach((file) => {
        try {
          validateFile(file);
          validFiles.push(file);
          console.log(`MediaSection: Valid file - ${file.name}`, {
            isFile: file instanceof File,
            size: file.size,
            type: file.type,
          });
        } catch (error) {
          console.log(
            `MediaSection: Invalid file - ${file.name}: ${error.message}`
          );
          errors.push(error.message);
        }
      });

      // Show errors for invalid files
      if (errors.length > 0) {
        showError(
          `Some files were skipped: ${errors.join("; ")}`,
          "File Validation"
        );
      }

      // Check total image limit
      const totalAfterAdd = formData.images.length + validFiles.length;
      if (totalAfterAdd > MAX_IMAGES) {
        const allowed = MAX_IMAGES - formData.images.length;
        showError(
          `You can only add ${allowed} more image(s). Maximum ${MAX_IMAGES} images allowed.`,
          "Image Limit"
        );
        return;
      }

      // Add valid files to formData
      if (validFiles.length > 0) {
        setFormData((prev) => {
          const newImages = [...prev.images, ...validFiles];
          console.log("MediaSection: Setting new formData.images", {
            previousCount: prev.images.length,
            newCount: newImages.length,
            newImages: newImages.map((img) => ({
              name: img.name,
              size: img.size,
              isFile: img instanceof File,
            })),
          });
          return {
            ...prev,
            images: newImages,
          };
        });

        showInfo(
          `Added ${validFiles.length} image(s) successfully`,
          "Images Added"
        );
      }

      // Reset file input
      event.target.value = "";
    },
    [formData.images.length, setFormData, showError, showInfo]
  );

  // Capture photo from camera
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) {
      console.error("MediaSection: Camera elements not available");
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Capture frame from video
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to blob and create File object
    canvas.toBlob(
      (blob) => {
        if (blob) {
          // Create proper File object with correct metadata
          const file = new File([blob], `camera-capture-${Date.now()}.jpg`, {
            type: "image/jpeg",
            lastModified: Date.now(),
          });

          console.log("MediaSection: Captured photo", {
            name: file.name,
            size: file.size,
            type: file.type,
            isFile: file instanceof File,
          });

          try {
            validateFile(file);

            setFormData((prev) => {
              const newImages = [...prev.images, file];
              console.log("MediaSection: Setting camera image to formData", {
                previousCount: prev.images.length,
                newCount: newImages.length,
              });
              return {
                ...prev,
                images: newImages,
              };
            });

            showInfo("Photo captured successfully!", "Photo Captured");
          } catch (error) {
            console.error("MediaSection: Photo validation failed:", error);
            showError(error.message, "Capture Error");
          }
        } else {
          console.error("MediaSection: Failed to create blob from canvas");
          showError(
            "Failed to capture photo. Please try again.",
            "Capture Error"
          );
        }
      },
      "image/jpeg",
      0.85
    );

    stopCamera();
  }, [stopCamera, setFormData, showInfo, showError]);

  // Remove image
  const removeImage = useCallback(
    (index) => {
      console.log(`MediaSection: Removing image at index ${index}`);
      setFormData((prev) => {
        const newImages = prev.images.filter((_, i) => i !== index);
        debugImageState("Image removed from formData", newImages);
        return {
          ...prev,
          images: newImages,
        };
      });
      showInfo("Image removed", "Image Removed");
    },
    [setFormData, showInfo]
  );

  // Trigger file input
  const triggerFileInput = useCallback(() => {
    console.log("MediaSection: Triggering file input");
    fileInputRef.current?.click();
  }, []);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        console.log("MediaSection: Cleaning up camera stream");
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  // Log initial state and changes
  useEffect(() => {
    debugImageState("Component mounted");
  }, []);

  useEffect(() => {
    debugImageState("Images updated");
  }, [formData.images]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Media Evidence
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Add photos to help officials understand the issue better
          </p>
        </div>
        <div className="text-sm text-gray-500">
          {formData.images.length}/{MAX_IMAGES} images
        </div>
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept={SUPPORTED_FORMATS.join(",")}
        multiple
        className="hidden"
      />

      {/* Camera Interface */}
      {cameraActive && (
        <div className="mb-6 p-4 border border-blue-200 rounded-xl bg-blue-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-blue-900">Camera Mode</h3>
            <button
              type="button"
              onClick={stopCamera}
              className="text-blue-700 hover:text-blue-800 font-medium"
            >
              Close Camera
            </button>
          </div>

          {/* Video Preview */}
          <div className="relative bg-black rounded-lg overflow-hidden mb-4">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-64 object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />

            {/* Capture frame overlay */}
            <div className="absolute inset-0 border-2 border-white border-dashed rounded-lg pointer-events-none" />
          </div>

          {/* Camera Controls */}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={capturePhoto}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 shadow-lg"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
              </svg>
              Capture Photo
            </button>
          </div>
        </div>
      )}

      {/* Upload Options */}
      {!cameraActive && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Camera Option */}
          <button
            type="button"
            onClick={startCamera}
            disabled={formData.images.length >= MAX_IMAGES}
            className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-blue-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-blue-200 transition-colors">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
              </svg>
            </div>
            <span className="text-lg font-semibold text-blue-700 mb-1">
              Take Photo
            </span>
            <span className="text-sm text-gray-600 text-center">
              Use camera for instant capture
            </span>
          </button>

          {/* Gallery Option */}
          <button
            type="button"
            onClick={triggerFileInput}
            disabled={formData.images.length >= MAX_IMAGES}
            className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-green-300 rounded-xl hover:border-green-400 hover:bg-green-50 transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-green-200 transition-colors">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <span className="text-lg font-semibold text-green-700 mb-1">
              Choose from Gallery
            </span>
            <span className="text-sm text-gray-600 text-center">
              Select existing photos
            </span>
          </button>
        </div>
      )}

      {/* Selected Images Grid */}
      {formData.images.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Selected Images ({formData.images.length})
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {formData.images.map((image, index) => (
              <div
                key={`${image.name}-${index}-${image.lastModified}`}
                className="relative group"
              >
                <div className="aspect-square overflow-hidden rounded-lg border border-gray-300 bg-gray-100">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Evidence ${index + 1}`}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    onLoad={(e) => URL.revokeObjectURL(e.target.src)}
                  />
                </div>

                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 shadow-lg"
                  title="Remove image"
                >
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>

                {/* Image info */}
                <div className="mt-2 text-xs text-gray-600">
                  <div className="truncate" title={image.name}>
                    {image.name}
                  </div>
                  <div className="text-gray-500">
                    {(image.size / 1024 / 1024).toFixed(1)}MB
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Photo Guidelines</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Clear, well-lit photos help officials understand the issue</li>
          <li>• Include multiple angles and context shots when possible</li>
          <li>• Supported formats: JPEG, PNG, WebP (max 5MB each)</li>
          <li>• Maximum {MAX_IMAGES} photos per report</li>
        </ul>
      </div>

      {/* Debug button */}
      <div className="mt-4 p-4 border border-yellow-300 bg-yellow-50 rounded-lg">
        <button
          type="button"
          onClick={() => {
            console.log("DEBUG: Current formData.images:", {
              count: formData.images.length,
              images: formData.images,
              areFiles: formData.images.every((img) => img instanceof File),
            });
          }}
          className="bg-yellow-500 text-white px-4 py-2 rounded"
        >
          Debug Images
        </button>
      </div>

      {/* Validation Error */}
      {validationErrors.images && (
        <p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {validationErrors.images}
        </p>
      )}
    </div>
  );
};

export default MediaSection;