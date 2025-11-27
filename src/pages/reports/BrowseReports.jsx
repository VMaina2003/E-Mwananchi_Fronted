// src/pages/reports/BrowseReports.jsx - FIXED COMMENT COUNTING
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import ReportFeed from './ReportFeed';
import locationService from '../../services/api/locationService';
import departmentService from '../../services/api/departmentService';
import reportService from '../../services/api/reportService'; // Add this import

const BrowseReports = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [filters, setFilters] = useState({
    county: '',
    department: '',
    status: '',
    search: '',
    ordering: '-created_at'
  });
  
  const [counties, setCounties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Add state for enhanced reports with comment counts
  const [enhancedReports, setEnhancedReports] = useState([]);

  // Load filter options
  const loadFilterOptions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Starting to load filter options...');
      
      const [countiesData, departmentsData] = await Promise.all([
        locationService.getAllCounties ? locationService.getAllCounties() : locationService.getCounties(),
        departmentService.getDepartments(),
      ]);
      
      const safeCounties = Array.isArray(countiesData) ? countiesData : [];
      const safeDepartments = Array.isArray(departmentsData) ? departmentsData : [];
      
      setCounties(safeCounties);
      setDepartments(safeDepartments);
      
      console.log(`Final counts - Counties: ${safeCounties.length}, Departments: ${safeDepartments.length}`);
      
    } catch (error) {
      console.error('Error loading filter options:', error);
      setError('Failed to load filter options. Please try again.');
      setCounties([]);
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  };

  // Enhanced function to fetch reports with comment counts
  const fetchReportsWithComments = async () => {
    try {
      setLoading(true);
      const reportsData = await reportService.getReports(filters);
      
      const reportsArray = Array.isArray(reportsData) ? reportsData : reportsData.results || [];
      
      // If reports don't have comments_count, we'll enhance them
      const reportsWithComments = await Promise.all(
        reportsArray.map(async (report) => {
          // If the report already has comments_count, use it
          if (report.comments_count !== undefined) {
            return report;
          }
          
          // Otherwise, try to fetch comments count separately
          try {
            // You might need to add a method to your reportService to get comment counts
            // For now, we'll use the existing method and count the results
            const comments = await reportService.getReportComments?.(report.id) || [];
            const commentsArray = Array.isArray(comments) ? comments : comments.results || [];
            
            return {
              ...report,
              comments_count: commentsArray.length
            };
          } catch (error) {
            console.error(`Failed to fetch comments for report ${report.id}:`, error);
            return { ...report, comments_count: 0 };
          }
        })
      );
      
      setEnhancedReports(reportsWithComments);
      
    } catch (error) {
      console.error("Failed to load reports:", error);
      setEnhancedReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFilterOptions();
    fetchReportsWithComments();
  }, []);

  // Update when filters change
  useEffect(() => {
    if (filters) {
      fetchReportsWithComments();
    }
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      county: '',
      department: '',
      status: '',
      search: '',
      ordering: '-created_at'
    });
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => 
      value !== '' && value !== '-created_at'
    ).length;
  };

  const retryLoadData = () => {
    loadFilterOptions();
    fetchReportsWithComments();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Browse Reports</h1>
                <p className="text-gray-600 mt-1">
                  Discover community issues and government responses from across all counties
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                {user && (
                  <button
                    onClick={() => navigate('/reports/create')}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors shadow-sm"
                  >
                    Create Report
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <p className="text-red-800">{error}</p>
                </div>
                <button
                  onClick={retryLoadData}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
              <div className="flex items-center space-x-3">
                {getActiveFiltersCount() > 0 && (
                  <span className="text-sm text-gray-500">
                    {getActiveFiltersCount()} active filter{getActiveFiltersCount() !== 1 ? 's' : ''}
                  </span>
                )}
                <button
                  onClick={clearFilters}
                  className="text-sm text-green-600 hover:text-green-700 font-medium"
                >
                  Clear All
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                <span className="ml-3 text-gray-600">Loading filters...</span>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Search */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Search Reports
                    </label>
                    <input
                      type="text"
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      placeholder="Search by title or description..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  {/* County Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      County ({counties.length})
                    </label>
                    <select
                      value={filters.county}
                      onChange={(e) => handleFilterChange('county', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">All Counties</option>
                      {counties.map((county) => (
                        <option key={county.id} value={county.id}>
                          {county.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Department Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Department ({departments.length})
                    </label>
                    <select
                      value={filters.department}
                      onChange={(e) => handleFilterChange('department', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">All Departments</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={filters.status}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">All Status</option>
                      <option value="submitted">Submitted</option>
                      <option value="verified">Verified</option>
                      <option value="pending">Pending</option>
                      <option value="noted">Noted</option>
                      <option value="on_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>
                </div>

                {/* Sort Options */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sort By
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: '-created_at', label: 'Newest First' },
                      { value: 'created_at', label: 'Oldest First' },
                      { value: '-likes_count', label: 'Most Liked' },
                      { value: '-views_count', label: 'Most Viewed' },
                      { value: '-comments_count', label: 'Most Comments' }
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleFilterChange('ordering', option.value)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          filters.ordering === option.value
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Reports Feed - Pass enhanced reports if available */}
          <ReportFeed
            initialFilters={filters}
            showFilters={false}
            limit={20}
            enableInteractions={true}
            enhancedReports={enhancedReports.length > 0 ? enhancedReports : null}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BrowseReports;