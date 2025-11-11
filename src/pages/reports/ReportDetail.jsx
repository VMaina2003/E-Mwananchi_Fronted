import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import Layout from '../../components/common/Layout';
import reportService from '../../services/api/reportService'; 

const ReportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');

  useEffect(() => {
    fetchReport();
  }, [id]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      
      const data = await reportService.getReport(id);
      console.log('Full Report Data:', data);
      
      setReport(data);
      setSelectedStatus(data.status);
    } catch (err) {
      console.error('Failed to fetch report:', err);
      console.error('Error response:', err.response?.data);
      
      if (err.response?.status === 404) {
        showError('Report not found', 'Report Error');
      } else if (err.response?.status === 401) {
        showError('Please log in to view report details', 'Authentication Required');
      } else if (err.response?.status === 403) {
        showError('You do not have permission to view this report', 'Access Denied');
      } else {
        showError('Failed to load report. Please try again.', 'Loading Error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedStatus || selectedStatus === report.status || !user) return;

    try {
      setUpdatingStatus(true);
      
      const updatedReport = await reportService.updateReportStatus(id, selectedStatus);
      setReport(updatedReport);
      
      showSuccess('Status updated successfully!', 'Report Updated');
    } catch (err) {
      console.error('Status update failed:', err);
      showError(err.response?.data?.detail || 'Failed to update status', 'Update Error');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const canUpdateStatus = user && (
    user.role === 'county_official' || 
    user.role === 'admin' || 
    user.role === 'superadmin'
  );

  const isReporter = user && report && user.id === report.reporter;

  const getStatusColor = (status) => {
    const colors = {
      submitted: 'bg-blue-100 text-blue-800 border-blue-200',
      verified: 'bg-green-100 text-green-800 border-green-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      noted: 'bg-purple-100 text-purple-800 border-purple-200',
      on_progress: 'bg-orange-100 text-orange-800 border-orange-200',
      resolved: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
      deleted: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusDisplay = (status) => {
    const displays = {
      submitted: 'Submitted',
      verified: 'Verified (AI Confirmed)',
      pending: 'Pending County Review',
      noted: 'Noted by Official',
      on_progress: 'In Progress',
      resolved: 'Resolved',
      rejected: 'Rejected',
      deleted: 'Deleted'
    };
    return displays[status] || status;
  };

  const getDepartmentIcon = (departmentName) => {
    const icons = {
      'health': (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      'education': (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14v6l-9-5m9 5l9-5m-9 5v-6m9 5l-9-5m9 5l-9-5" />
        </svg>
      ),
      'roads': (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      'security': (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      'agriculture': (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0 9a9 9 0 01-9-9m9 9c0 5-4 9-9 9s-9-4-9-9m9-9a9 9 0 00-9 9" />
        </svg>
      ),
      'environment': (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      'water': (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
        </svg>
      )
    };

    if (!departmentName) return (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    );
    
    const deptLower = departmentName.toLowerCase();
    for (const [key, icon] of Object.entries(icons)) {
      if (deptLower.includes(key)) {
        return icon;
      }
    }
    
    // Default icon for other departments
    return (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    );
  };

  const getDepartmentColor = (departmentName) => {
    const colors = {
      'health': 'bg-red-50 border-red-200 text-red-800',
      'education': 'bg-blue-50 border-blue-200 text-blue-800',
      'roads': 'bg-yellow-50 border-yellow-200 text-yellow-800',
      'security': 'bg-gray-50 border-gray-200 text-gray-800',
      'agriculture': 'bg-green-50 border-green-200 text-green-800',
      'environment': 'bg-emerald-50 border-emerald-200 text-emerald-800',
      'water': 'bg-cyan-50 border-cyan-200 text-cyan-800',
      'finance': 'bg-purple-50 border-purple-200 text-purple-800',
      'housing': 'bg-orange-50 border-orange-200 text-orange-800',
      'ict': 'bg-indigo-50 border-indigo-200 text-indigo-800',
      'transport': 'bg-amber-50 border-amber-200 text-amber-800',
      'trade': 'bg-lime-50 border-lime-200 text-lime-800',
      'public service': 'bg-slate-50 border-slate-200 text-slate-800'
    };

    if (!departmentName) return 'bg-gray-50 border-gray-200 text-gray-800';
    
    const deptLower = departmentName.toLowerCase();
    for (const [key, color] of Object.entries(colors)) {
      if (deptLower.includes(key)) {
        return color;
      }
    }
    
    return 'bg-gray-50 border-gray-200 text-gray-800';
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-KE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Safe data access functions
  const getCountyName = () => {
    if (!report) return 'Not specified';
    return report.county_name || (report.county && typeof report.county === 'object' ? report.county.name : 'Not specified');
  };

  const getSubcountyName = () => {
    if (!report) return null;
    return report.subcounty_name || (report.subcounty && typeof report.subcounty === 'object' ? report.subcounty.name : null);
  };

  const getWardName = () => {
    if (!report) return null;
    return report.ward_name || (report.ward && typeof report.ward === 'object' ? report.ward.name : null);
  };

  const getDepartmentName = () => {
    if (!report) return 'Not assigned';
    return report.department_name || 
           (report.department && typeof report.department === 'object' ? 
            (report.department.department?.name || report.department.name) : 'Not assigned');
  };

  const getImageUrl = (image) => {
    if (!image) return '/placeholder-image.jpg';
    return image.image_url || image.image || '/placeholder-image.jpg';
  };

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
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Report Not Found
            </h2>
            <p className="text-gray-600 mb-6">
              The report you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate('/reports')}
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
          {/* Header */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-6">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(report.status)}`}>
                      {getStatusDisplay(report.status)}
                    </span>
                    {report.verified_by_ai && (
                      <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        AI Verified
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-white">{report.title}</h1>
                  <p className="text-green-100 mt-2 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Reported by {report.reporter_name || 'Unknown'} • {formatDateTime(report.created_at)}
                  </p>
                </div>
                <button
                  onClick={() => navigate('/reports')}
                  className="bg-white text-green-600 px-4 py-2 rounded-lg font-semibold hover:bg-green-50 transition-colors flex items-center gap-2 whitespace-nowrap"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Reports
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description Card */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Issue Description
                </h2>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{report.description}</p>
                </div>
              </div>

              {/* Images Gallery */}
              {report.images && report.images.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Evidence Photos ({report.images.length})
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {report.images.map((image, index) => (
                      <div key={image.id} className="relative group">
                        <div className="aspect-square overflow-hidden rounded-lg border border-gray-200">
                          <img
                            src={getImageUrl(image)}
                            alt={image.caption || `Evidence ${index + 1}`}
                            className="w-full h-full object-cover cursor-pointer transition-transform group-hover:scale-105"
                            onClick={() => window.open(getImageUrl(image), '_blank')}
                            onError={(e) => {
                              e.target.src = '/placeholder-image.jpg';
                            }}
                          />
                        </div>
                        {image.caption && (
                          <p className="text-sm text-gray-600 mt-2 text-center">{image.caption}</p>
                        )}
                        <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                          Click to enlarge
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Verification Details */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  AI Analysis & Verification
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm font-medium text-blue-800">AI Verification</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        report.verified_by_ai ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {report.verified_by_ai ? 'Verified' : 'Not Verified'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm font-medium text-blue-800">Confidence Score</span>
                      <span className="text-sm font-semibold text-blue-800">
                        {report.ai_confidence ? `${(report.ai_confidence * 100).toFixed(1)}%` : 'N/A'}
                      </span>
                    </div>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-2">AI Benefits</h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Automatic department classification</li>
                      <li>• Faster processing times</li>
                      <li>• Reduced manual review needed</li>
                      {report.verified_by_ai && (
                        <li>• This report was automatically verified</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Location Details */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Location Details
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">County</span>
                    <span className="font-semibold text-gray-900">{getCountyName()}</span>
                  </div>
                  {getSubcountyName() && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Sub-County</span>
                      <span className="font-semibold text-gray-900">{getSubcountyName()}</span>
                    </div>
                  )}
                  {getWardName() && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Ward</span>
                      <span className="font-semibold text-gray-900">{getWardName()}</span>
                    </div>
                  )}
                  {report.latitude && report.longitude && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-blue-800 mb-1">GPS Coordinates</p>
                      <p className="text-sm font-mono text-blue-900">
                        {report.latitude}, {report.longitude}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Department Assignment */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Responsible Department
                </h2>
                <div className={`border rounded-lg p-4 text-center ${getDepartmentColor(getDepartmentName())}`}>
                  <div className="flex justify-center mb-2">
                    {getDepartmentIcon(getDepartmentName())}
                  </div>
                  <p className="font-semibold text-lg">
                    {getDepartmentName()}
                  </p>
                  {getDepartmentName() !== 'Not assigned' && (
                    <p className="text-sm mt-2">
                      This department is responsible for addressing the reported issue
                    </p>
                  )}
                </div>
              </div>

              {/* Status Update (for officials) */}
              {canUpdateStatus && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Update Status
                  </h2>
                  <div className="space-y-3">
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="submitted">Submitted</option>
                      <option value="verified">Verified</option>
                      <option value="pending">Pending Review</option>
                      <option value="noted">Noted by Official</option>
                      <option value="on_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                    <button
                      onClick={handleStatusUpdate}
                      disabled={updatingStatus || selectedStatus === report.status}
                      className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                      {updatingStatus ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Updating...
                        </>
                      ) : (
                        'Update Status'
                      )}
                    </button>
                    {selectedStatus !== report.status && (
                      <p className="text-xs text-gray-500 text-center">
                        Changing from <strong>{getStatusDisplay(report.status)}</strong> to <strong>{getStatusDisplay(selectedStatus)}</strong>
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Report Metadata */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Report Information
                </h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Report ID:</span>
                    <span className="font-mono text-gray-900 text-xs">{report.id}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Created:</span>
                    <span className="text-gray-900">{formatDateTime(report.created_at)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Last Updated:</span>
                    <span className="text-gray-900">{formatDateTime(report.updated_at)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Reporter Role:</span>
                    <span className="text-gray-900 capitalize">{report.role_at_submission?.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Images Provided:</span>
                    <span className="text-gray-900">{report.images?.length || 0}</span>
                  </div>
                </div>
              </div>

              {/* Reporter Actions */}
              {isReporter && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Actions</h2>
                  <div className="space-y-3">
                    <button
                      onClick={() => navigate('/my-reports')}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors"
                    >
                      View My Reports
                    </button>
                    <button
                      onClick={() => navigate('/reports/create')}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors"
                    >
                      Report New Issue
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ReportDetail;