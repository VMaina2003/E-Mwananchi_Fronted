// src/components/projects/ProjectCreationModal.jsx - FIXED VERSION
import React, { useState, useEffect, useRef } from "react";
import { useNotification } from "../../context/NotificationContext";
import locationService from "../../services/api/locationService";

const ProjectCreationModal = ({
  isOpen,
  onClose,
  onSubmit,
  departments,
  assignedCounty,
  initialData = null,
  isEdit = false,
}) => {
  const { showError, showInfo } = useNotification();
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    county: "",
    subcounty: "",
    ward: "",
    department: "",
    budget: "",
    start_date: "",
    expected_completion: "",
    status: "planned",
    progress_percentage: 0,
    progress_updates: "",
    images: [],
  });
  const [subcounties, setSubcounties] = useState([]);
  const [wards, setWards] = useState([]);
  const [counties, setCounties] = useState([]);
  
  const fileInputRef = useRef(null);
  const MAX_IMAGES = 10;
  const SUPPORTED_FORMATS = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  const MAX_FILE_SIZE = 5 * 1024 * 1024;

  useEffect(() => {
    if (initialData && isEdit) {
      setFormData({
        title: initialData.title || "",
        description: initialData.description || "",
        county: initialData.county?.id || initialData.county || "",
        subcounty: initialData.subcounty?.id || initialData.subcounty || "",
        ward: initialData.ward?.id || initialData.ward || "",
        department: initialData.department?.id || initialData.department || "",
        budget: initialData.budget || "",
        start_date: initialData.start_date || "",
        expected_completion: initialData.expected_completion || "",
        status: initialData.status || "planned",
        progress_percentage: initialData.progress_percentage || 0,
        progress_updates: initialData.progress_updates || "",
        images: initialData.images || [],
      });
    }
  }, [initialData, isEdit]);

  useEffect(() => {
    const loadCounties = async () => {
      try {
        const countiesData = await locationService.getCounties();
        setCounties(countiesData);

        if (assignedCounty && !isEdit) {
          setFormData((prev) => ({
            ...prev,
            county: assignedCounty.id,
          }));
        }
      } catch (error) {
        console.error("Failed to load counties:", error);
        showError("Failed to load counties", "Loading Error");
      }
    };

    if (isOpen) {
      loadCounties();
    }
  }, [isOpen, assignedCounty, isEdit, showError]);

  useEffect(() => {
    const loadSubcounties = async () => {
      if (!formData.county) {
        setSubcounties([]);
        setWards([]);
        return;
      }

      try {
        setLocationLoading(true);
        const subcountiesData = await locationService.getSubcounties(
          formData.county
        );
        setSubcounties(subcountiesData);
        setWards([]);
        setFormData((prev) => ({ ...prev, subcounty: "", ward: "" }));
      } catch (error) {
        console.error("Failed to load subcounties:", error);
        setSubcounties([]);
      } finally {
        setLocationLoading(false);
      }
    };

    loadSubcounties();
  }, [formData.county]);

  useEffect(() => {
    const loadWards = async () => {
      if (!formData.subcounty) {
        setWards([]);
        return;
      }

      try {
        setLocationLoading(true);
        const wardsData = await locationService.getWards(formData.subcounty);
        setWards(wardsData);
        setFormData((prev) => ({ ...prev, ward: "" }));
      } catch (error) {
        console.error("Failed to load wards:", error);
        setWards([]);
      } finally {
        setLocationLoading(false);
      }
    };

    loadWards();
  }, [formData.subcounty]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    const validFiles = [];
    const errors = [];

    files.forEach((file) => {
      try {
        validateFile(file);
        validFiles.push(file);
      } catch (error) {
        errors.push(error.message);
      }
    });

    if (errors.length > 0) {
      showError(`Some files were skipped: ${errors.join("; ")}`, "File Validation");
    }

    const totalAfterAdd = formData.images.length + validFiles.length;
    if (totalAfterAdd > MAX_IMAGES) {
      const allowed = MAX_IMAGES - formData.images.length;
      showError(`You can only add ${allowed} more image(s). Maximum ${MAX_IMAGES} images allowed.`, "Image Limit");
      return;
    }

    if (validFiles.length > 0) {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...validFiles],
      }));
      showInfo(`Added ${validFiles.length} image(s) successfully`, "Images Added");
    }

    event.target.value = "";
  };

  const validateFile = (file) => {
    if (!SUPPORTED_FORMATS.includes(file.type)) {
      throw new Error(`Unsupported file format: ${file.type}. Please use JPEG, PNG, or WebP.`);
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Maximum size is 5MB.`);
    }

    return true;
  };

  const removeImage = (index) => {
    setFormData((prev) => {
      const newImages = prev.images.filter((_, i) => i !== index);
      return {
        ...prev,
        images: newImages,
      };
    });
    showInfo("Image removed", "Image Removed");
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.title.trim() ||
      !formData.description.trim() ||
      !formData.department ||
      !formData.county
    ) {
      showError("Please fill in all required fields", "Validation Error");
      return;
    }

    if (
      formData.start_date &&
      formData.expected_completion &&
      new Date(formData.expected_completion) < new Date(formData.start_date)
    ) {
      showError(
        "Expected completion date cannot be before start date",
        "Validation Error"
      );
      return;
    }

    setLoading(true);
    try {
      // Create FormData for file upload
      const submitFormData = new FormData();
      
      // Append basic fields
      submitFormData.append("title", formData.title.trim());
      submitFormData.append("description", formData.description.trim());
      submitFormData.append("county", formData.county);
      submitFormData.append("department", formData.department);
      submitFormData.append("is_development_showcase", "true");
      submitFormData.append("status", "verified");
      submitFormData.append("priority", "medium");

      if (formData.subcounty) {
        submitFormData.append("subcounty", formData.subcounty);
      }
      if (formData.ward) {
        submitFormData.append("ward", formData.ward);
      }
      if (formData.budget) {
        submitFormData.append("development_budget", parseFloat(formData.budget));
      }
      if (formData.expected_completion) {
        submitFormData.append("completion_date", formData.expected_completion);
      }
      if (formData.progress_percentage) {
        submitFormData.append("development_progress", parseInt(formData.progress_percentage));
      }
      if (formData.progress_updates) {
        submitFormData.append("government_response", formData.progress_updates);
      }

      // Append images
      formData.images.forEach((image, index) => {
        submitFormData.append("images", image);
      });

      console.log("Submitting government project with FormData:");
      for (let [key, value] of submitFormData.entries()) {
        console.log(`${key}:`, value);
      }

      await onSubmit(submitFormData);

      // Reset form on success
      if (!isEdit) {
        setFormData({
          title: "",
          description: "",
          county: assignedCounty?.id || "",
          subcounty: "",
          ward: "",
          department: "",
          budget: "",
          start_date: "",
          expected_completion: "",
          status: "planned",
          progress_percentage: 0,
          progress_updates: "",
          images: [],
        });
        setSubcounties([]);
        setWards([]);
      }
    } catch (error) {
      console.error("Error submitting project:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEdit ? "Edit Government Project" : "Create Government Project"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-6 h-6"
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
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter project title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe the project details, objectives, and scope"
                required
              />
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Project Images</h3>
                <p className="text-sm text-gray-600">Add photos to showcase the project</p>
              </div>
              <div className="text-sm text-gray-500">
                {formData.images.length}/{MAX_IMAGES} images
              </div>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept={SUPPORTED_FORMATS.join(",")}
              multiple
              className="hidden"
            />

            <button
              type="button"
              onClick={triggerFileInput}
              disabled={formData.images.length >= MAX_IMAGES}
              className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-green-300 rounded-xl hover:border-green-400 hover:bg-green-50 transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
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
                Add Project Images
              </span>
              <span className="text-sm text-gray-600 text-center">
                Upload photos, diagrams, or progress images
              </span>
            </button>

            {formData.images.length > 0 && (
              <div className="mt-4">
                <h4 className="text-md font-semibold text-gray-900 mb-3">
                  Selected Images ({formData.images.length})
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {formData.images.map((image, index) => (
                    <div key={`${image.name}-${index}`} className="relative group">
                      <div className="aspect-square overflow-hidden rounded-lg border border-gray-300 bg-gray-100">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Project image ${index + 1}`}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          onLoad={(e) => URL.revokeObjectURL(e.target.src)}
                        />
                      </div>
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
                      <div className="mt-2 text-xs text-gray-600 truncate" title={image.name}>
                        {image.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Image Guidelines</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>Clear, well-lit photos help showcase the project</li>
                <li>Include multiple angles and progress shots when possible</li>
                <li>Supported formats: JPEG, PNG, WebP (max 5MB each)</li>
                <li>Maximum {MAX_IMAGES} photos per project</li>
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                County *
              </label>
              <select
                name="county"
                value={formData.county}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={!!assignedCounty && !isEdit}
              >
                <option value="">Select County</option>
                {counties.map((county) => (
                  <option key={county.id} value={county.id}>
                    {county.name}
                  </option>
                ))}
              </select>
              {assignedCounty && !isEdit && (
                <p className="text-xs text-gray-500 mt-1">
                  Pre-selected based on your assignment
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subcounty
              </label>
              <select
                name="subcounty"
                value={formData.subcounty}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={!formData.county || locationLoading}
              >
                <option value="">Select Subcounty</option>
                {subcounties.map((subcounty) => (
                  <option key={subcounty.id} value={subcounty.id}>
                    {subcounty.name}
                  </option>
                ))}
              </select>
              {locationLoading && (
                <p className="text-xs text-gray-500 mt-1">Loading...</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ward
              </label>
              <select
                name="ward"
                value={formData.ward}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={!formData.subcounty || locationLoading}
              >
                <option value="">Select Ward</option>
                {wards.map((ward) => (
                  <option key={ward.id} value={ward.id}>
                    {ward.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Responsible Department *
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.department?.name || dept.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Budget (KSh)
              </label>
              <input
                type="number"
                name="budget"
                value={formData.budget}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="planned">Planned</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="delayed">Delayed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expected Completion
              </label>
              <input
                type="date"
                name="expected_completion"
                value={formData.expected_completion}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Progress Percentage
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  name="progress_percentage"
                  value={formData.progress_percentage}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  className="flex-1"
                />
                <span className="text-sm font-medium text-gray-700 w-12">
                  {formData.progress_percentage}%
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Progress Updates
              </label>
              <textarea
                name="progress_updates"
                value={formData.progress_updates}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Add recent progress updates or milestones..."
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? "Saving..."
                : isEdit
                ? "Update Project"
                : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectCreationModal;