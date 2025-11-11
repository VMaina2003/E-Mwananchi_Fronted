// components/common/Header.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const userMenuRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setShowMobileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setShowUserMenu(false);
  };

  const getRoleDisplayName = (role) => {
    const roleMap = {
      'citizen': 'Citizen',
      'viewer': 'Viewer',
      'county_official': 'County Official',
      'admin': 'Administrator',
      'superadmin': 'Super Administrator'
    };
    return roleMap[role] || role;
  };

  const getUserInitials = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    if (user?.first_name) {
      return user.first_name[0].toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  const getFullName = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    if (user?.first_name) {
      return user.first_name;
    }
    return user?.email || 'User';
  };

  const canCreateReport = user && ['citizen', 'county_official', 'admin', 'superadmin'].includes(user.role);

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  const getDashboardRoute = () => {
    if (!user) return '/dashboard';
    
    switch (user.role) {
      case 'citizen':
        return '/citizen-dashboard';
      case 'county_official':
        return '/official-dashboard';
      case 'admin':
      case 'superadmin':
        return '/admin-dashboard';
      case 'viewer':
        return '/main-dashboard';
      default:
        return '/main-dashboard';
    }
  };

  const NavigationLink = ({ to, children, isButton = false, mobile = false }) => {
    const isActive = isActiveRoute(to);
    const baseClasses = mobile 
      ? "block px-3 py-2 rounded-md text-base font-medium transition duration-200"
      : "px-3 py-2 rounded-md text-sm font-medium transition duration-200";
    
    const activeClasses = isButton
      ? "bg-green-600 text-white hover:bg-green-700"
      : isActive
      ? "text-green-600 bg-green-50"
      : "text-gray-700 hover:text-green-600 hover:bg-gray-100";
    
    const inactiveClasses = isButton
      ? "bg-green-600 text-white hover:bg-green-700"
      : "text-gray-700 hover:text-green-600 hover:bg-gray-100";

    return (
      <button
        onClick={() => {
          navigate(to);
          setShowMobileMenu(false);
        }}
        className={`${baseClasses} ${isButton || isActive ? activeClasses : inactiveClasses}`}
      >
        {children}
      </button>
    );
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <div 
              className="flex-shrink-0 flex items-center cursor-pointer hover:opacity-80 transition-opacity duration-200"
              onClick={() => navigate('/')}
            >
              <div className="h-8 w-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mr-3 shadow-md">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900 hidden sm:block">E-Mwananchi</h1>
              <h1 className="text-xl font-bold text-gray-900 sm:hidden">E-M</h1>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:ml-8 md:flex space-x-1">
              <NavigationLink to="/">
                Home
              </NavigationLink>
              <NavigationLink to="/browse-reports">
                Browse Reports
              </NavigationLink>
              
              {/* Show dashboard link only for authenticated users */}
              {user && (
                <NavigationLink to={getDashboardRoute()}>
                  Dashboard
                </NavigationLink>
              )}
              
              {/* Report Issue button for authorized users */}
              {canCreateReport && (
                <NavigationLink to="/reports/create" isButton={true}>
                  Report Issue
                </NavigationLink>
              )}
            </nav>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-green-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {showMobileMenu ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-3 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 p-1 hover:bg-gray-100 transition duration-200"
                >
                  <div className="h-8 w-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-sm">
                    <span className="text-white font-medium text-sm">
                      {getUserInitials()}
                    </span>
                  </div>
                  <div className="text-left max-w-40">
                    <p className="font-medium text-gray-900 truncate">
                      {getFullName()}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {getRoleDisplayName(user.role)}
                      {user.county_name && ` • ${user.county_name}`}
                    </p>
                  </div>
                  <svg 
                    className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg py-2 ring-1 ring-black ring-opacity-5 z-50 border border-gray-200">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900 truncate">{getFullName()}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {getRoleDisplayName(user.role)}
                        {user.county_name && ` • ${user.county_name}`}
                      </p>
                    </div>
                    
                    <div className="py-1">
                      <NavigationLink to={getDashboardRoute()} mobile={true}>
                        <div className="flex items-center space-x-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                          </svg>
                          <span>My Dashboard</span>
                        </div>
                      </NavigationLink>
                      
                      <NavigationLink to="/my-reports" mobile={true}>
                        <div className="flex items-center space-x-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span>My Reports</span>
                        </div>
                      </NavigationLink>

                      {user.role === 'county_official' && (
                        <NavigationLink to="/official-dashboard" mobile={true}>
                          <div className="flex items-center space-x-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <span>Official Portal</span>
                          </div>
                        </NavigationLink>
                      )}

                      {['admin', 'superadmin'].includes(user.role) && (
                        <NavigationLink to="/admin-dashboard" mobile={true}>
                          <div className="flex items-center space-x-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>Admin Portal</span>
                          </div>
                        </NavigationLink>
                      )}
                    </div>

                    <div className="border-t border-gray-100 pt-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition duration-200 rounded-md mx-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Sign out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Login/Register buttons when not authenticated */
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => navigate('/login')}
                  className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition duration-200 hover:bg-gray-100"
                >
                  Sign in
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="bg-green-600 text-white hover:bg-green-700 px-4 py-2 rounded-md text-sm font-medium transition duration-200 shadow-sm hover:shadow-md"
                >
                  Join E-Mwananchi
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {showMobileMenu && (
          <div ref={mobileMenuRef} className="md:hidden border-t border-gray-200 bg-white py-2">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <NavigationLink to="/" mobile={true}>
                Home
              </NavigationLink>
              <NavigationLink to="/browse-reports" mobile={true}>
                Browse Reports
              </NavigationLink>
              
              {user && (
                <>
                  <NavigationLink to={getDashboardRoute()} mobile={true}>
                    Dashboard
                  </NavigationLink>
                  <NavigationLink to="/my-reports" mobile={true}>
                    My Reports
                  </NavigationLink>
                  
                  {user.role === 'county_official' && (
                    <NavigationLink to="/official-dashboard" mobile={true}>
                      Official Portal
                    </NavigationLink>
                  )}
                  
                  {['admin', 'superadmin'].includes(user.role) && (
                    <NavigationLink to="/admin-dashboard" mobile={true}>
                      Admin Portal
                    </NavigationLink>
                  )}
                </>
              )}
              
              {canCreateReport && (
                <NavigationLink to="/reports/create" mobile={true} isButton={true}>
                  Report Issue
                </NavigationLink>
              )}

              {!user ? (
                <div className="pt-4 border-t border-gray-200 space-y-2">
                  <NavigationLink to="/login" mobile={true}>
                    Sign in
                  </NavigationLink>
                  <NavigationLink to="/register" mobile={true} isButton={true}>
                    Join E-Mwananchi
                  </NavigationLink>
                </div>
              ) : (
                <div className="pt-4 border-t border-gray-200">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium text-gray-900">{getFullName()}</p>
                    <p className="text-xs text-gray-500">
                      {getRoleDisplayName(user.role)}
                      {user.county_name && ` • ${user.county_name}`}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition duration-200"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;