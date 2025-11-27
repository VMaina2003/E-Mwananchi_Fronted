// src/components/projects/ProjectManagementPanel.jsx
import React, { useState } from 'react';
import ResponseModal from './ResponseModal';
import DepartmentAssignmentModal from './DepartmentAssignmentModal';
import PriorityUpdateModal from './PriorityUpdateModal';

const ProjectManagementPanel = ({
  reports = [],
  projects = [],
  selectedCounty,
  updatingStatus,
  onStatusUpdate,
  onAddResponse,
  onAssignDepartment,
  onUpdatePriority,
  departments = [],
  user,
  statusConfig = {},
  canManageCounty
}) => {
  const [selectedReport, setSelectedReport] = useState(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [showPriorityModal, setShowPriorityModal] = useState(false);

  // Check if user can manage the current report
  const canManageReport = (report) => {
    return canManageCounty(report.county?.id || report.county);
  };

  // Handle status update with permission check
  const handleStatusUpdate = (reportId, newStatus) => {
    const report = reports.find(r => r.id === reportId);
    if (!canManageReport(report)) {
      alert('You can only update reports from your assigned county.');
      return;
    }
    onStatusUpdate(reportId, newStatus);
  };

  // Handle adding response
  const handleAddResponse = (reportId, response) => {
    const report = reports.find(r => r.id === reportId);
    if (!canManageReport(report)) {
      alert('You can only respond to reports from your assigned county.');
      return;
    }
    onAddResponse(reportId, response);
    setShowResponseModal(false);
  };

  // Handle department assignment
  const handleAssignDepartment = (reportId, departmentId) => {
    const report = reports.find(r => r.id === reportId);
    if (!canManageReport(report)) {
      alert('You can only assign reports from your assigned county.');
      return;
    }
    onAssignDepartment(reportId, departmentId);
    setShowDepartmentModal(false);
  };

  // Handle priority update
  const handleUpdatePriority = (reportId, priority) => {
    const report = reports.find(r => r.id === reportId);
    if (!canManageReport(report)) {
      alert('You can only update priority for reports from your assigned county.');
      return;
    }
    onUpdatePriority(reportId, priority);
    setShowPriorityModal(false);
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get priority badge color
  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    return colors[priority] || colors.medium;
  };

  if (reports.length > 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Reports Header */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Reports for {selectedCounty?.name} County
          </h2>
          <p className="text-gray-600 mt-1">
            {reports.length} reports found
            {!canManageCounty(selectedCounty?.id) && (
              <span className="text-orange-600 ml-2">• View Only</span>
            )}
          </p>
        </div>

        {/* Reports List */}
        <div className="divide-y divide-gray-200">
          {reports.map((report) => {
            const canManage = canManageReport(report);
            const statusInfo = statusConfig[report.status] || { label: report.status, color: 'bg-gray-100 text-gray-800' };
            
            return (
              <div key={report.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{report.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${statusInfo.color} border`}>
                        {statusInfo.label}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(report.priority)}`}>
                        {report.priority?.toUpperCase() || 'MEDIUM'}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-3">{report.description}</p>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <span>Department: {report.department_name || 'Not assigned'}</span>
                      <span>Submitted: {formatDate(report.created_at)}</span>
                      <span>Likes: {report.likes_count || 0}</span>
                      <span>Views: {report.views_count || 0}</span>
                    </div>

                    {report.government_response && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <h4 className="text-sm font-semibold text-blue-900 mb-1">Official Response</h4>
                        <p className="text-sm text-blue-800">{report.government_response}</p>
                        {report.response_date && (
                          <p className="text-xs text-blue-600 mt-1">
                            Responded: {formatDate(report.response_date)}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
                  {/* Status Update Buttons */}
                  {statusInfo.actions && statusInfo.actions.map((action) => (
                    <button
                      key={action}
                      onClick={() => handleStatusUpdate(report.id, action)}
                      disabled={!canManage || updatingStatus === report.id}
                      className={`px-3 py-2 text-sm rounded-lg font-medium transition-colors ${
                        canManage
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      } disabled:opacity-50`}
                    >
                      {updatingStatus === report.id ? 'Updating...' : `Mark as ${action.replace('_', ' ')}`}
                    </button>
                  ))}

                  {/* Additional Actions */}
                  {canManage && (
                    <>
                      <button
                        onClick={() => {
                          setSelectedReport(report);
                          setShowResponseModal(true);
                        }}
                        className="px-3 py-2 text-sm bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                      >
                        Add Response
                      </button>

                      <button
                        onClick={() => {
                          setSelectedReport(report);
                          setShowDepartmentModal(true);
                        }}
                        className="px-3 py-2 text-sm bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
                      >
                        Assign Department
                      </button>

                      <button
                        onClick={() => {
                          setSelectedReport(report);
                          setShowPriorityModal(true);
                        }}
                        className="px-3 py-2 text-sm bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors"
                      >
                        Change Priority
                      </button>
                    </>
                  )}

                  {!canManage && (
                    <span className="text-sm text-gray-500 italic">
                      Read-only: This report is from another county
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modals */}
        <ResponseModal
          isOpen={showResponseModal}
          onClose={() => setShowResponseModal(false)}
          onSubmit={(response) => handleAddResponse(selectedReport?.id, response)}
          report={selectedReport}
        />

        <DepartmentAssignmentModal
          isOpen={showDepartmentModal}
          onClose={() => setShowDepartmentModal(false)}
          onSubmit={(departmentId) => handleAssignDepartment(selectedReport?.id, departmentId)}
          departments={departments}
          report={selectedReport}
        />

        <PriorityUpdateModal
          isOpen={showPriorityModal}
          onClose={() => setShowPriorityModal(false)}
          onSubmit={(priority) => handleUpdatePriority(selectedReport?.id, priority)}
          report={selectedReport}
        />
      </div>
    );
  }

  // Projects view would go here...
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Projects for {selectedCounty?.name} County
      </h2>
      {/* Projects implementation would go here */}
      <p className="text-gray-600">Projects management interface would be implemented here.</p>
    </div>
  );
};

export default ProjectManagementPanel;