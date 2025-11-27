// src/App.jsx - COMPLETELY REWRITTEN AND CORRECTED VERSION
import React, { Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";

// Enhanced lazy loading with better error handling
const createLazyImport = (importFn, componentName = "Component") => {
  return lazy(() =>
    importFn().catch((error) => {
      console.error(`Failed to load ${componentName}:`, error);
      return {
        default: () => (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center max-w-md mx-auto p-8 bg-white rounded-2xl shadow-lg border border-red-200">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-red-800 mb-3">Failed to Load</h2>
              <p className="text-gray-600 mb-6">
                {componentName} failed to load. This might be due to network issues or temporary server problems.
              </p>
              <div className="flex space-x-3 justify-center">
                <button
                  onClick={() => window.location.reload()}
                  className="bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-all duration-200"
                >
                  Retry Loading
                </button>
                <button
                  onClick={() => window.history.back()}
                  className="bg-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition-all duration-200"
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        ),
      };
    })
  );
};

// Lazy load components
const Login = createLazyImport(() => import("./pages/auth/Login"), "Login");
const Register = createLazyImport(() => import("./pages/auth/Register"), "Register");
const Home = createLazyImport(() => import("./pages/home/Home"), "Home");
const CreateReport = createLazyImport(() => import("./pages/reports/CreateReport"), "CreateReport");
const ReportDetail = createLazyImport(() => import("./pages/reports/ReportDetail"), "ReportDetail");
const CitizenDashboard = createLazyImport(() => import("./pages/dashboard/CitizenDashboard"), "CitizenDashboard");
const OfficialDashboard = createLazyImport(() => import("./pages/dashboard/OfficialDashboard"), "OfficialDashboard");
const AdminDashboard = createLazyImport(() => import("./pages/dashboard/AdminDashboard"), "AdminDashboard");
const VerifyEmail = createLazyImport(() => import("./pages/auth/VerifyEmail"), "VerifyEmail");
const ForgotPassword = createLazyImport(() => import("./pages/auth/ForgotPassword"), "ForgotPassword");
const ResetPassword = createLazyImport(() => import("./pages/auth/ResetPassword"), "ResetPassword");
const ResendVerification = createLazyImport(() => import("./pages/auth/ResendVerification"), "ResendVerification");
const AppleCallback = createLazyImport(() => import("./pages/auth/AppleCallback"), "AppleCallback");
const GoogleCallback = createLazyImport(() => import("./pages/auth/GoogleCallback"), "GoogleCallback");
const GovernmentProjects = createLazyImport(() => import("./pages/projects/GovernmentProjects"), "GovernmentProjects");
const MainDashboard = createLazyImport(() => import("./pages/dashboard/MainDashboard"), "MainDashboard");
const ReportsList = createLazyImport(() => import("./pages/reports/ReportsList"), "ReportsList");
const BrowseReports = createLazyImport(() => import("./pages/reports/BrowseReports"), "BrowseReports");
const ReportsFeed = createLazyImport(() => import("./pages/reports/ReportFeed"), "ReportsFeed");

// Support and Legal Pages
const HelpCenter = createLazyImport(() => import("./pages/support/HelpCenter"), "HelpCenter");
const ContactUs = createLazyImport(() => import("./pages/support/ContactUs"), "ContactUs");
const PrivacyPolicy = createLazyImport(() => import("./pages/support/PrivacyPolicy"), "PrivacyPolicy");
const TermsOfService = createLazyImport(() => import("./pages/support/TermsOfService"), "TermsOfService");

// Centralized Route Configuration
const ROUTES = {
  PUBLIC: {
    HOME: "/",
    LOGIN: "/login",
    REGISTER: "/register",
    VERIFY_EMAIL: "/verify-email",
    FORGOT_PASSWORD: "/forgot-password",
    RESET_PASSWORD: "/reset-password/:uid/:token",
    RESEND_VERIFICATION: "/resend-verification",
    APPLE_CALLBACK: "/auth/apple/callback",
    GOOGLE_CALLBACK: "/auth/google/callback",
    REPORT_DETAIL: "/reports/:id",
    REPORTS_FEED: "/feed",
    HELP: "/help",
    CONTACT: "/contact",
    PRIVACY: "/privacy",
    TERMS: "/terms",
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
    REPORTS: "/reports",
  },
};

// Role-based access configuration
const ROLE_CONFIG = {
  CITIZEN: ["citizen"],
  OFFICIAL: ["county_official"],
  ADMIN: ["admin", "superadmin"],
  VIEWER: ["viewer"],
  ALL_AUTHENTICATED: ["citizen", "county_official", "admin", "superadmin", "viewer"],
  CAN_CREATE_REPORT: ["citizen", "county_official", "admin", "superadmin"],
};

// Enhanced Loading Component
const AppLoadingSpinner = ({ message = "Loading E-Mwananchi" }) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
    <div className="text-center">
      <div className="relative">
        <div className="animate-spin rounded-full h-20 w-20 border-4 border-green-600 border-t-transparent mx-auto mb-4"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 bg-green-600 rounded-full animate-pulse"></div>
        </div>
      </div>
      <div className="space-y-3">
        <p className="text-xl font-semibold text-gray-900">{message}</p>
        <p className="text-sm text-gray-600 animate-pulse">Empowering citizen voices...</p>
        <div className="flex justify-center space-x-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-green-600 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.1}s` }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Enhanced Protected Route Component
const ProtectedRoute = ({ 
  children, 
  requiredRoles = null,
  fallbackPath = ROUTES.PUBLIC.LOGIN,
  showLoading = true
}) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading && showLoading) {
    return <AppLoadingSpinner message="Checking authentication..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to={fallbackPath} replace state={{ from: window.location.pathname }} />;
  }

  if (requiredRoles && user && !requiredRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-8 bg-white rounded-2xl shadow-lg border border-red-200">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-red-800 mb-3">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            You don't have permission to access this page with your current role.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Your Role:</span> {user.role}
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Required Roles:</span> {requiredRoles.join(", ")}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => window.history.back()}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Go Back
            </button>
            <button
              onClick={() => window.location.href = ROUTES.PUBLIC.HOME}
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

// Enhanced Public Route Component
const PublicRoute = ({ 
  children, 
  fallbackPath = ROUTES.PROTECTED.DASHBOARD,
  showLoading = true
}) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading && showLoading) {
    return <AppLoadingSpinner message="Checking authentication..." />;
  }

  if (isAuthenticated) {
    return <Navigate to={fallbackPath} replace />;
  }

  return children;
};

// Enhanced Mixed Route Component
const MixedRoute = ({ children, showLoading = true }) => {
  const { loading } = useAuth();

  if (loading && showLoading) {
    return <AppLoadingSpinner message="Loading..." />;
  }

  return children;
};

// Smart Dashboard Router Component
const DashboardRouter = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <AppLoadingSpinner message="Routing to your dashboard..." />;
  }

  if (!user) {
    return <Navigate to={ROUTES.PUBLIC.LOGIN} replace />;
  }

  // Route based on user role with proper fallbacks
  const roleRoutes = {
    citizen: ROUTES.PROTECTED.CITIZEN_DASHBOARD,
    county_official: ROUTES.PROTECTED.OFFICIAL_DASHBOARD,
    admin: ROUTES.PROTECTED.ADMIN_DASHBOARD,
    superadmin: ROUTES.PROTECTED.ADMIN_DASHBOARD,
    viewer: ROUTES.PROTECTED.MAIN_DASHBOARD,
  };

  const targetRoute = roleRoutes[user.role] || ROUTES.PROTECTED.MAIN_DASHBOARD;

  return <Navigate to={targetRoute} replace />;
};

// Main Dashboard Router Component
const MainDashboardRouter = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <AppLoadingSpinner message="Loading dashboard..." />;
  }

  if (!user) {
    return <Navigate to={ROUTES.PUBLIC.LOGIN} replace />;
  }

  return <MainDashboard />;
};

// Enhanced 404 Not Found Component
const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
    <div className="text-center max-w-md mx-auto p-8 bg-white rounded-2xl shadow-lg border border-gray-200">
      <div className="w-24 h-24 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Page Not Found</h2>
      <p className="text-gray-600 mb-8 text-lg leading-relaxed">
        The page you're looking for doesn't exist or has been moved to a different location.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={() => window.history.back()}
          className="bg-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition-all duration-200 flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Go Back
        </button>
        <button
          onClick={() => window.location.href = ROUTES.PUBLIC.HOME}
          className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-all duration-200 flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Go to Homepage
        </button>
      </div>
    </div>
  </div>
);

// Enhanced Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { 
      hasError: true,
      error: error 
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Application Error Boundary Caught:", error);
    console.error("Error Info:", errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ 
      hasError: false,
      error: null,
      errorInfo: null 
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50">
          <div className="text-center max-w-2xl mx-auto p-8 bg-white rounded-2xl shadow-lg border border-red-200">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-red-800 mb-3">
              Something Went Wrong
            </h2>
            <p className="text-red-600 mb-6 text-lg">
              We apologize for the inconvenience. Our team has been notified and is working to fix the issue.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
              <button
                onClick={this.handleReset}
                className="bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="bg-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh Page
              </button>
              <button
                onClick={() => window.location.href = ROUTES.PUBLIC.HOME}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Go to Home
              </button>
            </div>

            {/* Development error details */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left bg-gray-100 rounded-lg p-4">
                <summary className="cursor-pointer font-semibold text-gray-800 mb-2">
                  Error Details (Development Only)
                </summary>
                <div className="space-y-2 text-sm">
                  <div>
                    <strong>Error:</strong>
                    <pre className="bg-white p-2 rounded mt-1 overflow-auto text-red-600">
                      {this.state.error.toString()}
                    </pre>
                  </div>
                  {this.state.errorInfo && (
                    <div>
                      <strong>Component Stack:</strong>
                      <pre className="bg-white p-2 rounded mt-1 overflow-auto text-gray-600">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Main App Component
function App() {
  return (
    <ErrorBoundary>
      <Router>
        <NotificationProvider>
          <AuthProvider>
            <div className="App min-h-screen bg-gray-50">
              <Suspense fallback={<AppLoadingSpinner />}>
                <Routes>
                  {/* ===== PUBLIC ROUTES (Only accessible when NOT authenticated) ===== */}
                  
                  {/* Authentication Routes */}
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

                  {/* ===== MIXED ROUTES (Accessible to ALL users) ===== */}
                  
                  <Route
                    path={ROUTES.PUBLIC.HOME}
                    element={
                      <MixedRoute>
                        <Home />
                      </MixedRoute>
                    }
                  />
                  <Route
                    path={ROUTES.PUBLIC.REPORTS_FEED}
                    element={
                      <MixedRoute>
                        <ReportsFeed />
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

                  {/* Support & Legal Routes */}
                  <Route
                    path={ROUTES.PUBLIC.HELP}
                    element={
                      <MixedRoute>
                        <HelpCenter />
                      </MixedRoute>
                    }
                  />
                  <Route
                    path={ROUTES.PUBLIC.CONTACT}
                    element={
                      <MixedRoute>
                        <ContactUs />
                      </MixedRoute>
                    }
                  />
                  <Route
                    path={ROUTES.PUBLIC.PRIVACY}
                    element={
                      <MixedRoute>
                        <PrivacyPolicy />
                      </MixedRoute>
                    }
                  />
                  <Route
                    path={ROUTES.PUBLIC.TERMS}
                    element={
                      <MixedRoute>
                        <TermsOfService />
                      </MixedRoute>
                    }
                  />

                  {/* ===== PROTECTED ROUTES (Require authentication) ===== */}
                  
                  {/* Smart Dashboard Router */}
                  <Route
                    path={ROUTES.PROTECTED.DASHBOARD}
                    element={
                      <ProtectedRoute>
                        <DashboardRouter />
                      </ProtectedRoute>
                    }
                  />

                  {/* Unified Main Dashboard */}
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

                  {/* My Reports Route */}
                  <Route
                    path={ROUTES.PROTECTED.MY_REPORTS}
                    element={
                      <ProtectedRoute requiredRoles={ROLE_CONFIG.ALL_AUTHENTICATED}>
                        <CitizenDashboard />
                      </ProtectedRoute>
                    }
                  />

                  {/* Browse Reports */}
                  <Route
                    path={ROUTES.PROTECTED.BROWSE_REPORTS}
                    element={
                      <ProtectedRoute requiredRoles={ROLE_CONFIG.ALL_AUTHENTICATED}>
                        <BrowseReports />
                      </ProtectedRoute>
                    }
                  />

                  {/* Government Projects */}
                  <Route
                    path={ROUTES.PROTECTED.GOVERNMENT_PROJECTS}
                    element={
                      <ProtectedRoute requiredRoles={ROLE_CONFIG.ALL_AUTHENTICATED}>
                        <GovernmentProjects />
                      </ProtectedRoute>
                    }
                  />

                  {/* Reports List */}
                  <Route
                    path={ROUTES.PROTECTED.REPORTS}
                    element={
                      <ProtectedRoute requiredRoles={ROLE_CONFIG.ALL_AUTHENTICATED}>
                        <ReportsList />
                      </ProtectedRoute>
                    }
                  />

                  {/* ===== DEFAULT ROUTES ===== */}
                  
                  {/* Redirect root to home */}
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