// src/pages/dashboard/MainDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import StatsCards from '../../components/dashboard/StatsCards';
import ReportFeed from '../../components/dashboard/ReportFeed';
import RecentActivity from '../../components/dashboard/RecentActivity';
import AnalyticsCharts from '../../components/dashboard/AnalyticsCharts';
import dashboardService from '../../services/api/dashboardService';

const MainDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await dashboardService.getProfessionalStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

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
      {!loading && stats && (
        <>
          <StatsCards />
          
          {/* Analytics Charts - Show for admin/superadmin roles */}
          {(user?.is_admin || user?.is_superadmin) && (
            <AnalyticsCharts stats={stats} />
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Content - 3/4 width */}
            <div className="lg:col-span-3 space-y-6">
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
        </>
      )}

      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default MainDashboard;