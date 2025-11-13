// // src/pages/dashboard/OfficialDashboard.jsx
// import React, { useState, useEffect, useCallback } from 'react';
// import { useAuth } from '../../context/AuthContext';
// import { useNotification } from '../../context/NotificationContext';
// import { useNavigate } from 'react-router-dom';
// import Header from '../../components/common/Header';
// import Footer from '../../components/common/Footer';
// import reportService from '../../services/api/reportService';
// import locationService from '../../services/api/locationService';
// import departmentService from '../../services/api/departmentService';

// const OfficialDashboard = () => {
//   const { user } = useAuth();
//   const { showSuccess, showError } = useNotification();
//   const navigate = useNavigate();
  
//   const [activeTab, setActiveTab] = useState('verified');
//   const [selectedCounty, setSelectedCounty] = useState(null);
//   const [counties, setCounties] = useState([]);
//   const [reports, setReports] = useState([]);
//   const [departments, setDepartments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [updatingStatus, setUpdatingStatus] = useState(null);
//   const [stats, setStats] = useState({
//     total: 0,
//     verified: 0,
//     noted: 0,
//     on_progress: 0,
//     resolved: 0
//   });

//   // Helper function to check if user can access official dashboard
//   const canAccessOfficialDashboard = () => {
//     if (!user) return false;
    
//     // Check using the role string directly
//     const userRole = user.role;
//     return userRole === 'county_official' || userRole === 'admin' || userRole === 'superadmin';
//   };

//   // Helper function to check if user can manage multiple counties
//   const canManageMultipleCounties = () => {
//     if (!user) return false;
//     const userRole = user.role;
//     return userRole === 'admin' || userRole === 'superadmin';
//   };

//   // Status configuration matching your Django model
//   const STATUS_CONFIG = {
//     submitted: { 
//       label: 'Submitted', 
//       color: 'bg-gray-100 text-gray-800 border-gray-200',
//       actions: []
//     },
//     verified: { 
//       label: 'Verified (AI Confirmed)', 
//       color: 'bg-blue-100 text-blue-800 border-blue-200',
//       actions: ['noted', 'on_progress', 'resolved']
//     },
//     pending: { 
//       label: 'Pending Review', 
//       color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
//       actions: ['verified', 'noted']
//     },
//     noted: { 
//       label: 'Noted', 
//       color: 'bg-purple-100 text-purple-800 border-purple-200',
//       actions: ['on_progress', 'resolved']
//     },
//     on_progress: { 
//       label: 'On Progress', 
//       color: 'bg-orange-100 text-orange-800 border-orange-200',
//       actions: ['resolved', 'noted']
//     },
//     resolved: { 
//       label: 'Resolved', 
//       color: 'bg-green-100 text-green-800 border-green-200',
//       actions: ['on_progress']
//     },
//     rejected: { 
//       label: 'Rejected', 
//       color: 'bg-red-100 text-red-800 border-red-200',
//       actions: ['verified']
//     }
//   };

//   // Action labels for buttons
//   const ACTION_LABELS = {
//     noted: 'Mark as Noted',
//     on_progress: 'Start Work',
//     resolved: 'Mark Resolved',
//     verified: 'Verify Report',
//     rejected: 'Reject Report'
//   };

//   // Load dashboard data
//   const loadDashboardData = useCallback(async () => {
//     try {
//       setLoading(true);
      
//       // Load all counties for the official to access
//       const countiesData = await locationService.getAllCounties(); // Changed to getAllCounties
//       setCounties(countiesData);
      
//       // Set initial selected county - prioritize user's assigned county, then first available
//       if (countiesData.length > 0) {
//         let initialCounty = countiesData[0];
        
//         if (user?.county) {
//           // Try to find the user's assigned county in the available counties
//           const userCounty = countiesData.find(c => c.id === user.county.id);
//           if (userCounty) {
//             initialCounty = userCounty;
//           }
//         }
        
//         setSelectedCounty(initialCounty);
//       }
      
//       // Load departments for filtering and display
//       const departmentsData = await departmentService.getDepartments();
//       setDepartments(departmentsData);
      
//     } catch (error) {
//       console.error('Failed to load dashboard data:', error);
//       showError('Failed to load dashboard data. Please try again.', 'Loading Error');
//     } finally {
//       setLoading(false);
//     }
//   }, [user, showError]);

//   // Load reports for specific county
//   const loadCountyReports = async (countyId) => {
//     try {
//       const params = { county: countyId };
//       const reportsData = await reportService.getReports(params);
//       const reportsArray = Array.isArray(reportsData) ? reportsData : reportsData.results || reportsData.data || [];
//       setReports(reportsArray);
//       calculateStats(reportsArray);
//     } catch (error) {
//       console.error('Error loading county reports:', error);
//       // If we get a 403 or other error, try to load without county filter
//       if (error.response?.status === 403 || error.response?.status === 400) {
//         try {
//           const allReportsData = await reportService.getReports();
//           const allReportsArray = Array.isArray(allReportsData) ? allReportsData : allReportsData.results || allReportsData.data || [];
//           setReports(allReportsArray);
//           calculateStats(allReportsArray);
//           showSuccess('Showing all available reports', 'Info');
//         } catch (fallbackError) {
//           throw fallbackError;
//         }
//       } else {
//         throw error;
//       }
//     }
//   };

//   // Calculate statistics from reports
//   const calculateStats = (reportsArray) => {
//     const stats = {
//       total: reportsArray.length,
//       verified: reportsArray.filter(r => r.status === 'verified').length,
//       noted: reportsArray.filter(r => r.status === 'noted').length,
//       on_progress: reportsArray.filter(r => r.status === 'on_progress').length,
//       resolved: reportsArray.filter(r => r.status === 'resolved').length
//     };
//     setStats(stats);
//   };

//   useEffect(() => {
//     if (canAccessOfficialDashboard()) {
//       loadDashboardData();
//     }
//   }, [loadDashboardData]);

//   useEffect(() => {
//     if (selectedCounty && canAccessOfficialDashboard()) {
//       loadCountyReports(selectedCounty.id);
//     }
//   }, [selectedCounty]);

//   // Handle report status updates
//   const handleStatusUpdate = async (reportId, newStatus) => {
//     try {
//       setUpdatingStatus(reportId);
//       await reportService.updateReportStatus(reportId, newStatus);
      
//       const statusMessages = {
//         'noted': 'Report marked as noted',
//         'on_progress': 'Work started on report',
//         'resolved': 'Report marked as resolved',
//         'verified': 'Report verified successfully',
//         'rejected': 'Report rejected'
//       };
      
//       showSuccess(statusMessages[newStatus] || 'Status updated successfully', 'Report Updated');
      
//       // Reload reports to reflect changes
//       if (selectedCounty) {
//         await loadCountyReports(selectedCounty.id);
//       }
//     } catch (error) {
//       console.error('Failed to update report status:', error);
//       showError('Failed to update report status. Please try again.', 'Update Error');
//     } finally {
//       setUpdatingStatus(null);
//     }
//   };

//   // Handle county change
//   const handleCountyChange = (county) => {
//     setSelectedCounty(county);
//     setReports([]);
//   };

//   // Filter reports based on active tab
//   const getFilteredReports = () => {
//     if (activeTab === 'all') return reports;
//     return reports.filter(report => report.status === activeTab);
//   };

//   // Get available actions for a report
//   const getAvailableActions = (report) => {
//     return STATUS_CONFIG[report.status]?.actions || [];
//   };

//   // Show access denied if user cannot access official dashboard
//   if (!user || !canAccessOfficialDashboard()) {
//     console.log('User object:', user); // Debug log
//     console.log('User role:', user?.role); // Debug log
//     return (
//       <div className="min-h-screen bg-gray-50 flex flex-col">
//         <Header />
//         <main className="flex-grow flex items-center justify-center">
//           <div className="text-center max-w-md mx-auto p-8 bg-white rounded-xl shadow-lg border border-red-100">
//             <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
//               <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
//               </svg>
//             </div>
//             <h2 className="text-2xl font-bold text-red-600 mb-2">Access Restricted</h2>
//             <p className="text-gray-600 mb-4">
//               This dashboard is only accessible to county officials and administrators.
//             </p>
//             <p className="text-sm text-gray-500 mb-6">
//               Your current role: <span className="font-medium">{user?.role || 'Not logged in'}</span>
//             </p>
//             <button
//               onClick={() => navigate('/dashboard')}
//               className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
//             >
//               Return to Dashboard
//             </button>
//           </div>
//         </main>
//         <Footer />
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 flex flex-col">
//       <Header />
      
//       <main className="flex-grow">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//           {/* Header Section */}
//           <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
//             <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
//               <div className="flex items-center space-x-4">
//                 <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
//                   <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
//                   </svg>
//                 </div>
//                 <div>
//                   <h1 className="text-3xl font-bold text-gray-900">County Official Dashboard</h1>
//                   <p className="text-gray-600 mt-2">
//                     Welcome, {user.first_name} {user.last_name}
//                     {user.county && ` • Assigned to ${user.county.name} County`}
//                     {!user.county && user.role === 'county_official' && ` • Multi-County Access`}
//                   </p>
//                   <p className="text-sm text-gray-500 mt-1">
//                     Manage reports, track progress, and provide government responses
//                   </p>
//                 </div>
//               </div>
              
//               <div className="flex flex-wrap gap-3">
//                 <button
//                   onClick={() => navigate('/reports/create')}
//                   className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors shadow-sm"
//                 >
//                   Create Development Report
//                 </button>
//                 <button
//                   onClick={loadDashboardData}
//                   className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
//                 >
//                   Refresh Data
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* County Selector - Show for all officials who can access multiple counties */}
//           {(canManageMultipleCounties() || !user.county) && counties.length > 0 && (
//             <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
//               <h3 className="text-lg font-semibold text-gray-900 mb-4">
//                 {user.county ? 'Manage County' : 'Select County to Manage'}
//               </h3>
//               <div className="flex flex-wrap gap-3">
//                 {counties.map((county) => (
//                   <button
//                     key={county.id}
//                     onClick={() => handleCountyChange(county)}
//                     className={`px-4 py-2 rounded-lg font-medium transition-colors ${
//                       selectedCounty?.id === county.id
//                         ? 'bg-blue-600 text-white shadow-md'
//                         : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//                     }`}
//                   >
//                     {county.name} County
//                     {user.county?.id === county.id && ' (Assigned)'}
//                   </button>
//                 ))}
//               </div>
//               {!user.county && (
//                 <p className="text-sm text-gray-600 mt-3">
//                   You are currently viewing reports from {selectedCounty?.name} County. 
//                   Contact administration to get officially assigned to a specific county.
//                 </p>
//               )}
//             </div>
//           )}

//           {loading ? (
//             <div className="flex justify-center items-center h-64">
//               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//             </div>
//           ) : selectedCounty ? (
//             <>
//               {/* Statistics Overview */}
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
//                 <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <p className="text-sm font-medium text-gray-600">Total Reports</p>
//                       <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
//                     </div>
//                     <div className="p-3 bg-blue-100 rounded-lg">
//                       <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                       </svg>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <p className="text-sm font-medium text-gray-600">Verified</p>
//                       <p className="text-3xl font-bold text-gray-900 mt-1">{stats.verified}</p>
//                     </div>
//                     <div className="p-3 bg-blue-100 rounded-lg">
//                       <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
//                       </svg>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <p className="text-sm font-medium text-gray-600">Noted</p>
//                       <p className="text-3xl font-bold text-gray-900 mt-1">{stats.noted}</p>
//                     </div>
//                     <div className="p-3 bg-purple-100 rounded-lg">
//                       <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                       </svg>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <p className="text-sm font-medium text-gray-600">In Progress</p>
//                       <p className="text-3xl font-bold text-gray-900 mt-1">{stats.on_progress}</p>
//                     </div>
//                     <div className="p-3 bg-orange-100 rounded-lg">
//                       <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
//                       </svg>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <p className="text-sm font-medium text-gray-600">Resolved</p>
//                       <p className="text-3xl font-bold text-gray-900 mt-1">{stats.resolved}</p>
//                     </div>
//                     <div className="p-3 bg-green-100 rounded-lg">
//                       <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//                       </svg>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Navigation Tabs */}
//               <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
//                 <div className="flex flex-wrap gap-2">
//                   {[
//                     { key: 'all', label: 'All Reports', count: stats.total },
//                     { key: 'verified', label: 'Verified', count: stats.verified },
//                     { key: 'noted', label: 'Noted', count: stats.noted },
//                     { key: 'on_progress', label: 'In Progress', count: stats.on_progress },
//                     { key: 'resolved', label: 'Resolved', count: stats.resolved }
//                   ].map(tab => (
//                     <button
//                       key={tab.key}
//                       onClick={() => setActiveTab(tab.key)}
//                       className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium text-sm transition-colors ${
//                         activeTab === tab.key
//                           ? 'bg-blue-600 text-white shadow-sm'
//                           : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//                       }`}
//                     >
//                       <span>{tab.label}</span>
//                       <span className={`px-2 py-1 rounded-full text-xs ${
//                         activeTab === tab.key
//                           ? 'bg-blue-500 text-white'
//                           : 'bg-gray-300 text-gray-700'
//                       }`}>
//                         {tab.count}
//                       </span>
//                     </button>
//                   ))}
//                 </div>
//               </div>

//               {/* Reports List */}
//               <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
//                 {getFilteredReports().length > 0 ? (
//                   <div className="divide-y divide-gray-200">
//                     {getFilteredReports().map(report => (
//                       <div key={report.id} className="p-6 hover:bg-gray-50 transition-colors">
//                         <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
//                           <div className="flex-1">
//                             <div className="flex items-start justify-between mb-3">
//                               <div>
//                                 <h3 className="text-xl font-semibold text-gray-900 mb-1">{report.title}</h3>
//                                 <div className="flex flex-wrap gap-2 mb-2">
//                                   <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_CONFIG[report.status]?.color || 'bg-gray-100 text-gray-800'}`}>
//                                     {STATUS_CONFIG[report.status]?.label || report.status}
//                                   </span>
//                                   {report.department && (
//                                     <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
//                                       {report.department.department?.name || report.department.name || 'Department'}
//                                     </span>
//                                   )}
//                                   {report.verified_by_ai && (
//                                     <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
//                                       AI Verified ({(report.ai_confidence * 100).toFixed(0)}%)
//                                     </span>
//                                   )}
//                                   {report.is_development_showcase && (
//                                     <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
//                                       Development Showcase
//                                     </span>
//                                   )}
//                                 </div>
//                               </div>
//                             </div>
                            
//                             <p className="text-gray-700 mb-4 leading-relaxed">{report.description}</p>
                            
//                             {/* Location Information */}
//                             <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
//                               <div className="flex items-center space-x-1">
//                                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
//                                 </svg>
//                                 <span>
//                                   {[report.ward?.name, report.subcounty?.name, report.county?.name]
//                                     .filter(Boolean)
//                                     .join(', ')}
//                                 </span>
//                               </div>
//                               <div className="flex items-center space-x-1">
//                                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
//                                 </svg>
//                                 <span>By {report.reporter?.first_name} {report.reporter?.last_name}</span>
//                               </div>
//                               <div className="flex items-center space-x-1">
//                                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
//                                 </svg>
//                                 <span>{new Date(report.created_at).toLocaleDateString('en-KE')}</span>
//                               </div>
//                             </div>

//                             {/* Engagement Metrics */}
//                             <div className="flex items-center space-x-6 text-sm text-gray-500">
//                               <span>Views: {report.views_count || 0}</span>
//                               <span>Likes: {report.likes_count || 0}</span>
//                               <span>Comments: {report.comments_count || 0}</span>
//                             </div>

//                             {/* Government Response */}
//                             {report.government_response && (
//                               <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
//                                 <h4 className="font-semibold text-blue-900 mb-2">Government Response</h4>
//                                 <p className="text-blue-800 text-sm">{report.government_response}</p>
//                                 {report.responded_by && (
//                                   <p className="text-blue-600 text-xs mt-2">
//                                     By {report.responded_by.first_name} {report.responded_by.last_name} on{' '}
//                                     {new Date(report.response_date).toLocaleDateString('en-KE')}
//                                   </p>
//                                 )}
//                               </div>
//                             )}
//                           </div>

//                           {/* Action Buttons */}
//                           <div className="flex flex-col space-y-2 min-w-[200px]">
//                             {getAvailableActions(report).map(action => (
//                               <button
//                                 key={action}
//                                 onClick={() => handleStatusUpdate(report.id, action)}
//                                 disabled={updatingStatus === report.id}
//                                 className={`px-4 py-2 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
//                                   action === 'resolved' ? 'bg-green-600 hover:bg-green-700' :
//                                   action === 'on_progress' ? 'bg-orange-600 hover:bg-orange-700' :
//                                   action === 'noted' ? 'bg-purple-600 hover:bg-purple-700' :
//                                   action === 'verified' ? 'bg-blue-600 hover:bg-blue-700' :
//                                   'bg-gray-600 hover:bg-gray-700'
//                                 }`}
//                               >
//                                 {updatingStatus === report.id ? 'Updating...' : ACTION_LABELS[action]}
//                               </button>
//                             ))}
                            
//                             <button
//                               onClick={() => navigate(`/reports/${report.id}`)}
//                               className="bg-gray-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors"
//                             >
//                               View Details
//                             </button>

//                             {/* Add Government Response Button */}
//                             {!report.government_response && (
//                               <button
//                                 onClick={() => navigate(`/reports/${report.id}/response`)}
//                                 className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
//                               >
//                                 Add Response
//                               </button>
//                             )}
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 ) : (
//                   <div className="p-12 text-center">
//                     <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                     </svg>
//                     <h3 className="text-2xl font-bold text-gray-900 mb-3">No Reports Found</h3>
//                     <p className="text-gray-600 mb-8 text-lg">
//                       {selectedCounty 
//                         ? `There are currently no ${activeTab === 'all' ? '' : activeTab + ' '}reports in ${selectedCounty.name} County.`
//                         : 'Please select a county to view reports.'
//                       }
//                     </p>
//                     <button
//                       onClick={() => setActiveTab('all')}
//                       className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
//                     >
//                       View All Reports
//                     </button>
//                   </div>
//                 )}
//               </div>
//             </>
//           ) : (
//             <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
//               <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
//               </svg>
//               <h3 className="text-2xl font-bold text-gray-900 mb-3">No County Available</h3>
//               <p className="text-gray-600 mb-8 text-lg">
//                 There are no counties available for management at this time.
//               </p>
//             </div>
//           )}
//         </div>
//       </main>

//       <Footer />
//     </div>
//   );
// };

// export default OfficialDashboard;

// src/pages/dashboard/OfficialDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import ReportFeed from '../../components/dashboard/ReportFeed';
import locationService from '../../services/api/locationService';
import reportService from '../../services/api/reportService';

const OfficialDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [counties, setCounties] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalReports: 0,
    resolvedReports: 0,
    pendingReports: 0,
    myCountyReports: 0
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load counties - use getCounties instead of getAllCounties
      const countiesData = await locationService.getCounties();
      setCounties(countiesData);

      // Load report statistics
      const reportStats = await reportService.getReportStats();
      setStats({
        totalReports: reportStats.total_reports || 0,
        resolvedReports: reportStats.resolved_reports || 0,
        pendingReports: reportStats.pending_reports || 0,
        myCountyReports: reportStats.county_total_reports || 0
      });

      // Load recent activity
      const recentReports = await reportService.getReports({ 
        limit: 5, 
        ordering: '-created_at' 
      });
      setRecentActivity(recentReports.results || recentReports);

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReport = () => {
    navigate('/reports/create');
  };

  const handleViewAllReports = () => {
    navigate('/browse-reports');
  };

  const handleViewMyCountyReports = () => {
    if (user?.county) {
      navigate(`/browse-reports?county=${user.county.id}`);
    } else {
      navigate('/browse-reports');
    }
  };

  const handleEmergencyContact = () => {
    window.open('tel:999', '_self');
  };

  // Get assigned county name
  const getAssignedCounty = () => {
    if (user?.county) {
      return typeof user.county === 'object' ? user.county.name : user.county;
    }
    return 'Multiple Counties';
  };

  return (
    <DashboardLayout 
      title="Official Dashboard"
      subtitle={`Welcome back, ${user?.first_name || 'Official'}. Manage reports for ${getAssignedCounty()}.`}
      actions={
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleViewMyCountyReports}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm"
          >
            My County Reports
          </button>
          <button
            onClick={handleCreateReport}
            className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors text-sm"
          >
            Report Issue
          </button>
        </div>
      }
    >
      <div className="max-w-7xl mx-auto">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6 text-center hover:shadow-xl transition-shadow duration-200">
            <div className="text-3xl font-bold text-blue-600 mb-2">{stats.myCountyReports}</div>
            <div className="text-gray-700 font-semibold">My County Reports</div>
            <div className="text-sm text-gray-500 mt-1">Assigned to your county</div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-6 text-center hover:shadow-xl transition-shadow duration-200">
            <div className="text-3xl font-bold text-green-600 mb-2">{stats.resolvedReports}</div>
            <div className="text-gray-700 font-semibold">Resolved</div>
            <div className="text-sm text-gray-500 mt-1">Issues Fixed</div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg border border-orange-100 p-6 text-center hover:shadow-xl transition-shadow duration-200">
            <div className="text-3xl font-bold text-orange-600 mb-2">{stats.pendingReports}</div>
            <div className="text-gray-700 font-semibold">Pending</div>
            <div className="text-sm text-gray-500 mt-1">Awaiting Action</div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg border border-purple-100 p-6 text-center hover:shadow-xl transition-shadow duration-200">
            <div className="text-3xl font-bold text-purple-600 mb-2">{stats.totalReports}</div>
            <div className="text-gray-700 font-semibold">Total Reports</div>
            <div className="text-sm text-gray-500 mt-1">Platform Wide</div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Reports Feed - Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Reports for Your County</h2>
              <ReportFeed 
                showFilters={true}
                limit={10}
                initialFilters={{
                  county: user?.county?.id || '',
                  ordering: '-created_at'
                }}
                enableInteractions={true}
              />
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-green-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button
                  onClick={handleViewMyCountyReports}
                  className="w-full bg-blue-600 text-white text-center py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  View County Reports
                </button>
                <button
                  onClick={handleCreateReport}
                  className="w-full bg-green-600 text-white text-center py-3 rounded-xl font-semibold hover:bg-green-700 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Create New Report
                </button>
                <button
                  onClick={handleViewAllReports}
                  className="w-full bg-gray-600 text-white text-center py-3 rounded-xl font-semibold hover:bg-gray-700 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Browse All Reports
                </button>
                <button
                  onClick={handleEmergencyContact}
                  className="w-full bg-red-600 text-white text-center py-3 rounded-xl font-semibold hover:bg-red-700 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Emergency Contact
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl border border-blue-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Recent Activity
              </h3>
              <div className="space-y-3">
                {loading ? (
                  <div className="animate-pulse space-y-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex space-x-3">
                        <div className="w-2 h-2 bg-gray-200 rounded-full mt-2"></div>
                        <div className="flex-1 space-y-1">
                          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : recentActivity.length > 0 ? (
                  recentActivity.slice(0, 5).map(activity => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 line-clamp-2">{activity.title}</p>
                        <p className="text-xs text-gray-500">
                          {activity.county_name} • {new Date(activity.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm text-center py-4">No recent activity</p>
                )}
              </div>
            </div>

            {/* County Information */}
            <div className="bg-white rounded-xl border border-purple-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                County Information
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Assigned County:</span>
                  <span className="text-sm font-semibold text-gray-900">{getAssignedCounty()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Counties:</span>
                  <span className="text-sm font-semibold text-gray-900">{counties.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Your Role:</span>
                  <span className="text-sm font-semibold text-gray-900 capitalize">
                    {user?.role?.replace('_', ' ') || 'Official'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default OfficialDashboard;