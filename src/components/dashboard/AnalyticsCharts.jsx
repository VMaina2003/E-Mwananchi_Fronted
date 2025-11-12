// src/components/dashboard/AnalyticsCharts.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const AnalyticsCharts = ({ stats }) => {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState('7d');

  // Simple chart data generator (replace with real data from your backend)
  const generateChartData = () => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 14;
    return Array.from({ length: days }, (_, i) => ({
      date: new Date(Date.now() - (days - i - 1) * 24 * 60 * 60 * 1000).toLocaleDateString('en-KE', { month: 'short', day: 'numeric' }),
      reports: Math.floor(Math.random() * 20) + 5,
      resolved: Math.floor(Math.random() * 15) + 2
    }));
  };

  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    setChartData(generateChartData());
  }, [timeRange]);

  const TimeRangeSelector = () => (
    <div className="flex space-x-2 mb-6">
      {[
        { key: '7d', label: '7 Days' },
        { key: '14d', label: '14 Days' },
        { key: '30d', label: '30 Days' }
      ].map(range => (
        <button
          key={range.key}
          onClick={() => setTimeRange(range.key)}
          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
            timeRange === range.key
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {range.label}
        </button>
      ))}
    </div>
  );

  // Simple bar chart component
  const SimpleBarChart = () => {
    const maxValue = Math.max(...chartData.map(d => Math.max(d.reports, d.resolved)));
    
    return (
      <div className="space-y-2">
        {chartData.map((day, index) => (
          <div key={index} className="flex items-center space-x-3">
            <div className="w-16 text-xs text-gray-500">{day.date}</div>
            <div className="flex-1 flex space-x-1">
              <div 
                className="bg-blue-500 rounded-l transition-all duration-500"
                style={{ width: `${(day.reports / maxValue) * 100}%`, height: '24px' }}
                title={`${day.reports} reports`}
              ></div>
              <div 
                className="bg-green-500 rounded-r transition-all duration-500"
                style={{ width: `${(day.resolved / maxValue) * 100}%`, height: '24px' }}
                title={`${day.resolved} resolved`}
              ></div>
            </div>
            <div className="w-20 text-xs text-gray-600 text-right">
              {day.reports}/{day.resolved}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Department distribution chart
  const DepartmentDistribution = () => {
    const departments = [
      { name: 'Roads & Transport', count: 45, color: 'bg-blue-500' },
      { name: 'Environment', count: 32, color: 'bg-green-500' },
      { name: 'Health', count: 28, color: 'bg-red-500' },
      { name: 'Education', count: 22, color: 'bg-purple-500' },
      { name: 'Water', count: 18, color: 'bg-teal-500' }
    ];

    const total = departments.reduce((sum, dept) => sum + dept.count, 0);

    return (
      <div className="space-y-3">
        {departments.map((dept, index) => (
          <div key={index} className="flex items-center space-x-3">
            <div className="w-32 text-sm text-gray-700 truncate">{dept.name}</div>
            <div className="flex-1 bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full ${dept.color} transition-all duration-1000`}
                style={{ width: `${(dept.count / total) * 100}%` }}
              ></div>
            </div>
            <div className="w-12 text-sm text-gray-600 text-right">{dept.count}</div>
          </div>
        ))}
      </div>
    );
  };

  // Status distribution chart
  const StatusDistribution = () => {
    const statusData = [
      { status: 'Resolved', count: stats?.system_overview?.total_reports ? Math.floor(stats.system_overview.total_reports * 0.6) : 45, color: 'bg-green-500' },
      { status: 'In Progress', count: stats?.system_overview?.total_reports ? Math.floor(stats.system_overview.total_reports * 0.25) : 20, color: 'bg-blue-500' },
      { status: 'Pending', count: stats?.system_overview?.total_reports ? Math.floor(stats.system_overview.total_reports * 0.15) : 12, color: 'bg-yellow-500' }
    ];

    return (
      <div className="flex flex-col items-center">
        <div className="relative w-32 h-32 mb-4">
          {/* Simple pie chart using conic gradient */}
          <div 
            className="w-full h-full rounded-full"
            style={{
              background: `conic-gradient(
                green 0% ${(statusData[0].count / (statusData[0].count + statusData[1].count + statusData[2].count)) * 100}%,
                blue ${(statusData[0].count / (statusData[0].count + statusData[1].count + statusData[2].count)) * 100}% ${((statusData[0].count + statusData[1].count) / (statusData[0].count + statusData[1].count + statusData[2].count)) * 100}%,
                yellow ${((statusData[0].count + statusData[1].count) / (statusData[0].count + statusData[1].count + statusData[2].count)) * 100}% 100%
              )`
            }}
          ></div>
        </div>
        <div className="space-y-2">
          {statusData.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded ${item.color}`}></div>
              <div className="text-sm text-gray-700">{item.status}</div>
              <div className="text-sm text-gray-500">({item.count})</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Reports Trend Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Reports Trend</h3>
          <TimeRangeSelector />
        </div>
        <div className="space-y-4">
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span className="text-gray-600">New Reports</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-gray-600">Resolved</span>
            </div>
          </div>
          <SimpleBarChart />
        </div>
      </div>

      {/* Department Distribution */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Department Distribution</h3>
        <DepartmentDistribution />
      </div>

      {/* Status Distribution */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 lg:col-span-2">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Report Status Distribution</h3>
        <div className="flex justify-center">
          <StatusDistribution />
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 lg:col-span-2">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Performance Metrics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {stats.performance_metrics?.resolution_rate || '0'}%
            </div>
            <div className="text-sm text-blue-700">Resolution Rate</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {stats.performance_metrics?.response_time_avg || '0'}h
            </div>
            <div className="text-sm text-green-700">Avg Response Time</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {stats.performance_metrics?.system_uptime || '0'}%
            </div>
            <div className="text-sm text-purple-700">System Uptime</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600 mb-1">
              {stats.user_analytics?.user_engagement_rate || '0'}%
            </div>
            <div className="text-sm text-orange-700">User Engagement</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsCharts;