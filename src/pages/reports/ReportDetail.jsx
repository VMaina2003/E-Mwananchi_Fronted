// src/pages/reports/ReportDetail.jsx - FIXED VERSION
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useNotification } from "../../context/NotificationContext";
import Layout from "../../components/common/Layout";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import EditCommentModal from "../../components/common/EditCommentModal";
import reportService from "../../services/api/reportService";
import commentService from "../../services/api/commentService";

const ReportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { showSuccess, showError, showInfo } = useNotification();

  // State management
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");

  // Comment functionality state
  const [comments, setComments] = useState([]);
  const [citizenComments, setCitizenComments] = useState([]);
  const [officialComments, setOfficialComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [activeCommentTab, setActiveCommentTab] = useState("all");

  // Modal states
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    commentId: null,
    commentContent: "",
  });
  const [editModal, setEditModal] = useState({
    isOpen: false,
    comment: null,
  });

  // Image modal state
  const [imageModal, setImageModal] = useState({
    isOpen: false,
    image: null,
    index: 0,
  });

  useEffect(() => {
    fetchReport();
    fetchComments();
  }, [id]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const data = await reportService.getReport(id);
      setReport(data);
      setSelectedStatus(data.status);
    } catch (err) {
      console.error("Failed to fetch report:", err);
      showError("Failed to load report. Please try again.", "Loading Error");
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      setLoadingComments(true);
      const response = await commentService.getCommentsByReport(id);

      let commentsData = [];
      if (Array.isArray(response)) {
        commentsData = response;
      } else if (response && Array.isArray(response.results)) {
        commentsData = response.results;
      } else if (response && Array.isArray(response.data)) {
        commentsData = response.data;
      }

      setComments(commentsData);

      // Separate comments by type
      const citizens = commentsData.filter(
        (comment) => comment && comment.comment_type === "citizen"
      );
      const officials = commentsData.filter(
        (comment) => comment && comment.comment_type === "official"
      );

      setCitizenComments(citizens);
      setOfficialComments(officials);
    } catch (error) {
      console.error("Failed to load comments:", error);
      showError("Failed to load comments", "Comments Error");
      setComments([]);
      setCitizenComments([]);
      setOfficialComments([]);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedStatus || selectedStatus === report?.status || !user) return;

    try {
      setUpdatingStatus(true);
      const updatedReport = await reportService.updateReportStatus(
        id,
        selectedStatus
      );
      setReport(updatedReport);
      showSuccess("Status updated successfully", "Report Updated");
    } catch (err) {
      console.error("Status update failed:", err);
      showError(
        err.response?.data?.detail || "Failed to update status",
        "Update Error"
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();

    if (!isAuthenticated || !user) {
      showError("Please log in to comment", "Authentication Required");
      navigate("/login", { state: { from: `/reports/${id}` } });
      return;
    }

    if (!newComment.trim()) {
      showError("Comment cannot be empty", "Validation Error");
      return;
    }

    try {
      setSubmittingComment(true);

      const userCommentType =
        user.role === "county_official" ||
        user.role === "admin" ||
        user.role === "superadmin"
          ? "official"
          : "citizen";

      const commentData = {
        report: id,
        comment_type: userCommentType,
        content: newComment.trim(),
        parent: null,
      };

      await commentService.createComment(commentData);

      setNewComment("");
      await fetchComments();

      showSuccess("Comment added successfully", "Comment Posted");

      if (userCommentType === "official") {
        showInfo(
          "Official response has been recorded and notifications sent",
          "Official Response"
        );
      }
    } catch (error) {
      console.error("Failed to submit comment:", error);
      showError("Failed to submit comment. Please try again.", "Comment Error");
    } finally {
      setSubmittingComment(false);
    }
  };

  // Comment management functions
  const handleDeleteClick = (comment) => {
    setDeleteModal({
      isOpen: true,
      commentId: comment.id,
      commentContent:
        comment.content?.substring(0, 100) +
        (comment.content?.length > 100 ? "..." : ""),
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.commentId) return;

    try {
      await commentService.deleteComment(deleteModal.commentId);
      await fetchComments();
      showSuccess("Comment deleted successfully", "Comment Deleted");
    } catch (error) {
      console.error("Failed to delete comment:", error);
      showError("Failed to delete comment", "Delete Error");
    } finally {
      setDeleteModal({ isOpen: false, commentId: null, commentContent: "" });
    }
  };

  const handleEditClick = (comment) => {
    setEditModal({
      isOpen: true,
      comment: comment,
    });
  };

  const handleEditSave = async (newContent) => {
    if (!editModal.comment) return;

    try {
      await commentService.updateComment(editModal.comment.id, {
        content: newContent,
      });
      await fetchComments();
      showSuccess("Comment updated successfully", "Comment Updated");
    } catch (error) {
      console.error("Failed to update comment:", error);
      showError("Failed to update comment", "Update Error");
      throw error;
    }
  };

  // Image modal functions
  const handleImageClick = (image, index) => {
    setImageModal({
      isOpen: true,
      image: image,
      index: index,
    });
  };

  const handleNextImage = () => {
    if (!report?.images) return;
    const nextIndex = (imageModal.index + 1) % report.images.length;
    setImageModal((prev) => ({
      ...prev,
      image: report.images[nextIndex],
      index: nextIndex,
    }));
  };

  const handlePrevImage = () => {
    if (!report?.images) return;
    const prevIndex =
      (imageModal.index - 1 + report.images.length) % report.images.length;
    setImageModal((prev) => ({
      ...prev,
      image: report.images[prevIndex],
      index: prevIndex,
    }));
  };

  // Enhanced permission checking functions
  const canDeleteComment = (comment) => {
    if (!user || !comment) return false;
    const isAuthor = user.id === comment.user?.id || user.id === comment.user;
    const hasAdminPermission =
      user.role === "admin" ||
      user.role === "superadmin" ||
      user.role === "county_official";
    return isAuthor || hasAdminPermission;
  };

  const canEditComment = (comment) => {
    if (!user || !comment) return false;
    const isAuthor = user.id === comment.user?.id || user.id === comment.user;
    return isAuthor;
  };

  const canUpdateStatus =
    user &&
    (user.role === "county_official" ||
      user.role === "admin" ||
      user.role === "superadmin");

  // Helper functions
  const getStatusColor = (status) => {
    const colors = {
      submitted: "bg-blue-100 text-blue-800 border-blue-200",
      verified: "bg-green-100 text-green-800 border-green-200",
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      noted: "bg-purple-100 text-purple-800 border-purple-200",
      on_progress: "bg-orange-100 text-orange-800 border-orange-200",
      resolved: "bg-green-100 text-green-800 border-green-200",
      rejected: "bg-red-100 text-red-800 border-red-200",
      deleted: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getStatusDisplay = (status) => {
    const displays = {
      submitted: "Submitted",
      verified: "Verified",
      pending: "Pending Review",
      noted: "Noted",
      on_progress: "In Progress",
      resolved: "Resolved",
      rejected: "Rejected",
      deleted: "Deleted",
    };
    return displays[status] || status;
  };

  const getDepartmentColor = (departmentName) => {
    const colors = {
      health: "bg-red-50 border-red-200 text-red-800",
      education: "bg-blue-50 border-blue-200 text-blue-800",
      roads: "bg-yellow-50 border-yellow-200 text-yellow-800",
      security: "bg-gray-50 border-gray-200 text-gray-800",
      agriculture: "bg-green-50 border-green-200 text-green-800",
      environment: "bg-emerald-50 border-emerald-200 text-emerald-800",
      water: "bg-cyan-50 border-cyan-200 text-cyan-800",
    };

    if (!departmentName) return "bg-gray-50 border-gray-200 text-gray-800";

    const deptLower = departmentName.toLowerCase();
    for (const [key, color] of Object.entries(colors)) {
      if (deptLower.includes(key)) {
        return color;
      }
    }

    return "bg-gray-50 border-gray-200 text-gray-800";
  };

  const formatDateTime = (dateString) => {
    try {
      return new Date(dateString).toLocaleString("en-KE", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  const getCountyName = () => {
    if (!report) return "Not specified";
    return (
      report.county_name ||
      (report.county && typeof report.county === "object"
        ? report.county.name
        : "Not specified")
    );
  };

  const getSubcountyName = () => {
    if (!report) return null;
    return (
      report.subcounty_name ||
      (report.subcounty && typeof report.subcounty === "object"
        ? report.subcounty.name
        : null)
    );
  };

  const getWardName = () => {
    if (!report) return null;
    return (
      report.ward_name ||
      (report.ward && typeof report.ward === "object" ? report.ward.name : null)
    );
  };

  const getDepartmentName = () => {
    if (!report) return "Not assigned";
    return (
      report.department_name ||
      (report.department && typeof report.department === "object"
        ? report.department.department?.name || report.department.name
        : "Not assigned")
    );
  };

  const getImageUrl = (image) => {
    if (!image) return "/placeholder-image.jpg";
    return image.image_url || image.image || "/placeholder-image.jpg";
  };

  // Render functions - FIXED: Added proper key props
  const renderComments = (commentsToRender) => {
    const safeComments = Array.isArray(commentsToRender)
      ? commentsToRender
      : [];

    if (safeComments.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <svg
            className="w-16 h-16 mx-auto text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <p>No comments yet. Be the first to share your thoughts!</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {safeComments.map((comment, index) => (
          <div
            key={comment.id || `comment-${index}-${Date.now()}`}
            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors duration-200"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {comment.user_display_name?.charAt(0) || "U"}
                  </div>
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-gray-900">
                      {comment.user_display_name ||
                        `${comment.user?.first_name || ""} ${
                          comment.user?.last_name || ""
                        }`.trim() ||
                        "Anonymous User"}
                    </span>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        comment.comment_type === "official"
                          ? "bg-blue-100 text-blue-800 border border-blue-200"
                          : "bg-gray-100 text-gray-800 border border-gray-200"
                      }`}
                    >
                      {comment.comment_type === "official"
                        ? "Official Response"
                        : "Citizen Comment"}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatDateTime(comment.created_at)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {canDeleteComment(comment) && (
                  <button
                    onClick={() => handleDeleteClick(comment)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors p-1 rounded hover:bg-red-50"
                    title="Delete comment"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                )}
                {canEditComment(comment) && (
                  <button
                    onClick={() => handleEditClick(comment)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors p-1 rounded hover:bg-blue-50"
                    title="Edit comment"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {comment.content}
            </p>
          </div>
        ))}
      </div>
    );
  };

  // Loading and error states
  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading report details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!report) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Report Not Found
            </h2>
            <p className="text-gray-600 mb-6">
              The report you're looking for doesn't exist or you don't have
              permission to view it.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate("/reports")}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Back to Reports
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-8">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(
                        report.status
                      )}`}
                    >
                      {getStatusDisplay(report.status)}
                    </span>
                    {report.verified_by_ai && (
                      <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        <svg
                          className="w-3 h-3"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        AI Verified
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl lg:text-4xl font-bold text-white mb-3">
                    {report.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-green-100">
                    <span className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      {report.reporter_name || "Unknown"}
                    </span>
                    <span className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {formatDateTime(report.created_at)}
                    </span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => navigate("/reports")}
                    className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors flex items-center gap-2"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                      />
                    </svg>
                    Back to Reports
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Issue Description
                </h2>
                <div className="bg-gray-50 rounded-lg p-6">
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-lg">
                    {report.description}
                  </p>
                </div>
              </div>

              {/* Images Gallery - FIXED: Added proper key */}
              {report.images && report.images.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-gray-600"
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
                    Evidence Photos ({report.images.length})
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {report.images.map((image, index) => (
                      <div key={image.id || `image-${index}`} className="relative group">
                        <div className="aspect-square overflow-hidden rounded-lg border border-gray-200 cursor-pointer transform transition-transform duration-200 hover:scale-105">
                          <img
                            src={getImageUrl(image)}
                            alt={image.caption || `Evidence ${index + 1}`}
                            className="w-full h-full object-cover"
                            onClick={() => handleImageClick(image, index)}
                            onError={(e) => {
                              e.target.src = "/placeholder-image.jpg";
                            }}
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center">
                            <svg
                              className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m0 0l3-3m-3 3L7 13"
                              />
                            </svg>
                          </div>
                        </div>
                        {image.caption && (
                          <p className="text-sm text-gray-600 mt-2 text-center line-clamp-2">
                            {image.caption}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Comments Section */}
              <div
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                id="comments"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  Comments & Responses
                </h2>

                {/* Add Comment Form */}
                {isAuthenticated && (
                  <div className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
                    <form onSubmit={handleSubmitComment}>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Add{" "}
                          {user.role !== "citizen"
                            ? "Official Response"
                            : "Comment"}
                        </label>
                        <textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder={
                            user.role !== "citizen"
                              ? "Add official response..."
                              : "Share your thoughts or suggestions..."
                          }
                          rows="4"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                          required
                        />
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                          Commenting as:{" "}
                          {user.role === "citizen"
                            ? "Citizen"
                            : "County Official"}
                        </div>
                        <button
                          type="submit"
                          disabled={submittingComment || !newComment.trim()}
                          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 min-w-32 justify-center"
                        >
                          {submittingComment ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Posting...
                            </>
                          ) : user.role !== "citizen" ? (
                            "Post Response"
                          ) : (
                            "Post Comment"
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Comment Tabs */}
                <div className="mb-6">
                  <div className="flex border-b border-gray-200">
                    <button
                      onClick={() => setActiveCommentTab("all")}
                      className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                        activeCommentTab === "all"
                          ? "border-green-600 text-green-600"
                          : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      All Comments
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          activeCommentTab === "all"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {comments.length}
                      </span>
                    </button>
                    <button
                      onClick={() => setActiveCommentTab("official")}
                      className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                        activeCommentTab === "official"
                          ? "border-blue-600 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      Official Responses
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          activeCommentTab === "official"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {officialComments.length}
                      </span>
                    </button>
                    <button
                      onClick={() => setActiveCommentTab("citizen")}
                      className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                        activeCommentTab === "citizen"
                          ? "border-gray-600 text-gray-600"
                          : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      Citizen Comments
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          activeCommentTab === "citizen"
                            ? "bg-gray-100 text-gray-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {citizenComments.length}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Comments List */}
                {loadingComments ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                    <span className="ml-3 text-gray-600">
                      Loading comments...
                    </span>
                  </div>
                ) : (
                  <>
                    {activeCommentTab === "all" && renderComments(comments)}
                    {activeCommentTab === "official" &&
                      renderComments(officialComments)}
                    {activeCommentTab === "citizen" &&
                      renderComments(citizenComments)}
                  </>
                )}

                {!isAuthenticated && (
                  <div className="text-center py-8">
                    <div className="bg-gray-50 rounded-xl p-6 max-w-md mx-auto">
                      <svg
                        className="w-12 h-12 text-gray-400 mx-auto mb-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Join the Conversation
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Please log in to comment on this report.
                      </p>
                      <button
                        onClick={() =>
                          navigate("/login", {
                            state: { from: `/reports/${id}` },
                          })
                        }
                        className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                      >
                        Log In to Comment
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Location Details */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Location Details
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">
                      County
                    </span>
                    <span className="font-semibold text-gray-900">
                      {getCountyName()}
                    </span>
                  </div>
                  {getSubcountyName() && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">
                        Sub-County
                      </span>
                      <span className="font-semibold text-gray-900">
                        {getSubcountyName()}
                      </span>
                    </div>
                  )}
                  {getWardName() && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">
                        Ward
                      </span>
                      <span className="font-semibold text-gray-900">
                        {getWardName()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Department Assignment */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  Responsible Department
                </h2>
                <div
                  className={`border-2 rounded-xl p-4 text-center ${getDepartmentColor(
                    getDepartmentName()
                  )}`}
                >
                  <p className="font-semibold text-lg mb-2">
                    {getDepartmentName()}
                  </p>
                  {getDepartmentName() !== "Not assigned" && (
                    <p className="text-sm opacity-75">
                      This department is responsible for addressing the reported
                      issue
                    </p>
                  )}
                </div>
              </div>

              {/* Status Update (for officials) */}
              {canUpdateStatus && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Update Status
                  </h2>
                  <div className="space-y-4">
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="submitted">Submitted</option>
                      <option value="verified">Verified</option>
                      <option value="pending">Pending Review</option>
                      <option value="noted">Noted</option>
                      <option value="on_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                    <button
                      onClick={handleStatusUpdate}
                      disabled={
                        updatingStatus || selectedStatus === report.status
                      }
                      className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                      {updatingStatus ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Updating...
                        </>
                      ) : (
                        "Update Status"
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Report Metadata - FIXED: Safe substring access */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Report Information
                </h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Report ID:</span>
                    <span className="font-mono text-gray-900 text-xs bg-gray-100 px-2 py-1 rounded">
                      {report?.id ? `${report.id.substring(0, 8)}...` : 'Loading...'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Created:</span>
                    <span className="text-gray-900">
                      {formatDateTime(report.created_at)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Last Updated:</span>
                    <span className="text-gray-900">
                      {formatDateTime(report.updated_at)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Images Provided:</span>
                    <span className="text-gray-900 font-semibold">
                      {report.images?.length || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modals */}
        <ConfirmationModal
          isOpen={deleteModal.isOpen}
          onClose={() =>
            setDeleteModal({
              isOpen: false,
              commentId: null,
              commentContent: "",
            })
          }
          onConfirm={handleDeleteConfirm}
          title="Delete Comment"
          message={`Are you sure you want to delete this comment? This action cannot be undone.`}
          confirmText="Delete Comment"
          cancelText="Keep Comment"
          type="error"
        />

        <EditCommentModal
          isOpen={editModal.isOpen}
          onClose={() => setEditModal({ isOpen: false, comment: null })}
          onSave={handleEditSave}
          comment={editModal.comment}
        />

        {/* Image Modal */}
        {imageModal.isOpen && imageModal.image && (
          <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50">
            <div className="relative max-w-4xl max-h-full w-full">
              <button
                onClick={() =>
                  setImageModal({ isOpen: false, image: null, index: 0 })
                }
                className="absolute top-4 right-4 text-white hover:text-gray-300 z-10 bg-black bg-opacity-50 rounded-full p-2"
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

              {report.images.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10 bg-black bg-opacity-50 rounded-full p-2"
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
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10 bg-black bg-opacity-50 rounded-full p-2"
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
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </>
              )}

              <div className="flex flex-col items-center">
                <img
                  src={getImageUrl(imageModal.image)}
                  alt={
                    imageModal.image.caption ||
                    `Evidence ${imageModal.index + 1}`
                  }
                  className="max-w-full max-h-[80vh] object-contain rounded-lg"
                  onError={(e) => {
                    e.target.src = "/placeholder-image.jpg";
                  }}
                />
                {imageModal.image.caption && (
                  <p className="text-white text-center mt-4 text-lg max-w-2xl">
                    {imageModal.image.caption}
                  </p>
                )}
                {report.images.length > 1 && (
                  <p className="text-white text-center mt-2 text-sm">
                    {imageModal.index + 1} of {report.images.length}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ReportDetail;