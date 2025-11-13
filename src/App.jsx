// src/App.jsx - FIXED ROUTE STRUCTURE
import React, { Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";

// Lazy load components for better performance
const Login = lazy(() => import("./pages/auth/Login"));
const Register = lazy(() => import("./pages/auth/Register"));
const Home = lazy(() => import("./pages/home/Home"));
const CreateReport = lazy(() => import("./pages/reports/CreateReport"));
const ReportDetail = lazy(() => import("./pages/reports/ReportDetail"));
const CitizenDashboard = lazy(() => import("./pages/dashboard/CitizenDashboard"));
const OfficialDashboard = lazy(() => import("./pages/dashboard/OfficialDashboard"));
const AdminDashboard = lazy(() => import("./pages/dashboard/AdminDashboard"));
const VerifyEmail = lazy(() => import("./pages/auth/VerifyEmail"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword"));
const ResendVerification = lazy(() => import("./pages/auth/ResendVerification"));
const AppleCallback = lazy(() => import("./pages/auth/AppleCallback"));
const GoogleCallback = lazy(() => import("./pages/auth/GoogleCallback"));
const GovernmentProjects = lazy(() => import("./pages/projects/GovernmentProjects"));
const MainDashboard = lazy(() => import("./pages/dashboard/MainDashboard"));
const ReportsList = lazy(() => import("./pages/reports/ReportsList"));
const BrowseReports = lazy(() => import("./pages/reports/BrowseReports"));

// Route Configuration - Centralized for easy maintenance
const ROUTES = {
  PUBLIC: {
    HOME: "/",
    LOGIN: "/login",
    REGISTER: "/register",
    VERIFY_EMAIL: "/verify-email",
    FORGOT_PASSWORD: "/forgot-password",
    RESET_PASSWORD: "/reset-password",
    RESEND_VERIFICATION: "/resend-verification",
    APPLE_CALLBACK: "/auth/apple/callback",
    GOOGLE_CALLBACK: "/auth/google/callback",
    REPORT_DETAIL: "/reports/:id",
  },
  PROTECTED: {
    DASHBOARD: "/dashboard",
    CITIZEN_DASHBOARD: "/citizen-dashboard",
    OFFICIAL_DASHBOARD: "/official-dashboard",
    ADMIN_DASHBOARD: "/admin-dashboard",
    CREATE_REPORT: "/reports/create",
    MY_REPORTS: "/my-reports",
    MAIN_DASHBOARD: "/main-dashboard",
    BROWSE_REPORTS: "/browse-reports",
    GOVERNMENT_PROJECTS: "/government-projects",
  },
};

// Role configurations with clear naming
const ROLE_CONFIG = {
  CITIZEN: ["citizen"],
  OFFICIAL: ["county_official"],
  ADMIN: ["admin", "superadmin"],
  VIEWER: ["viewer"],
  ALL_AUTHENTICATED: ["citizen", "county_official", "admin", "superadmin", "viewer"],
  CAN_CREATE_REPORT: ["citizen", "county_official", "admin", "superadmin"],
};

// Loading Component with better UX
const AppLoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-600 border-t-transparent mx-auto mb-4"></div>
      <div className="space-y-2">
        <p className="text-lg font-semibold text-gray-900">Loading E-Mwananchi</p>
        <p className="text-sm text-gray-600">Empowering citizen voices...</p>
      </div>
    </div>
  </div>
);

// Protected Route Component with enhanced security and UX
const ProtectedRoute = ({ 
  children, 
  requiredRoles = null,
  fallbackPath = ROUTES.PUBLIC.LOGIN 
}) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <AppLoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to={fallbackPath} replace />;
  }

  if (requiredRoles && user && !requiredRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-8 bg-white rounded-2xl shadow-lg border border-red-200">
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
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-red-600 mb-3">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            You don't have the required permissions to access this page. 
            Your current role is <span className="font-semibold">{user.role}</span>.
          </p>
          <div className="flex space-x-3 justify-center">
            <button
              onClick={() => window.history.back()}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-700 transition-all duration-200"
            >
              Go Back
            </button>
            <button
              onClick={() => window.location.href = ROUTES.PUBLIC.HOME}
              className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-all duration-200"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

// Public Route Component - Only accessible when not authenticated
const PublicRoute = ({ children, fallbackPath = ROUTES.PROTECTED.DASHBOARD }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <AppLoadingSpinner />;
  }

  if (isAuthenticated) {
    return <Navigate to={fallbackPath} replace />;
  }

  return children;
};

// Mixed Route - Accessible regardless of authentication status
const MixedRoute = ({ children }) => {
  const { loading } = useAuth();

  if (loading) {
    return <AppLoadingSpinner />;
  }

  return children;
};

// Dashboard Router - Smart routing based on user role
const DashboardRouter = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to={ROUTES.PUBLIC.LOGIN} replace />;
  }

  const getDashboardRoute = () => {
    switch (user.role) {
      case "citizen":
        return ROUTES.PROTECTED.CITIZEN_DASHBOARD;
      case "county_official":
        return ROUTES.PROTECTED.OFFICIAL_DASHBOARD;
      case "admin":
      case "superadmin":
        return ROUTES.PROTECTED.ADMIN_DASHBOARD;
      case "viewer":
        return ROUTES.PROTECTED.MAIN_DASHBOARD;
      default:
        return ROUTES.PROTECTED.MAIN_DASHBOARD;
    }
  };

  return <Navigate to={getDashboardRoute()} replace />;
};

// Main Dashboard Router - Unified dashboard experience
const MainDashboardRouter = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to={ROUTES.PUBLIC.LOGIN} replace />;
  }

  return <MainDashboard />;
};

// 404 Not Found Component with better UX
const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
    <div className="text-center max-w-md mx-auto p-8 bg-white rounded-2xl shadow-lg border border-gray-200">
      <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg
          className="w-10 h-10 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-3">Page Not Found</h1>
      <p className="text-gray-600 mb-6 text-lg">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="flex space-x-3 justify-center">
        <button
          onClick={() => window.history.back()}
          className="bg-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition-all duration-200"
        >
          Go Back
        </button>
        <button
          onClick={() => window.location.href = ROUTES.PUBLIC.HOME}
          className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-all duration-200"
        >
          Go to Homepage
        </button>
      </div>
    </div>
  </div>
);

// FIXED: Error Boundary Component with proper error handling
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error) {
    return { 
      hasError: true,
      error: error 
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Application Error:", error);
    console.error("Error Info:", errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50">
          <div className="text-center max-w-md mx-auto p-8 bg-white rounded-2xl shadow-lg border border-red-200">
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
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-red-800 mb-3">
              Something Went Wrong
            </h2>
            <p className="text-red-600 mb-6 text-lg">
              We apologize for the inconvenience. Please try refreshing the page.
            </p>
            <div className="flex space-x-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-all duration-200"
              >
                Refresh Page
              </button>
              <button
                onClick={() => window.location.href = ROUTES.PUBLIC.HOME}
                className="bg-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition-all duration-200"
              >
                Go to Home
              </button>
            </div>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left text-sm text-gray-500">
                <summary className="cursor-pointer mb-2">Error Details (Development)</summary>
                <pre className="bg-gray-100 p-3 rounded-lg overflow-auto text-xs">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Main App Component with INLINE ROUTES (Fixed version)
function App() {
  return (
    <ErrorBoundary>
      <Router>
        <NotificationProvider>
          <AuthProvider>
            <div className="App min-h-screen bg-gray-50">
              <Suspense fallback={<AppLoadingSpinner />}>
                <Routes>
                  {/* Public Routes - Only accessible when not authenticated */}
                  <Route
                    path={ROUTES.PUBLIC.LOGIN}
                    element={
                      <PublicRoute>
                        <Login />
                      </PublicRoute>
                    }
                  />
                  <Route
                    path={ROUTES.PUBLIC.REGISTER}
                    element={
                      <PublicRoute>
                        <Register />
                      </PublicRoute>
                    }
                  />
                  <Route
                    path={ROUTES.PUBLIC.VERIFY_EMAIL}
                    element={
                      <PublicRoute>
                        <VerifyEmail />
                      </PublicRoute>
                    }
                  />
                  <Route
                    path={ROUTES.PUBLIC.FORGOT_PASSWORD}
                    element={
                      <PublicRoute>
                        <ForgotPassword />
                      </PublicRoute>
                    }
                  />
                  <Route
                    path={ROUTES.PUBLIC.RESET_PASSWORD}
                    element={
                      <PublicRoute>
                        <ResetPassword />
                      </PublicRoute>
                    }
                  />
                  <Route
                    path={ROUTES.PUBLIC.RESEND_VERIFICATION}
                    element={
                      <PublicRoute>
                        <ResendVerification />
                      </PublicRoute>
                    }
                  />
                  <Route
                    path={ROUTES.PUBLIC.APPLE_CALLBACK}
                    element={
                      <PublicRoute>
                        <AppleCallback />
                      </PublicRoute>
                    }
                  />
                  <Route
                    path={ROUTES.PUBLIC.GOOGLE_CALLBACK}
                    element={
                      <PublicRoute>
                        <GoogleCallback />
                      </PublicRoute>
                    }
                  />

                  {/* Mixed Routes - Accessible to all users */}
                  <Route
                    path={ROUTES.PUBLIC.HOME}
                    element={
                      <MixedRoute>
                        <Home />
                      </MixedRoute>
                    }
                  />
                  <Route
                    path={ROUTES.PUBLIC.REPORT_DETAIL}
                    element={
                      <MixedRoute>
                        <ReportDetail />
                      </MixedRoute>
                    }
                  />

                  {/* Protected Dashboard Routes */}
                  <Route
                    path={ROUTES.PROTECTED.DASHBOARD}
                    element={
                      <ProtectedRoute>
                        <DashboardRouter />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path={ROUTES.PROTECTED.MAIN_DASHBOARD}
                    element={
                      <ProtectedRoute>
                        <MainDashboardRouter />
                      </ProtectedRoute>
                    }
                  />

                  {/* Role-Specific Dashboards */}
                  <Route
                    path={ROUTES.PROTECTED.CITIZEN_DASHBOARD}
                    element={
                      <ProtectedRoute requiredRoles={ROLE_CONFIG.CITIZEN}>
                        <CitizenDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path={ROUTES.PROTECTED.OFFICIAL_DASHBOARD}
                    element={
                      <ProtectedRoute requiredRoles={ROLE_CONFIG.OFFICIAL}>
                        <OfficialDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path={ROUTES.PROTECTED.ADMIN_DASHBOARD}
                    element={
                      <ProtectedRoute requiredRoles={ROLE_CONFIG.ADMIN}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />

                  {/* Report Management Routes */}
                  <Route
                    path={ROUTES.PROTECTED.CREATE_REPORT}
                    element={
                      <ProtectedRoute requiredRoles={ROLE_CONFIG.CAN_CREATE_REPORT}>
                        <CreateReport />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path={ROUTES.PROTECTED.MY_REPORTS}
                    element={
                      <ProtectedRoute requiredRoles={ROLE_CONFIG.ALL_AUTHENTICATED}>
                        <CitizenDashboard />
                      </ProtectedRoute>
                    }
                  />

                  {/* Browse Reports Route - Accessible to all authenticated users */}
                  <Route
                    path={ROUTES.PROTECTED.BROWSE_REPORTS}
                    element={
                      <ProtectedRoute requiredRoles={ROLE_CONFIG.ALL_AUTHENTICATED}>
                        <BrowseReports />
                      </ProtectedRoute>
                    }
                  />

                  {/* Government Projects Route */}
                  <Route
                    path={ROUTES.PROTECTED.GOVERNMENT_PROJECTS}
                    element={
                      <ProtectedRoute requiredRoles={ROLE_CONFIG.ALL_AUTHENTICATED}>
                        <GovernmentProjects />
                      </ProtectedRoute>
                    }
                  />

                  {/* Reports List Route */}
                  <Route
                    path="/reports"
                    element={
                      <ProtectedRoute requiredRoles={ROLE_CONFIG.ALL_AUTHENTICATED}>
                        <ReportsList />
                      </ProtectedRoute>
                    }
                  />

                  {/* Default route redirect */}
                  <Route
                    path="/"
                    element={<Navigate to={ROUTES.PUBLIC.HOME} replace />}
                  />

                  {/* Catch all route - 404 */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </div>
          </AuthProvider>
        </NotificationProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;