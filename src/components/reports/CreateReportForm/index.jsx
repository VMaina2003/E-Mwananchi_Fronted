import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { useReports } from "../../../hooks/useReports";
import LocationSection from "./LocationSection";
import DetailsSection from "./DetailsSection";
import MediaSection from "./MediaSection";
import AIFeedback from "./AIFeedback";
import locationService from "../../../services/api/locationService";
const CreateReportForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createReport, analyzeReport, loading, error, clearError } =
    useReports();

  // Form state
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
  });

  // UI state
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [counties, setCounties] = useState([]);
  const [subCounties, setSubCounties] = useState([]);
  const [wards, setWards] = useState([]);
  const [departments, setDepartments] = useState([]);

  // Loading states
  const [loadingCounties, setLoadingCounties] = useState(false);
  const [loadingSubCounties, setLoadingSubCounties] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);
  const [loadingDepartments, setLoadingDepartments] = useState(false);

  // Load counties and departments on component mount
  useEffect(() => {
    fetchCounties();
    fetchDepartments();
  }, []);

  // Load sub-counties when county changes
  useEffect(() => {
    if (formData.county) {
      setFormData((prev) => ({
        ...prev,
        subcounty: "",
        ward: "",
      }));
      fetchSubCounties(formData.county);
    } else {
      setSubCounties([]);
      setWards([]);
    }
  }, [formData.county]);

  // Load wards when sub-county changes
  useEffect(() => {
    if (formData.subcounty) {
      setFormData((prev) => ({ ...prev, ward: "" }));
      fetchWards(formData.subcounty);
    } else {
      setWards([]);
    }
  }, [formData.subcounty]);

  // Data fetching functions
  const fetchCounties = async () => {
    setLoadingCounties(true);
    try {
      const data = await locationService.getCounties();
      setCounties(data);
    } catch (error) {
      console.error("Failed to fetch counties:", error);
      setValidationErrors((prev) => ({
        ...prev,
        fetchError: "Failed to load counties. Please refresh the page.",
      }));
    } finally {
      setLoadingCounties(false);
    }
  };

  const fetchSubCounties = async (countyId) => {
    setLoadingSubCounties(true);
    try {
      const data = await locationService.getSubcounties(countyId);
      setSubCounties(data);
    } catch (error) {
      console.error("Failed to fetch sub-counties:", error);
      setValidationErrors((prev) => ({
        ...prev,
        fetchError: "Failed to load sub-counties.",
      }));
    } finally {
      setLoadingSubCounties(false);
    }
  };

  const fetchWards = async (subCountyId) => {
    setLoadingWards(true);
    try {
      const data = await locationService.getWards(subCountyId);
      setWards(data);
    } catch (error) {
      console.error("Failed to fetch wards:", error);
      setValidationErrors((prev) => ({
        ...prev,
        fetchError: "Failed to load wards.",
      }));
    } finally {
      setLoadingWards(false);
    }
  };

  const fetchDepartments = async () => {
    setLoadingDepartments(true);
    try {
      const data = await locationService.getDepartments();
      setDepartments(data);
    } catch (error) {
      console.error("Failed to fetch departments:", error);
      setValidationErrors((prev) => ({
        ...prev,
        fetchError: "Failed to load departments.",
      }));
    } finally {
      setLoadingDepartments(false);
    }
  };

  // In the handleAnalysisUpdate function, update this part:
  const handleAnalysisUpdate = useCallback(
    async (title, description) => {
      if (!title || !description) return;

      try {
        const analysis = await analyzeReport(title, description);
        if (analysis) {
          setAiAnalysis(analysis);

          // Auto-fill department if high confidence
          if (analysis.confidence >= 0.8 && analysis.predicted_department) {
            const matchedDept = departmentsArray.find(
              (dept) => dept.name === analysis.predicted_department
            );
            if (matchedDept) {
              setFormData((prev) => ({ ...prev, department: matchedDept.id }));
            }
          }
        }
      } catch (error) {
        console.error("AI analysis failed:", error);
      }
    },
    [analyzeReport, departments]
  );

  // Form validation
  const validateForm = () => {
    const errors = {};

    if (!formData.title?.trim()) errors.title = "Title is required";
    if (!formData.description?.trim())
      errors.description = "Description is required";
    if (!formData.county) errors.county = "County is required";

    // Validate description length
    if (formData.description?.trim().length < 10) {
      errors.description = "Description should be at least 10 characters long";
    }

    // Validate title length
    if (formData.title?.trim().length < 5) {
      errors.title = "Title should be at least 5 characters long";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Form reset
  const resetForm = () => {
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
    });
    setAiAnalysis(null);
    setValidationErrors({});
    clearError();
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setValidationErrors({});

    if (!validateForm()) {
      // Scroll to first error
      const firstErrorField = Object.keys(validationErrors)[0];
      const element = document.querySelector(`[name="${firstErrorField}"]`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    // Prepare data for backend
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
      new_images: formData.images || [],
    };

    try {
      const result = await createReport(submitData);

      if (result.success) {
        resetForm();
        alert(
          "Report submitted successfully! You will be redirected to your reports."
        );
        navigate("/my-reports");
      }
    } catch (submitError) {
      console.error("Submission failed:", submitError);
      // Error is handled by useReports hook
    }
  };

  // Handle form cancellation
  const handleCancel = () => {
    if (
      window.confirm(
        "Are you sure you want to cancel? Any unsaved changes will be lost."
      )
    ) {
      resetForm();
      navigate("/dashboard");
    }
  };

  // Authentication check
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Authentication Required
          </h2>
          <p className="text-gray-600 mb-4">
            Please log in to create a report.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="bg-green-600 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">
              Report a Community Issue
            </h1>
            <p className="text-green-100">
              Help improve your community by reporting issues that need
              attention
            </p>
          </div>

          <div className="p-6 border-b">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-sm text-gray-600">
                  Reporting as:{" "}
                  <strong>
                    {user.first_name} {user.last_name}
                  </strong>
                </p>
                <p className="text-sm text-gray-600">
                  Role: <span className="capitalize">{user.role}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">All reports are public</p>
                <p className="text-sm text-gray-600">
                  AI-powered department assignment
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Fetch Error Display */}
        {validationErrors.fetchError && (
          <div
            role="alert"
            aria-live="polite"
            className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg mb-6"
          >
            <div className="flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {validationErrors.fetchError}
            </div>
          </div>
        )}

        {/* AI Feedback */}
        {aiAnalysis && (
          <AIFeedback
            aiAnalysis={aiAnalysis}
            confidenceLevel={aiAnalysis.confidence}
          />
        )}

        {/* Error Display */}
        {error && (
          <div
            role="alert"
            aria-live="polite"
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6"
          >
            <div className="flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {error}
            </div>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <DetailsSection
            formData={formData}
            setFormData={setFormData}
            onAnalysisUpdate={handleAnalysisUpdate}
            departments={departments}
            loadingDepartments={loadingDepartments}
            validationErrors={validationErrors}
          />

          <LocationSection
            formData={formData}
            setFormData={setFormData}
            counties={counties}
            subCounties={subCounties}
            setSubCounties={setSubCounties} // Add this
            wards={wards}
            setWards={setWards} // Add this
            loadingCounties={loadingCounties}
            loadingSubCounties={loadingSubCounties}
            loadingWards={loadingWards}
            validationErrors={validationErrors}
          />

          <MediaSection
            formData={formData}
            setFormData={setFormData}
            validationErrors={validationErrors}
          />

          {/* Submit Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Ready to Submit
                </h3>
                <p className="text-sm text-gray-600">
                  Your report will be public and assigned to the appropriate
                  department
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
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
