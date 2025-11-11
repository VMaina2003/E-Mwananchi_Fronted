// src/App.jsx - UPDATED
import React, { Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";

// Lazy load components
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

// NEW: Import the new dashboard components
const MainDashboard = lazy(() => import("./pages/dashboard/MainDashboard"));
const ReportsList = lazy(() => import("./pages/reports/ReportsList"));

// Route Configuration
const ROUTES = {
  PUBLIC: {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    VERIFY_EMAIL: '/verify-email',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password',
    RESEND_VERIFICATION: '/resend-verification',
    APPLE_CALLBACK: '/auth/apple/callback',
    GOOGLE_CALLBACK: '/auth/google/callback',
    REPORT_DETAIL: '/reports/:id'
  },
  PROTECTED: {
    DASHBOARD: '/dashboard',
    CITIZEN_DASHBOARD: '/citizen-dashboard',
    OFFICIAL_DASHBOARD: '/official-dashboard',
    ADMIN_DASHBOARD: '/admin-dashboard',
    CREATE_REPORT: '/reports/create',
    MY_REPORTS: '/my-reports',
    // NEW ROUTES
    MAIN_DASHBOARD: '/main-dashboard',
    BROWSE_REPORTS: '/browse-reports'
  }
};

// Role configurations
const ROLE_CONFIG = {
  CITIZEN: ['citizen'],
  OFFICIAL: ['county_official'],
  ADMIN: ['admin', 'superadmin'],
  ALL_AUTHENTICATED: ['citizen', 'county_official', 'admin', 'superadmin', 'viewer']
};

// Loading Component
const AppLoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
      <p className="mt-4 text-gray-600">Loading E-Mwananchi...</p>
    </div>
  </div>
);

// Protected Route Component
const ProtectedRoute = ({ children, requiredRoles = null }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <AppLoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.PUBLIC.LOGIN} replace />;
  }

  if (requiredRoles && user && !requiredRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow border border-red-200">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-red-600 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            You don't have permission to access this page.
          </p>
          <button
            onClick={() => window.history.back()}
            className="bg-gray-600 text-white px-4 py-2 rounded font-medium hover:bg-gray-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return children;
};

// Public Route Component (only accessible when not authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <AppLoadingSpinner />;
  }

  if (isAuthenticated) {
    return <Navigate to={ROUTES.PROTECTED.DASHBOARD} replace />;
  }

  return children;
};

// Mixed Route (accessible regardless of authentication)
const MixedRoute = ({ children }) => {
  const { loading } = useAuth();

  if (loading) {
    return <AppLoadingSpinner />;
  }

  return children;
};

// Dashboard Router - Redirects to role-specific dashboard
const DashboardRouter = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to={ROUTES.PUBLIC.LOGIN} replace />;
  }

  const getDashboardRoute = () => {
    switch (user.role) {
      case 'citizen':
        return ROUTES.PROTECTED.CITIZEN_DASHBOARD;
      case 'county_official':
        return ROUTES.PROTECTED.OFFICIAL_DASHBOARD;
      case 'admin':
      case 'superadmin':
        return ROUTES.PROTECTED.ADMIN_DASHBOARD;
      case 'viewer':
        return ROUTES.PROTECTED.MAIN_DASHBOARD; // Viewers go to main dashboard
      default:
        return ROUTES.PROTECTED.MAIN_DASHBOARD; // Default to main dashboard
    }
  };

  return <Navigate to={getDashboardRoute()} replace />;
};

// NEW: Main Dashboard Router - Unified dashboard for all roles
const MainDashboardRouter = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to={ROUTES.PUBLIC.LOGIN} replace />;
  }

  // For now, redirect everyone to the main dashboard
  // You can add role-specific logic here later if needed
  return <MainDashboard />;
};

// 404 Not Found Component
const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow border border-gray-200">
      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
      <p className="text-gray-600 mb-4">The page you're looking for doesn't exist.</p>
      <button
        onClick={() => window.location.href = ROUTES.PUBLIC.HOME}
        className="bg-green-600 text-white px-4 py-2 rounded font-medium hover:bg-green-700 transition-colors"
      >
        Go to Homepage
      </button>
    </div>
  </div>
);

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Application Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow border border-red-200">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-red-800 mb-2">Something Went Wrong</h2>
            <p className="text-red-600 mb-4">Please try refreshing the page.</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-4 py-2 rounded font-medium hover:bg-red-700 transition-colors"
            >
              Refresh Page
            </button>
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
                  {/* Public Routes - Only accessible when not authenticated */}
                  <Route path={ROUTES.PUBLIC.LOGIN} element={<PublicRoute><Login /></PublicRoute>} />
                  <Route path={ROUTES.PUBLIC.REGISTER} element={<PublicRoute><Register /></PublicRoute>} />
                  <Route path={ROUTES.PUBLIC.VERIFY_EMAIL} element={<PublicRoute><VerifyEmail /></PublicRoute>} />
                  <Route path={ROUTES.PUBLIC.FORGOT_PASSWORD} element={<PublicRoute><ForgotPassword /></PublicRoute>} />
                  <Route path={ROUTES.PUBLIC.RESET_PASSWORD} element={<PublicRoute><ResetPassword /></PublicRoute>} />
                  <Route path={ROUTES.PUBLIC.RESEND_VERIFICATION} element={<PublicRoute><ResendVerification /></PublicRoute>} />
                  <Route path={ROUTES.PUBLIC.APPLE_CALLBACK} element={<PublicRoute><AppleCallback /></PublicRoute>} />
                  <Route path={ROUTES.PUBLIC.GOOGLE_CALLBACK} element={<PublicRoute><GoogleCallback /></PublicRoute>} />
                  
                  {/* Mixed Routes - Accessible to all users */}
                  <Route path={ROUTES.PUBLIC.HOME} element={<MixedRoute><Home /></MixedRoute>} />
                  <Route path={ROUTES.PUBLIC.REPORT_DETAIL} element={<MixedRoute><ReportDetail /></MixedRoute>} />

                  {/* NEW: Unified Dashboard Routes */}
                  <Route path={ROUTES.PROTECTED.MAIN_DASHBOARD} element={<ProtectedRoute><MainDashboardRouter /></ProtectedRoute>} />
                  <Route path={ROUTES.PROTECTED.BROWSE_REPORTS} element={<ProtectedRoute requiredRoles={ROLE_CONFIG.ALL_AUTHENTICATED}><ReportsList /></ProtectedRoute>} />

                  {/* Protected Dashboard Routes */}
                  <Route path={ROUTES.PROTECTED.DASHBOARD} element={<ProtectedRoute><DashboardRouter /></ProtectedRoute>} />
                  <Route path={ROUTES.PROTECTED.CITIZEN_DASHBOARD} element={<ProtectedRoute requiredRoles={ROLE_CONFIG.CITIZEN}><CitizenDashboard /></ProtectedRoute>} />
                  <Route path={ROUTES.PROTECTED.OFFICIAL_DASHBOARD} element={<ProtectedRoute requiredRoles={ROLE_CONFIG.OFFICIAL}><OfficialDashboard /></ProtectedRoute>} />
                  <Route path={ROUTES.PROTECTED.ADMIN_DASHBOARD} element={<ProtectedRoute requiredRoles={ROLE_CONFIG.ADMIN}><AdminDashboard /></ProtectedRoute>} />

                  {/* Protected Feature Routes */}
                  <Route path={ROUTES.PROTECTED.CREATE_REPORT} element={<ProtectedRoute requiredRoles={ROLE_CONFIG.ALL_AUTHENTICATED}><CreateReport /></ProtectedRoute>} />
                  <Route path={ROUTES.PROTECTED.MY_REPORTS} element={<ProtectedRoute requiredRoles={ROLE_CONFIG.ALL_AUTHENTICATED}><CitizenDashboard /></ProtectedRoute>} />

                  {/* Default route */}
                  <Route path="/" element={<Navigate to={ROUTES.PUBLIC.HOME} replace />} />
                  
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