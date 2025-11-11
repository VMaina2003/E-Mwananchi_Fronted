import React from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import StatsCards from '../../components/dashboard/StatsCards';
import ReportFeed from '../../components/dashboard/ReportFeed';
import RecentActivity from '../../components/dashboard/RecentActivity';

const MainDashboard = () => {
  const { user } = useAuth();

  const getDashboardTitle = () => {
    const titles = {
      citizen: 'Citizen Dashboard',
      county_official: 'County Official Dashboard', 
      admin: 'Administrator Dashboard',
      superadmin: 'System Administrator Dashboard',
      viewer: 'Public Dashboard'
    };
    return titles[user?.role] || 'E-Mwananchi Dashboard';
  };

  const getDashboardSubtitle = () => {
    const subtitles = {
      citizen: 'Monitor your reports and community issues',
      county_official: 'Manage county reports and track progress',
      admin: 'System overview and administration',
      superadmin: 'Complete system management and analytics',
      viewer: 'Browse community reports and developments'
    };
    return subtitles[user?.role] || 'Community reporting platform';
  };

  return (
    <DashboardLayout 
      title={getDashboardTitle()}
      subtitle={getDashboardSubtitle()}
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content - 3/4 width */}
        <div className="lg:col-span-3 space-y-6">
          <StatsCards />
          <ReportFeed 
            showFilters={true}
            limit={10}
          />
        </div>
        
        {/* Sidebar - 1/4 width */}
        <div className="space-y-6">
          <RecentActivity 
            limit={8}
            showHeader={true}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MainDashboard;