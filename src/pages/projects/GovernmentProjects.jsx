// src/pages/projects/GovernmentProjects.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import GovernmentProjectCard from '../../components/developments/GovernmentProjectCard';
import DevelopmentFilters from '../../components/developments/DevelopmentFilters';
import developmentService from '../../services/api/developmentService';
import locationService from '../../services/api/locationService';

const GovernmentProjects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [counties, setCounties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [stats, setStats] = useState({});
  const [filters, setFilters] = useState({
    county: '',
    department: '',
    status: '',
    search: ''
  });

  useEffect(() => {
    loadProjects();
    loadLocationData();
    loadStats();
  }, [filters]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const projectsData = await developmentService.getGovernmentProjects(filters);
      setProjects(Array.isArray(projectsData) ? projectsData : projectsData.results || []);
    } catch (error) {
      console.error('Failed to load government projects:', error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const loadLocationData = async () => {
    try {
      const [countiesData, departmentsData] = await Promise.all([
        locationService.getCounties(),
        locationService.getDepartments()
      ]);
      setCounties(countiesData);
      setDepartments(departmentsData);
    } catch (error) {
      console.error('Failed to load location data:', error);
      setCounties([]);
      setDepartments([]);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await developmentService.getDevelopmentStats();
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load development stats:', error);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleCommentClick = (project) => {
    console.log('Comment clicked for project:', project.id);
  };

  const handleLikeProject = async (projectId) => {
    try {
      await developmentService.likeProject(projectId);
      // Reload projects to get updated like counts
      loadProjects();
    } catch (error) {
      console.error('Failed to like project:', error);
    }
  };

  return (
    <DashboardLayout 
      title="Government Development Projects"
      subtitle="Track ongoing and completed government projects in your county"
      actions={
        <div className="flex gap-3">
          {(user?.role === 'county_official' || user?.role === 'admin' || user?.role === 'superadmin') && (
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors text-sm">
              Add New Project
            </button>
          )}
        </div>
      }
    >
      <div className="max-w-7xl mx-auto">
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <div className="text-2xl font-bold text-green-600 mb-2">
              {stats.completed_projects || 0}
            </div>
            <div className="text-gray-700 font-semibold">Completed</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-2">
              {stats.in_progress_projects || 0}
            </div>
            <div className="text-gray-700 font-semibold">In Progress</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <div className="text-2xl font-bold text-yellow-600 mb-2">
              {stats.planned_projects || 0}
            </div>
            <div className="text-gray-700 font-semibold">Planned</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <div className="text-2xl font-bold text-purple-600 mb-2">
              {stats.total_projects || 0}
            </div>
            <div className="text-gray-700 font-semibold">Total Projects</div>
          </div>
        </div>

        {/* Filters */}
        <DevelopmentFilters 
          filters={filters}
          onFilterChange={handleFilterChange}
          counties={counties}
          departments={departments}
        />

        {/* Projects List */}
        <div className="mt-6">
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
                  <div className="flex space-x-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No Projects Found</h3>
              <p className="text-gray-600 mb-6">
                No government projects match your current filters. Try adjusting your search criteria.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
              {projects.map(project => (
                <GovernmentProjectCard 
                  key={project.id}
                  project={project}
                  onCommentClick={() => handleCommentClick(project)}
                  onLike={() => handleLikeProject(project.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default GovernmentProjects;