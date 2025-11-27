import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { useNotification } from "../../../context/NotificationContext";
import { useReports } from "../../../hooks/useReports";
import LocationSection from "./LocationSection";
import DetailsSection from "./DetailsSection";
import MediaSection from "./MediaSection";
import AIFeedback from "./AIFeedback";
import locationService from "../../../services/api/locationService";

const CreateReportForm = ({
  onSubmissionStart,
  onSubmissionComplete,
  user,
}) => {
  const navigate = useNavigate();
  const { showError, showInfo, showWarning } = useNotification();
  const { createReport, analyzeReport, loading, error, clearError } =
    useReports();

  // Form state with comprehensive validation
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    county: "",
    subcounty: "",
    ward: "",
    department: "",
    latitude: "",
    longitude: "",
    images: [],
    priority: "medium",
    is_anonymous: false,
    anonymous_display_name: "Anonymous Citizen",
  });

  // UI state
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [locationData, setLocationData] = useState({
    counties: [],
    subCounties: [],
    wards: [],
    departments: [],
  });
  const [loadingStates, setLoadingStates] = useState({
    counties: false,
    subCounties: false,
    wards: false,
    departments: false,
  });

  // Load initial data
  useEffect(() => {
    const initializeData = async () => {
      try {
        await Promise.all([fetchCounties(), fetchDepartments()]);
      } catch (error) {
        showError(
          "Failed to load required data. Please refresh the page.",
          "Initialization Error"
        );
      }
    };

    initializeData();
  }, []);

  // Location data fetching with error handling
  const fetchCounties = async () => {
    setLoadingStates((prev) => ({ ...prev, counties: true }));
    try {
      const data = await locationService.getCounties();
      setLocationData((prev) => ({ ...prev, counties: data }));
    } catch (error) {
      console.error("Failed to fetch counties:", error);
      showError(
        "Failed to load counties. Please try again.",
        "Location Data Error"
      );
    } finally {
      setLoadingStates((prev) => ({ ...prev, counties: false }));
    }
  };

  const fetchSubCounties = async (countyId) => {
    setLoadingStates((prev) => ({ ...prev, subCounties: true }));
    try {
      const data = await locationService.getSubcounties(countyId);
      setLocationData((prev) => ({ ...prev, subCounties: data }));
    } catch (error) {
      console.error("Failed to fetch sub-counties:", error);
      showWarning(
        "Failed to load sub-counties for selected county.",
        "Location Data"
      );
    } finally {
      setLoadingStates((prev) => ({ ...prev, subCounties: false }));
    }
  };

  const fetchWards = async (subCountyId) => {
    setLoadingStates((prev) => ({ ...prev, wards: true }));
    try {
      const data = await locationService.getWards(subCountyId);
      setLocationData((prev) => ({ ...prev, wards: data }));
    } catch (error) {
      console.error("Failed to fetch wards:", error);
      showWarning(
        "Failed to load wards for selected sub-county.",
        "Location Data"
      );
    } finally {
      setLoadingStates((prev) => ({ ...prev, wards: false }));
    }
  };

  const fetchDepartments = async () => {
    setLoadingStates((prev) => ({ ...prev, departments: true }));
    try {
      const data = await locationService.getDepartments();
      setLocationData((prev) => ({ ...prev, departments: data }));
    } catch (error) {
      console.error("Failed to fetch departments:", error);
      showWarning(
        "Failed to load departments. You can still submit the report.",
        "Department Data"
      );
    } finally {
      setLoadingStates((prev) => ({ ...prev, departments: false }));
    }
  };

  // Handle location changes with cascading updates
  const handleCountyChange = (countyId) => {
    setFormData((prev) => ({
      ...prev,
      county: countyId,
      subcounty: "",
      ward: "",
    }));

    if (countyId) {
      fetchSubCounties(countyId);
      setLocationData((prev) => ({ ...prev, subCounties: [], wards: [] }));
    } else {
      setLocationData((prev) => ({ ...prev, subCounties: [], wards: [] }));
    }
  };

  const handleSubCountyChange = (subCountyId) => {
    setFormData((prev) => ({
      ...prev,
      subcounty: subCountyId,
      ward: "",
    }));

    if (subCountyId) {
      fetchWards(subCountyId);
      setLocationData((prev) => ({ ...prev, wards: [] }));
    } else {
      setLocationData((prev) => ({ ...prev, wards: [] }));
    }
  };

  // AI Analysis with intelligent suggestions
  const handleAnalysisUpdate = useCallback(
    async (title, description) => {
      if (
        !title?.trim() ||
        !description?.trim() ||
        title.length < 5 ||
        description.length < 10
      ) {
        return null;
      }

      try {
        const analysis = await analyzeReport(title, description);
        if (analysis) {
          setAiAnalysis(analysis);

          // Auto-suggest department with high confidence
          if (analysis.confidence >= 0.7 && analysis.predicted_department) {
            const matchedDept = locationData.departments.find(
              (dept) =>
                dept.name.toLowerCase() ===
                analysis.predicted_department.toLowerCase()
            );
            if (matchedDept && !formData.department) {
              setFormData((prev) => ({ ...prev, department: matchedDept.id }));
              showInfo(
                `AI suggested department: ${analysis.predicted_department}`,
                "AI Suggestion"
              );
            }
          }
        }
        return analysis;
      } catch (error) {
        console.error("AI analysis failed:", error);
        showWarning(
          "AI analysis is temporarily unavailable. Please select department manually.",
          "AI Service"
        );
        return null;
      }
    },
    [
      analyzeReport,
      locationData.departments,
      formData.department,
      showInfo,
      showWarning,
    ]
  );

  // Enhanced form validation
  const validateForm = useCallback(() => {
    const errors = {};

    // Title validation
    if (!formData.title?.trim()) {
      errors.title = "Title is required";
    } else if (formData.title.trim().length < 5) {
      errors.title = "Title must be at least 5 characters long";
    } else if (formData.title.trim().length > 200) {
      errors.title = "Title must be less than 200 characters";
    }

    // Description validation
    if (!formData.description?.trim()) {
      errors.description = "Description is required";
    } else if (formData.description.trim().length < 10) {
      errors.description = "Description must be at least 10 characters long";
    } else if (formData.description.trim().length > 2000) {
      errors.description = "Description must be less than 2000 characters";
    }

    // Location validation
    if (!formData.county) {
      errors.county = "Please select a county";
    }

    // Image validation (optional but with limits)
    if (formData.images.length > 10) {
      errors.images = "Maximum 10 images allowed";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  // Form reset with cleanup
  const resetForm = useCallback(() => {
    setFormData({
      title: "",
      description: "",
      county: "",
      subcounty: "",
      ward: "",
      department: "",
      latitude: "",
      longitude: "",
      images: [],
      priority: "medium",
      is_anonymous: false,
      anonymous_display_name: "Anonymous Citizen",
    });
    setAiAnalysis(null);
    setValidationErrors({});
    clearError();
  }, [clearError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setValidationErrors({});

    if (!validateForm()) {
      // ... validation error handling
      return;
    }

    // FIX: Create a proper copy of the images array
    const imagesToSubmit = [...formData.images]; // Create actual copy

    // Prepare submission data with the stored images
    const submitData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      county: formData.county,
      subcounty: formData.subcounty || null,
      ward: formData.ward || null,
      department: formData.department || null,
      latitude: formData.latitude || null,
      longitude: formData.longitude || null,
      priority: formData.priority,
      is_anonymous: formData.is_anonymous,
      anonymous_display_name: formData.anonymous_display_name,
      images: imagesToSubmit, // Use the copied images
    };

    console.log("🚀 Submitting with images:", {
      count: imagesToSubmit.length,
      images: imagesToSubmit.map((img) => ({
        name: img.name,
        size: img.size,
        type: img.type,
        isFile: img instanceof File,
      })),
    });

    try {
      onSubmissionStart();
      const result = await createReport(submitData);

      if (result.success) {
        resetForm();
        onSubmissionComplete(true, result.reportId);
      } else {
        onSubmissionComplete(
          false,
          null,
          result.error || "Failed to submit report"
        );
      }
    } catch (submitError) {
      console.error("Submission failed:", submitError);
      onSubmissionComplete(false, null, submitError.message);
    }
  };

  // Enhanced cancellation with confirmation
  const handleCancel = () => {
    const hasUnsavedChanges =
      formData.title || formData.description || formData.images.length > 0;

    if (hasUnsavedChanges) {
      showWarning(
        "You have unsaved changes. Are you sure you want to cancel?",
        "Confirm Cancellation",
        10000,
        () => {
          resetForm();
          navigate("/dashboard");
        }
      );
    } else {
      navigate("/dashboard");
    }
  };

  // Authentication guard
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-100 border border-red-300 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Authentication Required
          </h2>
          <p className="text-gray-600 mb-6">
            Please log in to create a community report.
          </p>
          <button
            onClick={() =>
              navigate("/login", { state: { from: "/reports/create" } })
            }
            className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors w-full"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-5">
            <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
              Report Community Issue
            </h1>
            <p className="text-green-100 text-lg">
              Help improve your community by reporting issues that need
              attention
            </p>
          </div>

          <div className="p-6 border-b border-gray-100">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="space-y-2">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Reporting as:</span>{" "}
                  {user.first_name} {user.last_name}
                </p>
                <p className="text-sm text-gray-600 capitalize">
                  <span className="font-medium">Role:</span>{" "}
                  {user.role?.replace(/_/g, " ")}
                  {user.county && ` • ${user.county.name || user.county}`}
                </p>
              </div>
              <div className="flex flex-wrap gap-3 text-sm">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                  AI-Powered Analysis
                </span>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
                  Public Report
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Error Displays */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 animate-fade-in">
            <div className="flex items-start space-x-3">
              <svg
                className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <p className="font-medium text-red-800">Submission Error</p>
                <p className="text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* AI Feedback */}
        {aiAnalysis && (
          <AIFeedback
            aiAnalysis={aiAnalysis}
            confidenceLevel={aiAnalysis.confidence}
            onDismiss={() => setAiAnalysis(null)}
          />
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <DetailsSection
            formData={formData}
            setFormData={setFormData}
            onAnalysisUpdate={handleAnalysisUpdate}
            departments={locationData.departments}
            loadingDepartments={loadingStates.departments}
            validationErrors={validationErrors}
          />

          <LocationSection
            formData={formData}
            setFormData={setFormData}
            counties={locationData.counties}
            subCounties={locationData.subCounties}
            wards={locationData.wards}
            onCountyChange={handleCountyChange}
            onSubCountyChange={handleSubCountyChange}
            loadingCounties={loadingStates.counties}
            loadingSubCounties={loadingStates.subCounties}
            loadingWards={loadingStates.wards}
            validationErrors={validationErrors}
          />

          <MediaSection
            formData={formData}
            setFormData={setFormData}
            validationErrors={validationErrors}
          />

          {/* Submission Section */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Ready to Submit Report
                </h3>
                <p className="text-sm text-gray-600">
                  Your report will be publicly visible and automatically
                  assigned to the appropriate county department for action.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 min-w-[140px]"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Submitting...
                    </>
                  ) : (
                    "Submit Report"
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateReportForm;
