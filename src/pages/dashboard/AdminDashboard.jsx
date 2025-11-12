// src/pages/dashboard/AdminDashboard.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../../context/NotificationContext";
import Header from "../../components/common/Header";
import Footer from "../../components/common/Footer";
import reportService from "../../services/api/reportService";
import userService from "../../services/api/userService";
import locationService from "../../services/api/locationService";
import departmentService from "../../services/api/departmentService";
import commentService from "../../services/api/commentService";
import dashboardService from "../../services/api/dashboardService";

const ADMIN_TABS = {
  DASHBOARD: "dashboard",
  REPORTS: "reports",
  USERS: "users",
  DEPARTMENTS: "departments",
  COUNTIES: "counties",
  COMMENTS: "comments",
  ANALYTICS: "analytics",
  SYSTEM: "system",
};

const STATUS_CONFIG = {
  submitted: {
    label: "Submitted",
    color: "bg-blue-100 text-blue-800 border-blue-200",
  },
  verified: {
    label: "Verified",
    color: "bg-green-100 text-green-800 border-green-200",
  },
  pending: {
    label: "Pending Review",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  noted: {
    label: "Noted",
    color: "bg-purple-100 text-purple-800 border-purple-200",
  },
  on_progress: {
    label: "In Progress",
    color: "bg-orange-100 text-orange-800 border-orange-200",
  },
  resolved: {
    label: "Resolved",
    color: "bg-green-100 text-green-800 border-green-200",
  },
  rejected: {
    label: "Rejected",
    color: "bg-red-100 text-red-800 border-red-200",
  },
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(ADMIN_TABS.DASHBOARD);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [countyDepartments, setCountyDepartments] = useState([]);
  const [comments, setComments] = useState([]);
  const [counties, setCounties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    county: "",
    department: "",
    role: "",
  });

  const loadAdminData = useCallback(async () => {
    if (!user || (user.role !== "admin" && user.role !== "superadmin")) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const requests = [
        dashboardService.getProfessionalStats(),
        reportService.getReports({ limit: 100, ordering: "-created_at" }),
        userService.getUsers(),
        departmentService.getDepartments(),
        departmentService.getCountyDepartments(),
        commentService.getComments({ limit: 50, ordering: "-created_at" }),
        locationService.getCounties(),
      ];

      const responses = await Promise.all(requests);

      const [
        statsResponse,
        reportsResponse,
        usersResponse,
        departmentsResponse,
        countyDepartmentsResponse,
        commentsResponse,
        countiesResponse,
      ] = responses;

      // Handle different response formats
      setDashboardStats(statsResponse || {});

      // For reports - check if it's an object with results or data property
      const reportsData = Array.isArray(reportsResponse)
        ? reportsResponse
        : reportsResponse?.results || reportsResponse?.data || [];
      setReports(reportsData);

      // For users - same logic
      const usersData = Array.isArray(usersResponse)
        ? usersResponse
        : usersResponse?.results || usersResponse?.data || [];
      setUsers(usersData);

      // For departments
      const departmentsData = Array.isArray(departmentsResponse)
        ? departmentsResponse
        : departmentsResponse?.results || departmentsResponse?.data || [];
      setDepartments(departmentsData);

      // For county departments
      const countyDeptData = Array.isArray(countyDepartmentsResponse)
        ? countyDepartmentsResponse
        : countyDepartmentsResponse?.results ||
          countyDepartmentsResponse?.data ||
          [];
      setCountyDepartments(countyDeptData);

      // For comments
      const commentsData = Array.isArray(commentsResponse)
        ? commentsResponse
        : commentsResponse?.results || commentsResponse?.data || [];
      setComments(commentsData);

      // For counties
      const countiesData = Array.isArray(countiesResponse)
        ? countiesResponse
        : countiesResponse?.results || countiesResponse?.data || [];
      setCounties(countiesData);
    } catch (error) {
      console.error("Failed to load admin data:", error);
      showError(
        "Failed to load administration data. Please try again.",
        "Data Loading Error"
      );
    } finally {
      setLoading(false);
    }
  }, [user, showError]);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  const handleUserAction = async (userId, action, data = null) => {
    try {
      setActionLoading((prev) => ({ ...prev, [userId]: true }));

      switch (action) {
        case "activate":
          await userService.activateUser(userId);
          showSuccess("User account activated successfully", "User Management");
          break;
        case "deactivate":
          await userService.deactivateUser(userId);
          showSuccess(
            "User account deactivated successfully",
            "User Management"
          );
          break;
        case "update_role":
          await userService.updateUserRole(userId, data.role);
          showSuccess(
            `User role updated to ${data.role.replace("_", " ")}`,
            "Role Updated"
          );
          break;
        case "verify":
          await userService.verifyUser(userId);
          showSuccess(
            "User account verified successfully",
            "Verification Complete"
          );
          break;
        case "delete":
          if (
            window.confirm(
              "Are you sure you want to permanently delete this user? This action cannot be undone."
            )
          ) {
            await userService.deleteUser(userId);
            showSuccess("User account deleted successfully", "User Deleted");
          }
          break;
        default:
          console.warn("Unknown user action:", action);
      }

      await loadAdminData();
    } catch (error) {
      console.error("User action failed:", error);
      showError(
        `Failed to ${action} user: ${
          error.response?.data?.detail || error.message
        }`,
        "Action Failed"
      );
    } finally {
      setActionLoading((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const handleReportAction = async (reportId, action, data = null) => {
    try {
      setActionLoading((prev) => ({ ...prev, [reportId]: true }));

      switch (action) {
        case "delete":
          if (
            window.confirm(
              "Are you sure you want to delete this report? This will remove it from the system."
            )
          ) {
            await reportService.deleteReport(reportId);
            showSuccess("Report deleted successfully", "Report Management");
          }
          break;
        case "update_status":
          await reportService.updateReportStatus(reportId, data.status);
          showSuccess(
            `Report status updated to ${data.status}`,
            "Status Updated"
          );
          break;
        default:
          console.warn("Unknown report action:", action);
      }

      await loadAdminData();
    } catch (error) {
      console.error("Report action failed:", error);
      showError(
        `Failed to ${action} report: ${
          error.response?.data?.detail || error.message
        }`,
        "Action Failed"
      );
    } finally {
      setActionLoading((prev) => ({ ...prev, [reportId]: false }));
    }
  };

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      searchTerm === "" ||
      (report.title &&
        report.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (report.description &&
        report.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = !filters.status || report.status === filters.status;
    const matchesCounty = !filters.county || report.county === filters.county;
    const matchesDepartment =
      !filters.department || report.department === filters.department;

    return matchesSearch && matchesStatus && matchesCounty && matchesDepartment;
  });

  const filteredUsers = users.filter((userItem) => {
    const matchesSearch =
      searchTerm === "" ||
      (userItem.email &&
        userItem.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (userItem.first_name &&
        userItem.first_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (userItem.last_name &&
        userItem.last_name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRole = !filters.role || userItem.role === filters.role;

    return matchesSearch && matchesRole;
  });

  if (!user || (user.role !== "admin" && user.role !== "superadmin")) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-8 bg-white rounded-xl shadow-lg border border-red-100">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-red-600"
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
            <h2 className="text-2xl font-bold text-red-600 mb-2">
              Administrative Access Required
            </h2>
            <p className="text-gray-600 mb-6">
              This area requires administrator privileges. Please contact system
              administration if you believe this is an error.
            </p>
            <button
              onClick={() => navigate("/dashboard")}
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors shadow-md"
            >
              Return to Dashboard
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const LoadingState = () => (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
      <p className="text-gray-600">Loading administration data...</p>
      <p className="text-sm text-gray-500 mt-2">
        Preparing system management interface
      </p>
    </div>
  );

  const DashboardOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Reports</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {reports.length}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {users.length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
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
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Departments</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {departments.length}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <svg
                className="w-6 h-6 text-purple-600"
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
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Active Counties
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {counties.length}
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <svg
                className="w-6 h-6 text-orange-600"
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
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Reports by Status
          </h3>
          <div className="space-y-3">
            {Object.entries(STATUS_CONFIG).map(([status, config]) => {
              const count = reports.filter((r) => r.status === status).length;
              const percentage =
                reports.length > 0 ? (count / reports.length) * 100 : 0;

              return (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span
                      className={`px-2 py-1 text-xs rounded border ${config.color}`}
                    >
                      {config.label}
                    </span>
                    <span className="text-sm text-gray-600">{count}</span>
                  </div>
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-blue-500 transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-500 w-12 text-right">
                    {percentage.toFixed(1)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            User Distribution
          </h3>
          <div className="space-y-3">
            {[
              { role: "citizen", label: "Citizens", color: "bg-blue-500" },
              {
                role: "county_official",
                label: "County Officials",
                color: "bg-green-500",
              },
              {
                role: "admin",
                label: "Administrators",
                color: "bg-purple-500",
              },
              {
                role: "superadmin",
                label: "Super Admins",
                color: "bg-red-500",
              },
            ].map(({ role, label, color }) => {
              const count = users.filter((u) => u.role === role).length;
              const percentage =
                users.length > 0 ? (count / users.length) * 100 : 0;

              return (
                <div key={role} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-700">{label}</span>
                    <span className="text-sm text-gray-600">{count}</span>
                  </div>
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${color} transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-500 w-12 text-right">
                    {percentage.toFixed(1)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Recent System Activity
          </h3>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            View All Activity
          </button>
        </div>
        <div className="space-y-4">
          {reports.slice(0, 5).map((report) => (
            <div
              key={report.id}
              className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`w-2 h-2 rounded-full ${
                    report.status === "resolved"
                      ? "bg-green-500"
                      : report.status === "on_progress"
                      ? "bg-blue-500"
                      : "bg-yellow-500"
                  }`}
                ></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {report.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    {report.county?.name} •{" "}
                    {new Date(report.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <span
                className={`px-2 py-1 text-xs rounded ${
                  STATUS_CONFIG[report.status]?.color ||
                  "bg-gray-100 text-gray-800"
                }`}
              >
                {STATUS_CONFIG[report.status]?.label || report.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const ReportsManagement = () => (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Reports Management
            </h3>
            <p className="text-gray-600 text-sm">
              Manage and moderate all system reports
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, status: e.target.value }))
              }
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Statuses</option>
              {Object.entries(STATUS_CONFIG).map(([value, config]) => (
                <option key={value} value={value}>
                  {config.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {filteredReports.length > 0 ? (
          filteredReports.map((report) => (
            <div
              key={report.id}
              className="p-6 hover:bg-gray-50 transition-colors"
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="text-lg font-medium text-gray-900 pr-4">
                      {report.title}
                    </h4>
                    <span
                      className={`px-3 py-1 text-sm rounded-full border ${
                        STATUS_CONFIG[report.status]?.color ||
                        "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {STATUS_CONFIG[report.status]?.label || report.status}
                    </span>
                  </div>

                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {report.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <svg
                        className="w-4 h-4 mr-1"
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
                      </svg>
                      {report.county?.name || "Unknown County"}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <svg
                        className="w-4 h-4 mr-1"
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
                      {report.department?.department?.name ||
                        report.department?.name ||
                        "No Department"}
                    </div>
                    {report.verified_by_ai && (
                      <div className="flex items-center text-sm text-green-600">
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                          />
                        </svg>
                        AI Verified ({(report.ai_confidence * 100).toFixed(0)}%)
                      </div>
                    )}
                  </div>

                  <div className="flex items-center text-sm text-gray-500">
                    <svg
                      className="w-4 h-4 mr-1"
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
                    Reported by {report.reporter?.first_name}{" "}
                    {report.reporter?.last_name}
                    <span className="mx-2">•</span>
                    <svg
                      className="w-4 h-4 mr-1"
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
                    {new Date(report.created_at).toLocaleDateString("en-KE", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>

                <div className="flex flex-col gap-3 min-w-[200px]">
                  <select
                    onChange={(e) =>
                      handleReportAction(report.id, "update_status", {
                        status: e.target.value,
                      })
                    }
                    value={report.status}
                    disabled={actionLoading[report.id]}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  >
                    {Object.entries(STATUS_CONFIG).map(([value, config]) => (
                      <option key={value} value={value}>
                        {config.label}
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/reports/${report.id}`)}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleReportAction(report.id, "delete")}
                      disabled={actionLoading[report.id]}
                      className="px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 text-center">
            <svg
              className="w-16 h-16 text-gray-400 mx-auto mb-4"
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Reports Found
            </h3>
            <p className="text-gray-600 mb-4">
              No reports match your current search criteria.
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setFilters({ status: "", county: "", department: "" });
              }}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const UsersManagement = () => (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              User Management
            </h3>
            <p className="text-gray-600 text-sm">
              Manage system users and permissions
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <select
              value={filters.role}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, role: e.target.value }))
              }
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Roles</option>
              <option value="citizen">Citizen</option>
              <option value="county_official">County Official</option>
              <option value="admin">Admin</option>
              <option value="superadmin">Super Admin</option>
            </select>
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((userItem) => (
            <div
              key={userItem.id}
              className="p-6 hover:bg-gray-50 transition-colors"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {userItem.first_name?.charAt(0)}
                        {userItem.last_name?.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">
                        {userItem.first_name} {userItem.last_name}
                      </h4>
                      <p className="text-gray-600">{userItem.email}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`px-3 py-1 text-sm rounded-full ${
                        userItem.role === "superadmin"
                          ? "bg-red-100 text-red-800 border border-red-200"
                          : userItem.role === "admin"
                          ? "bg-purple-100 text-purple-800 border border-purple-200"
                          : userItem.role === "county_official"
                          ? "bg-green-100 text-green-800 border border-green-200"
                          : "bg-blue-100 text-blue-800 border border-blue-200"
                      }`}
                    >
                      {userItem.role?.replace("_", " ")}
                    </span>
                    <span
                      className={`px-3 py-1 text-sm rounded-full ${
                        userItem.is_active
                          ? "bg-green-100 text-green-800 border border-green-200"
                          : "bg-red-100 text-red-800 border border-red-200"
                      }`}
                    >
                      {userItem.is_active ? "Active" : "Inactive"}
                    </span>
                    {userItem.verified && (
                      <span className="px-3 py-1 text-sm rounded-full bg-green-100 text-green-800 border border-green-200">
                        Verified
                      </span>
                    )}
                    {userItem.county && (
                      <span className="px-3 py-1 text-sm rounded-full bg-gray-100 text-gray-800 border border-gray-200">
                        {userItem.county.name}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center text-sm text-gray-500 mt-3">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    Joined{" "}
                    {new Date(userItem.created_at).toLocaleDateString("en-KE", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                </div>

                <div className="flex flex-col gap-3 min-w-[250px]">
                  <select
                    onChange={(e) =>
                      handleUserAction(userItem.id, "update_role", {
                        role: e.target.value,
                      })
                    }
                    value={userItem.role}
                    disabled={actionLoading[userItem.id]}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  >
                    <option value="citizen">Citizen</option>
                    <option value="county_official">County Official</option>
                    <option value="admin">Administrator</option>
                    <option value="superadmin">Super Administrator</option>
                  </select>
                  <div className="grid grid-cols-2 gap-2">
                    {userItem.is_active ? (
                      <button
                        onClick={() =>
                          handleUserAction(userItem.id, "deactivate")
                        }
                        disabled={actionLoading[userItem.id]}
                        className="px-3 py-2 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 font-medium"
                      >
                        Deactivate
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          handleUserAction(userItem.id, "activate")
                        }
                        disabled={actionLoading[userItem.id]}
                        className="px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 font-medium"
                      >
                        Activate
                      </button>
                    )}
                    {!userItem.verified && (
                      <button
                        onClick={() => handleUserAction(userItem.id, "verify")}
                        disabled={actionLoading[userItem.id]}
                        className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium"
                      >
                        Verify
                      </button>
                    )}
                    <button
                      onClick={() => handleUserAction(userItem.id, "delete")}
                      disabled={actionLoading[userItem.id]}
                      className="px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 font-medium col-span-2"
                    >
                      Delete User
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 text-center">
            <svg
              className="w-16 h-16 text-gray-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Users Found
            </h3>
            <p className="text-gray-600">
              No users match your current search criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
  const DepartmentsManagement = () => {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingDepartment, setEditingDepartment] = useState(null);
    const [formData, setFormData] = useState({
      name: "",
      description: "",
      is_active: true,
    });

    const handleCreateDepartment = async () => {
      try {
        await departmentService.createDepartment(formData);
        showSuccess("Department created successfully", "Department Management");
        setShowCreateModal(false);
        setFormData({ name: "", description: "", is_active: true });
        loadAdminData();
      } catch (error) {
        showError("Failed to create department", "Creation Error");
      }
    };

    const handleEditDepartment = async () => {
      try {
        await departmentService.updateDepartment(
          editingDepartment.id,
          formData
        );
        showSuccess("Department updated successfully", "Department Management");
        setEditingDepartment(null);
        setFormData({ name: "", description: "", is_active: true });
        loadAdminData();
      } catch (error) {
        showError("Failed to update department", "Update Error");
      }
    };

    const handleDeleteDepartment = async (departmentId) => {
      if (
        window.confirm(
          "Are you sure you want to delete this department? This will affect all associated county departments."
        )
      ) {
        try {
          await departmentService.deleteDepartment(departmentId);
          showSuccess(
            "Department deleted successfully",
            "Department Management"
          );
          loadAdminData();
        } catch (error) {
          showError("Failed to delete department", "Deletion Error");
        }
      }
    };

    const handleToggleActive = async (department) => {
      try {
        await departmentService.updateDepartment(department.id, {
          is_active: !department.is_active,
        });
        showSuccess(
          `Department ${!department.is_active ? "activated" : "deactivated"}`,
          "Status Updated"
        );
        loadAdminData();
      } catch (error) {
        showError("Failed to update department status", "Update Error");
      }
    };

    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Departments Management
              </h3>
              <p className="text-gray-600 text-sm">
                Manage system departments and county departments
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Search departments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Add Department
              </button>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {departments.length > 0 ? (
            departments.map((dept) => (
              <div
                key={dept.id}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
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
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                          />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="text-lg font-medium text-gray-900">
                            {dept.name}
                          </h4>
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              dept.is_active
                                ? "bg-green-100 text-green-800 border border-green-200"
                                : "bg-red-100 text-red-800 border border-red-200"
                            }`}
                          >
                            {dept.is_active ? "Active" : "Inactive"}
                          </span>
                        </div>
                        <p className="text-gray-600">
                          {dept.description || "No description available"}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {dept.created_at && (
                        <span className="px-3 py-1 text-sm rounded-full bg-gray-100 text-gray-800 border border-gray-200">
                          Created{" "}
                          {new Date(dept.created_at).toLocaleDateString()}
                        </span>
                      )}
                      {dept.updated_at && (
                        <span className="px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                          Updated{" "}
                          {new Date(dept.updated_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => {
                        setEditingDepartment(dept);
                        setFormData({
                          name: dept.name,
                          description: dept.description || "",
                          is_active: dept.is_active,
                        });
                      }}
                      className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggleActive(dept)}
                      className={`px-4 py-2 text-sm rounded-lg transition-colors font-medium ${
                        dept.is_active
                          ? "bg-yellow-600 text-white hover:bg-yellow-700"
                          : "bg-green-600 text-white hover:bg-green-700"
                      }`}
                    >
                      {dept.is_active ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      onClick={() => handleDeleteDepartment(dept.id)}
                      className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <svg
                className="w-16 h-16 text-gray-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Departments Found
              </h3>
              <p className="text-gray-600 mb-4">
                No departments available in the system.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Create First Department
              </button>
            </div>
          )}
        </div>

        {/* Create/Edit Modal */}
        {(showCreateModal || editingDepartment) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {editingDepartment
                  ? "Edit Department"
                  : "Create New Department"}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter department name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter department description"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        is_active: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    Active Department
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingDepartment(null);
                    setFormData({ name: "", description: "", is_active: true });
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={
                    editingDepartment
                      ? handleEditDepartment
                      : handleCreateDepartment
                  }
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingDepartment
                    ? "Update Department"
                    : "Create Department"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const CountiesManagement = () => {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingCounty, setEditingCounty] = useState(null);
    const [selectedCounty, setSelectedCounty] = useState(null);
    const [subcounties, setSubcounties] = useState([]);
    const [wards, setWards] = useState([]);
    const [formData, setFormData] = useState({
      name: "",
      code: "",
      is_active: true,
    });

    const handleCreateCounty = async () => {
      try {
        await locationService.createCounty(formData);
        showSuccess("County created successfully", "County Management");
        setShowCreateModal(false);
        setFormData({ name: "", code: "", is_active: true });
        loadAdminData();
      } catch (error) {
        showError("Failed to create county", "Creation Error");
      }
    };

    const handleEditCounty = async () => {
      try {
        await locationService.updateCounty(editingCounty.id, formData);
        showSuccess("County updated successfully", "County Management");
        setEditingCounty(null);
        setFormData({ name: "", code: "", is_active: true });
        loadAdminData();
      } catch (error) {
        showError("Failed to update county", "Update Error");
      }
    };

    const handleDeleteCounty = async (countyId) => {
      if (
        window.confirm(
          "Are you sure you want to delete this county? This will remove all associated sub-counties and wards."
        )
      ) {
        try {
          await locationService.deleteCounty(countyId);
          showSuccess("County deleted successfully", "County Management");
          loadAdminData();
        } catch (error) {
          showError("Failed to delete county", "Deletion Error");
        }
      }
    };

    const handleToggleActive = async (county) => {
      try {
        await locationService.updateCounty(county.id, {
          is_active: !county.is_active,
        });
        showSuccess(
          `County ${!county.is_active ? "activated" : "deactivated"}`,
          "Status Updated"
        );
        loadAdminData();
      } catch (error) {
        showError("Failed to update county status", "Update Error");
      }
    };

    const handleViewLocationDetails = async (county) => {
      setSelectedCounty(county);
      try {
        // Load subcounties for this county
        const subcountiesData = await locationService.getSubcounties(county.id);
        setSubcounties(subcountiesData || []);
        setWards([]);
      } catch (error) {
        console.error("Error loading subcounties:", error);
        setSubcounties([]);
      }
    };

    const handleLoadWards = async (subcountyId) => {
      try {
        const wardsData = await locationService.getWards(subcountyId);
        setWards(wardsData || []);
      } catch (error) {
        console.error("Error loading wards:", error);
        setWards([]);
      }
    };

    const filteredCounties = counties.filter(
      (county) =>
        county.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        county.code?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Counties Management
              </h3>
              <p className="text-gray-600 text-sm">
                Manage counties and geographical hierarchy
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Search counties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Add County
              </button>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredCounties.length > 0 ? (
            filteredCounties.map((county) => (
              <div
                key={county.id}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
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
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="text-lg font-medium text-gray-900">
                            {county.name}
                          </h4>
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              county.is_active
                                ? "bg-green-100 text-green-800 border border-green-200"
                                : "bg-red-100 text-red-800 border border-red-200"
                            }`}
                          >
                            {county.is_active ? "Active" : "Inactive"}
                          </span>
                        </div>
                        <p className="text-gray-600">
                          County Code: {county.code || "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {county.created_at && (
                        <span className="px-3 py-1 text-sm rounded-full bg-gray-100 text-gray-800 border border-gray-200">
                          Created{" "}
                          {new Date(county.created_at).toLocaleDateString()}
                        </span>
                      )}
                      {county.total_reports > 0 && (
                        <span className="px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                          {county.total_reports} Reports
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => handleViewLocationDetails(county)}
                      className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => {
                        setEditingCounty(county);
                        setFormData({
                          name: county.name,
                          code: county.code || "",
                          is_active: county.is_active,
                        });
                      }}
                      className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggleActive(county)}
                      className={`px-4 py-2 text-sm rounded-lg transition-colors font-medium ${
                        county.is_active
                          ? "bg-yellow-600 text-white hover:bg-yellow-700"
                          : "bg-green-600 text-white hover:bg-green-700"
                      }`}
                    >
                      {county.is_active ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      onClick={() => handleDeleteCounty(county.id)}
                      className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <svg
                className="w-16 h-16 text-gray-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Counties Found
              </h3>
              <p className="text-gray-600 mb-4">
                No counties available in the system.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Create First County
              </button>
            </div>
          )}
        </div>

        {/* Location Details Modal */}
        {selectedCounty && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Location Details: {selectedCounty.name}
                </h3>
                <button
                  onClick={() => setSelectedCounty(null)}
                  className="text-gray-400 hover:text-gray-600"
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

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Subcounties Section */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    Sub-Counties
                  </h4>
                  {subcounties.length > 0 ? (
                    <div className="space-y-3">
                      {subcounties.map((subcounty) => (
                        <div
                          key={subcounty.id}
                          className="bg-white rounded-lg p-3 border border-gray-200"
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <h5 className="font-medium text-gray-900">
                                {subcounty.name}
                              </h5>
                              <p className="text-sm text-gray-600">
                                Code: {subcounty.code || "N/A"}
                              </p>
                            </div>
                            <button
                              onClick={() => handleLoadWards(subcounty.id)}
                              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                            >
                              View Wards
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">
                      No sub-counties found
                    </p>
                  )}
                </div>

                {/* Wards Section */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    Wards
                  </h4>
                  {wards.length > 0 ? (
                    <div className="space-y-3">
                      {wards.map((ward) => (
                        <div
                          key={ward.id}
                          className="bg-white rounded-lg p-3 border border-gray-200"
                        >
                          <h5 className="font-medium text-gray-900">
                            {ward.name}
                          </h5>
                          <p className="text-sm text-gray-600">
                            Code: {ward.code || "N/A"}
                          </p>
                          {ward.latitude && ward.longitude && (
                            <p className="text-sm text-gray-600">
                              Coordinates: {ward.latitude}, {ward.longitude}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">
                      {subcounties.length > 0
                        ? "Select a sub-county to view wards"
                        : "No wards to display"}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setSelectedCounty(null)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create/Edit Modal */}
        {(showCreateModal || editingCounty) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {editingCounty ? "Edit County" : "Create New County"}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    County Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter county name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    County Code
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, code: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter county code"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        is_active: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    Active County
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingCounty(null);
                    setFormData({ name: "", code: "", is_active: true });
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={
                    editingCounty ? handleEditCounty : handleCreateCounty
                  }
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingCounty ? "Update County" : "Create County"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const CommentsManagement = () => {
    const [selectedComment, setSelectedComment] = useState(null);

    const handleDeleteComment = async (commentId) => {
      if (
        window.confirm(
          "Are you sure you want to delete this comment? This action cannot be undone."
        )
      ) {
        try {
          await commentService.deleteComment(commentId);
          showSuccess("Comment deleted successfully", "Comment Management");
          loadAdminData();
        } catch (error) {
          showError("Failed to delete comment", "Deletion Error");
        }
      }
    };

    const handleViewReport = (comment) => {
      if (comment.report) {
        navigate(`/reports/${comment.report.id}`);
      }
    };

    const filteredComments = comments.filter(
      (comment) =>
        comment.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comment.user?.first_name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        comment.user?.last_name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase())
    );

    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Comments Management
              </h3>
              <p className="text-gray-600 text-sm">
                Manage and moderate user comments
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Search comments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredComments.length > 0 ? (
            filteredComments.map((comment) => (
              <div
                key={comment.id}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start space-x-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-semibold text-xs">
                          {comment.user?.first_name?.charAt(0)}
                          {comment.user?.last_name?.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="text-sm font-medium text-gray-900">
                            {comment.user?.first_name} {comment.user?.last_name}
                          </h4>
                          <span
                            className={`px-2 py-1 text-xs rounded ${
                              comment.comment_type === "official"
                                ? "bg-blue-100 text-blue-800 border border-blue-200"
                                : "bg-gray-100 text-gray-800 border border-gray-200"
                            }`}
                          >
                            {comment.comment_type === "official"
                              ? "Official"
                              : "Citizen"}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(comment.created_at).toLocaleDateString(
                              "en-KE",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </span>
                        </div>
                        <p className="text-gray-700 mb-3">{comment.content}</p>

                        {comment.report && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-blue-900">
                                  Related Report: {comment.report.title}
                                </p>
                                <p className="text-xs text-blue-700">
                                  Status:{" "}
                                  {STATUS_CONFIG[comment.report.status]
                                    ?.label || comment.report.status}
                                </p>
                              </div>
                              <button
                                onClick={() => handleViewReport(comment)}
                                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                              >
                                View Report
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedComment(comment)}
                      className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Details
                    </button>
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <svg
                className="w-16 h-16 text-gray-400 mx-auto mb-4"
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
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Comments Found
              </h3>
              <p className="text-gray-600">
                No comments available in the system.
              </p>
            </div>
          )}
        </div>

        {/* Comment Details Modal */}
        {selectedComment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Comment Details
                </h3>
                <button
                  onClick={() => setSelectedComment(null)}
                  className="text-gray-400 hover:text-gray-600"
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

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Commenter
                    </label>
                    <p className="text-gray-900">
                      {selectedComment.user?.first_name}{" "}
                      {selectedComment.user?.last_name}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Comment Type
                    </label>
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        selectedComment.comment_type === "official"
                          ? "bg-blue-100 text-blue-800 border border-blue-200"
                          : "bg-gray-100 text-gray-800 border border-gray-200"
                      }`}
                    >
                      {selectedComment.comment_type === "official"
                        ? "Official"
                        : "Citizen"}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Created Date
                    </label>
                    <p className="text-gray-900">
                      {new Date(selectedComment.created_at).toLocaleDateString(
                        "en-KE",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Updated
                    </label>
                    <p className="text-gray-900">
                      {new Date(selectedComment.updated_at).toLocaleDateString(
                        "en-KE",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Comment Content
                  </label>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-gray-900 whitespace-pre-wrap">
                      {selectedComment.content}
                    </p>
                  </div>
                </div>

                {selectedComment.report && (
                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">
                      Associated Report
                    </h4>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-blue-700 mb-1">
                            Report Title
                          </label>
                          <p className="text-blue-900 font-medium">
                            {selectedComment.report.title}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-blue-700 mb-1">
                            Status
                          </label>
                          <span
                            className={`px-2 py-1 text-xs rounded ${
                              STATUS_CONFIG[selectedComment.report.status]
                                ?.class || "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {STATUS_CONFIG[selectedComment.report.status]
                              ?.label || selectedComment.report.status}
                          </span>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-blue-700 mb-1">
                            Category
                          </label>
                          <p className="text-blue-900">
                            {selectedComment.report.category?.name || "N/A"}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-blue-700 mb-1">
                            Location
                          </label>
                          <p className="text-blue-900">
                            {selectedComment.report.location || "N/A"}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 flex justify-end">
                        <button
                          onClick={() => handleViewReport(selectedComment)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                          View Full Report
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {!selectedComment.report && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <svg
                        className="w-5 h-5 text-yellow-600 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                        />
                      </svg>
                      <p className="text-yellow-800">
                        This comment is not associated with any report.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => handleDeleteComment(selectedComment.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Delete Comment
                </button>
                <button
                  onClick={() => setSelectedComment(null)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const AnalyticsManagement = () => (
    <div className="bg-white rounded-xl border border-gray-200 p-8">
      <div className="text-center">
        <svg
          className="w-16 h-16 text-gray-400 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Advanced Analytics
        </h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Comprehensive analytics and reporting dashboard. Track system
          performance, user engagement, and report statistics.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-2">
              {reports.length}
            </div>
            <div className="text-blue-700 font-medium">Total Reports</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <div className="text-2xl font-bold text-green-600 mb-2">
              {users.length}
            </div>
            <div className="text-green-700 font-medium">Total Users</div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 text-center">
            <div className="text-2xl font-bold text-purple-600 mb-2">
              {comments.length}
            </div>
            <div className="text-purple-700 font-medium">Total Comments</div>
          </div>
        </div>
        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
          Generate Detailed Report
        </button>
      </div>
    </div>
  );

  const SystemManagement = () => (
    <div className="bg-white rounded-xl border border-gray-200 p-8">
      <div className="text-center">
        <svg
          className="w-16 h-16 text-gray-400 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          System Configuration
        </h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          System settings and configuration management. Configure application
          settings, permissions, and system parameters.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <button className="bg-gray-100 border border-gray-300 rounded-lg p-4 text-left hover:bg-gray-200 transition-colors">
            <div className="font-medium text-gray-900 mb-1">
              Application Settings
            </div>
            <div className="text-sm text-gray-600">
              Configure general application settings
            </div>
          </button>
          <button className="bg-gray-100 border border-gray-300 rounded-lg p-4 text-left hover:bg-gray-200 transition-colors">
            <div className="font-medium text-gray-900 mb-1">
              User Permissions
            </div>
            <div className="text-sm text-gray-600">
              Manage user roles and permissions
            </div>
          </button>
          <button className="bg-gray-100 border border-gray-300 rounded-lg p-4 text-left hover:bg-gray-200 transition-colors">
            <div className="font-medium text-gray-900 mb-1">System Logs</div>
            <div className="text-sm text-gray-600">
              View system logs and audit trails
            </div>
          </button>
          <button className="bg-gray-100 border border-gray-300 rounded-lg p-4 text-left hover:bg-gray-200 transition-colors">
            <div className="font-medium text-gray-900 mb-1">
              Backup & Restore
            </div>
            <div className="text-sm text-gray-600">
              Manage system backups and data restoration
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    System Administration
                  </h1>
                  <p className="text-gray-600 mt-2">
                    Welcome, {user.first_name} {user.last_name} •{" "}
                    {user.role.replace("_", " ").toUpperCase()}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Complete system management and oversight
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={loadAdminData}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center space-x-2"
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
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  <span>Refresh Data</span>
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-8 shadow-sm">
            <div className="flex flex-wrap gap-2">
              {[
                { key: ADMIN_TABS.DASHBOARD, label: "Dashboard" },
                { key: ADMIN_TABS.REPORTS, label: "Reports" },
                { key: ADMIN_TABS.USERS, label: "Users" },
                { key: ADMIN_TABS.DEPARTMENTS, label: "Departments" },
                { key: ADMIN_TABS.COUNTIES, label: "Counties" },
                { key: ADMIN_TABS.COMMENTS, label: "Comments" },
                { key: ADMIN_TABS.ANALYTICS, label: "Analytics" },
                { key: ADMIN_TABS.SYSTEM, label: "System" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                    activeTab === tab.key
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <LoadingState />
          ) : (
            <div className="space-y-8">
              {activeTab === ADMIN_TABS.DASHBOARD && <DashboardOverview />}
              {activeTab === ADMIN_TABS.REPORTS && <ReportsManagement />}
              {activeTab === ADMIN_TABS.USERS && <UsersManagement />}
              {activeTab === ADMIN_TABS.DEPARTMENTS && (
                <DepartmentsManagement />
              )}
              {activeTab === ADMIN_TABS.COUNTIES && <CountiesManagement />}
              {activeTab === ADMIN_TABS.COMMENTS && <CommentsManagement />}
              {activeTab === ADMIN_TABS.ANALYTICS && <AnalyticsManagement />}
              {activeTab === ADMIN_TABS.SYSTEM && <SystemManagement />}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdminDashboard;
