// src/components/dashboard/QuickActions.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const QuickActions = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const actions = {
    citizen: [
      {
        label: 'Report New Issue',
        description: 'Submit a new community issue',
        icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        ),
        action: () => navigate('/reports/create'),
        color: 'bg-green-500 hover:bg-green-600'
      },
      {
        label: 'My Reports',
        description: 'View your submitted reports',
        icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        ),
        action: () => navigate('/my-reports'),
        color: 'bg-blue-500 hover:bg-blue-600'
      }
    ],
    county_official: [
      {
        label: 'Review Pending',
        description: 'Check reports awaiting action',
        icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        ),
        action: () => navigate('/reports?status=verified'),
        color: 'bg-orange-500 hover:bg-orange-600'
      },
      {
        label: 'Department Stats',
        description: 'View department performance',
        icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        ),
        action: () => navigate('/analytics/departments'),
        color: 'bg-purple-500 hover:bg-purple-600'
      }
    ]
  };

  const userActions = actions[user?.role] || actions.citizen;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      <div className="space-y-3">
        {userActions.map((action, index) => (
          <button
            key={index}
            onClick={action.action}
            className={`w-full flex items-center space-x-3 p-3 text-white rounded-lg transition-colors ${action.color}`}
          >
            <div className="flex-shrink-0">
              {action.icon}
            </div>
            <div className="text-left flex-1">
              <div className="font-medium">{action.label}</div>
              <div className="text-sm opacity-90">{action.description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;