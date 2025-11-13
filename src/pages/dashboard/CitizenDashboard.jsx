// src/pages/dashboard/CitizenDashboard.jsx - UPDATED
import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import ReportCard from "../../components/reports/ReportCard";
import CommentSection from "../../components/comments/CommentSection";
import locationService from "../../services/api/locationService";
import reportService from "../../services/api/reportService";
import Header from "../../components/common/Header";
import Footer from "../../components/common/Footer";

const CitizenDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [reports, setReports] = useState([]);
  const [counties, setCounties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [stats, setStats] = useState({
    total_reports: 0,
    user_reports_count: 0,
    user_resolved_reports: 0,
    resolved_reports: 0,
    in_progress_reports: 0
  });
  const [filters, setFilters] = useState({
    county: "",
    department: "",
    status: "",
    search: "",
  });

  useEffect(() => {
    loadDashboardData();
    loadLocationData();
    loadStats();
  }, [filters, activeTab]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      let reportsData;
      
      if (activeTab === "my-reports") {
        // Use my_reports endpoint for user's own reports
        reportsData = await reportService.getMyReports(filters);
      } else {
        // Use regular endpoint for all reports with filters
        reportsData = await reportService.getReports(filters);
      }
      
      setReports(
        Array.isArray(reportsData) ? reportsData : reportsData.results || []
      );
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await reportService.getStats();
      setStats(statsData);
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };

  const loadLocationData = async () => {
    try {
      const [countiesData, departmentsData] = await Promise.all([
        locationService.getCounties(),
        locationService.getDepartments(),
      ]);
      setCounties(countiesData);
      setDepartments(departmentsData);
    } catch (error) {
      console.error("Failed to load location data:", error);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleCreateReport = () => {
    navigate("/reports/create");
  };

  const handleViewMyReports = () => {
    navigate("/my-reports");
  };

  const handleViewAllReports = () => {
    navigate("/browse-reports");
  };

  const handleContactSupport = () => {
    navigate("/contact-support");
  };

  const handleViewFAQ = () => {
    navigate("/faq");
  };

  const handleReportClick = (reportId) => {
    navigate(`/reports/${reportId}`);
  };

  const handleRecentActivityClick = (reportId) => {
    navigate(`/reports/${reportId}`);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const clearFilters = () => {
    setFilters({
      county: "",
      department: "",
      status: "",
      search: "",
    });
  };

  const handleLikeReport = async (reportId) => {
    try {
      await reportService.likeReport(reportId);
      // Reload the reports to update like counts
      loadDashboardData();
    } catch (error) {
      console.error("Failed to like report:", error);
    }
  };

  const handleUnlikeReport = async (reportId) => {
    try {
      await reportService.unlikeReport(reportId);
      // Reload the reports to update like counts
      loadDashboardData();
    } catch (error) {
      console.error("Failed to unlike report:", error);
    }
  };

  const filteredReports = reports.filter((report) => {
    if (activeTab === "resolved") {
      return report.status === "resolved";
    }
    if (activeTab === "in-progress") {
      return report.status === "in_progress";
    }
    return true;
  });

  // Get recent activity reports (last 3 reports)
  const recentActivity = reports
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex flex-col">
      <Header />

      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-8 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-xl">
                      {user?.first_name?.charAt(0) ||
                        user?.email?.charAt(0) ||
                        "U"}
                    </span>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">
                      Welcome back, {user?.first_name}!
                    </h1>
                    <p className="text-gray-600 text-lg">
                      Stay informed about community issues and government
                      responses in your area.
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 mt-6 lg:mt-0 lg:justify-end">
                <button
                  onClick={handleCreateReport}
                  className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Report New Issue
                </button>
                <button
                  onClick={handleViewMyReports}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  My Reports
                </button>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-6 text-center hover:shadow-xl transition-shadow duration-200">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {stats.total_reports}
              </div>
              <div className="text-gray-700 font-semibold">Total Reports</div>
              <div className="text-sm text-gray-500 mt-1">Community Issues</div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6 text-center hover:shadow-xl transition-shadow duration-200">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {stats.resolved_reports}
              </div>
              <div className="text-gray-700 font-semibold">Resolved</div>
              <div className="text-sm text-gray-500 mt-1">Issues Fixed</div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg border border-orange-100 p-6 text-center hover:shadow-xl transition-shadow duration-200">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {stats.in_progress_reports}
              </div>
              <div className="text-gray-700 font-semibold">In Progress</div>
              <div className="text-sm text-gray-500 mt-1">Being Addressed</div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg border border-purple-100 p-6 text-center hover:shadow-xl transition-shadow duration-200">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {stats.user_reports_count}
              </div>
              <div className="text-gray-700 font-semibold">My Reports</div>
              <div className="text-sm text-gray-500 mt-1">Submitted by You</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Create Report Card */}
              <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-6 mb-6 hover:shadow-xl transition-all duration-200">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-md">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <button
                      onClick={handleCreateReport}
                      className="w-full text-left p-4 border-2 border-dashed border-green-300 rounded-xl hover:border-green-500 hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
                    >
                      <span className="text-green-600 font-semibold text-lg">
                        Share what's happening in your community...
                      </span>
                    </button>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-4 space-y-3 sm:space-y-0">
                      <span className="text-sm text-gray-600">
                        Report issues, suggest improvements, or share community
                        observations
                      </span>
                      <button
                        onClick={handleCreateReport}
                        className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-2 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-md hover:shadow-lg"
                      >
                        Create Report
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Tabs */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 mb-6">
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: "all", label: "All Reports", count: reports.length },
                    {
                      key: "my-reports",
                      label: "My Reports",
                      count: stats.user_reports_count,
                    },
                    {
                      key: "resolved",
                      label: "Resolved",
                      count: stats.resolved_reports,
                    },
                    {
                      key: "in-progress",
                      label: "In Progress",
                      count: stats.in_progress_reports,
                    },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`flex items-center space-x-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                        activeTab === tab.key
                          ? "bg-green-600 text-white shadow-lg"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          activeTab === tab.key
                            ? "bg-green-500 text-white"
                            : "bg-gray-300 text-gray-700"
                        }`}
                      >
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Filters */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Filter Reports
                  </h3>
                  <button
                    onClick={clearFilters}
                    className="text-sm text-green-600 hover:text-green-700 font-medium"
                  >
                    Clear Filters
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <select
                    value={filters.county}
                    onChange={(e) =>
                      handleFilterChange({ ...filters, county: e.target.value })
                    }
                    className="border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">All Counties</option>
                    {counties.map((county) => (
                      <option key={county.id} value={county.id}>
                        {county.name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={filters.department}
                    onChange={(e) =>
                      handleFilterChange({
                        ...filters,
                        department: e.target.value,
                      })
                    }
                    className="border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">All Departments</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={filters.status}
                    onChange={(e) =>
                      handleFilterChange({ ...filters, status: e.target.value })
                    }
                    className="border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">All Status</option>
                    <option value="submitted">Submitted</option>
                    <option value="verified">Verified</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>

                  <input
                    type="text"
                    placeholder="Search reports..."
                    value={filters.search}
                    onChange={(e) =>
                      handleFilterChange({ ...filters, search: e.target.value })
                    }
                    className="border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Reports Feed */}
              {loading ? (
                <div className="space-y-6">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 animate-pulse"
                    >
                      <div className="flex space-x-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                        <div className="flex-1 space-y-3">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                          <div className="flex space-x-4 pt-3">
                            <div className="h-8 bg-gray-200 rounded w-20"></div>
                            <div className="h-8 bg-gray-200 rounded w-20"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredReports.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
                      <div className="text-gray-400 mb-6">
                        <svg
                          className="w-24 h-24 mx-auto"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">
                        No Reports Found
                      </h3>
                      <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
                        {activeTab === "my-reports"
                          ? "You haven't submitted any reports yet. Be the first to make a difference in your community!"
                          : "No reports match your current filters. Try adjusting your search criteria."}
                      </p>
                      {activeTab === "my-reports" && (
                        <button
                          onClick={handleCreateReport}
                          className="bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl"
                        >
                          Create Your First Report
                        </button>
                      )}
                    </div>
                  ) : (
                    filteredReports.map((report) => (
                      <div
                        key={report.id}
                        className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-200"
                      >
                        <ReportCard
                          report={report}
                          onCommentClick={() =>
                            setSelectedReport(
                              selectedReport?.id === report.id ? null : report
                            )
                          }
                          onReportClick={() => handleReportClick(report.id)}
                          onLike={handleLikeReport}
                          onUnlike={handleUnlikeReport}
                          currentUser={user}
                        />

                        {/* Expandable Comments Section */}
                        {selectedReport?.id === report.id && (
                          <div className="border-t border-gray-100 bg-gray-50">
                            <CommentSection reportId={report.id} user={user} />
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Quick Actions */}
              <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <svg
                    className="w-5 h-5 text-green-600 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={handleCreateReport}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white text-center py-3 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    Report New Issue
                  </button>
                  <button
                    onClick={handleViewMyReports}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white text-center py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    View My Reports
                  </button>
                  <button
                    onClick={handleViewAllReports}
                    className="w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white text-center py-3 rounded-xl font-semibold hover:from-gray-700 hover:to-gray-800 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    Browse All Reports
                  </button>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <svg
                    className="w-5 h-5 text-blue-600 mr-2"
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
                  Recent Activity
                </h3>
                <div className="space-y-3">
                  {recentActivity.map((report) => (
                    <div
                      key={report.id}
                      onClick={() => handleRecentActivityClick(report.id)}
                      className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200 cursor-pointer"
                    >
                      <div
                        className={`w-2 h-2 mt-2 rounded-full ${
                          report.status === "resolved"
                            ? "bg-green-500"
                            : report.status === "in_progress"
                            ? "bg-yellow-500"
                            : "bg-blue-500"
                        }`}
                      ></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 line-clamp-2">
                          {report.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {report.county?.name} •{" "}
                          {new Date(report.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {recentActivity.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No recent activity
                    </p>
                  )}
                </div>
              </div>

              {/* Help & Support */}
              <div className="bg-white rounded-2xl shadow-lg border border-purple-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <svg
                    className="w-5 h-5 text-purple-600 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Need Help?
                </h3>
                <div className="space-y-3 text-sm">
                  <button
                    onClick={() => navigate("/help/create-report")}
                    className="w-full text-left text-gray-700 hover:text-green-600 transition-colors duration-200 py-2 flex items-center"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    How to create a report
                  </button>
                  <button
                    onClick={() => navigate("/help/report-status")}
                    className="w-full text-left text-gray-700 hover:text-green-600 transition-colors duration-200 py-2 flex items-center"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
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
                    Report status explained
                  </button>
                  <button
                    onClick={handleContactSupport}
                    className="w-full text-left text-gray-700 hover:text-green-600 transition-colors duration-200 py-2 flex items-center"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    Contact support
                  </button>
                  <button
                    onClick={handleViewFAQ}
                    className="w-full text-left text-gray-700 hover:text-green-600 transition-colors duration-200 py-2 flex items-center"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    FAQ & Documentation
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CitizenDashboard;