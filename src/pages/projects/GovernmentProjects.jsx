// src/pages/projects/GovernmentProjects.jsx - FIXED NAVIGATION
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import GovernmentProjectCard from '../../components/developments/GovernmentProjectCard';
import DevelopmentFilters from '../../components/developments/DevelopmentFilters';
import ProjectCreationModal from '../../components/projects/ProjectCreationModal';
import developmentService from '../../services/api/developmentService';
import locationService from '../../services/api/locationService';
import departmentService from '../../services/api/departmentService';

const GovernmentProjects = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();
  
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [counties, setCounties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [stats, setStats] = useState({});
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [creatingProject, setCreatingProject] = useState(false);
  const [filters, setFilters] = useState({
    county: '',
    department: '',
    status: '',
    search: ''
  });

  const canCreateProjects = user?.role === 'county_official' || 
                           user?.role === 'admin' || 
                           user?.role === 'superadmin';

  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      
      const projectsData = await developmentService.getGovernmentProjects(filters);
      
      console.log("Raw projects data:", projectsData);
      
      const projectsArray = Array.isArray(projectsData) 
        ? projectsData 
        : projectsData.results || projectsData.data || [];
      
      const developmentProjects = projectsArray.filter(
        project => project.is_development_showcase === true
      );
      
      console.log("Filtered development projects:", developmentProjects);
      
      setProjects(developmentProjects);
    } catch (error) {
      console.error('Failed to load government projects:', error);
      setProjects([]);
      showError('Failed to load government projects', 'Loading Error');
    } finally {
      setLoading(false);
    }
  }, [filters, showError]);

  // Load location data
  const loadLocationData = async () => {
    try {
      const [countiesData, departmentsData] = await Promise.all([
        locationService.getCounties(),
        departmentService.getDepartments()
      ]);
      setCounties(countiesData);
      setDepartments(departmentsData);
    } catch (error) {
      console.error('Failed to load location data:', error);
      setCounties([]);
      setDepartments([]);
      showError('Failed to load location data', 'Loading Error');
    }
  };

  // Load statistics
  const loadStats = async () => {
    try {
      const statsData = await developmentService.getDevelopmentStats();
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load development stats:', error);
      setStats({});
    }
  };

  // Handle project creation
  const handleCreateProject = async (projectData) => {
    try {
      setCreatingProject(true);
      await developmentService.createGovernmentProject(projectData);
      showSuccess('Government project created successfully', 'Project Created');
      setShowProjectModal(false);
      await loadProjects();
      await loadStats();
    } catch (error) {
      console.error('Failed to create project:', error);
      showError('Failed to create project', 'Creation Error');
      throw error;
    } finally {
      setCreatingProject(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  // FIXED: Handle project click - navigate to report detail
  const handleProjectClick = (project) => {
    console.log('Navigating to report:', project.id);
    navigate(`/reports/${project.id}`);
  };

  // FIXED: Handle comment click - navigate to report detail
  const handleCommentClick = (project) => {
    console.log('Comment clicked for project:', project.id);
    navigate(`/reports/${project.id}`);
  };

  const handleLikeProject = async (projectId) => {
    try {
      await developmentService.likeProject(projectId);
      setProjects(prevProjects => 
        prevProjects.map(project => 
          project.id === projectId 
            ? { 
                ...project, 
                likes_count: (project.likes_count || 0) + 1,
                current_user_liked: true 
              }
            : project
        )
      );
    } catch (error) {
      console.error('Failed to like project:', error);
      showError('Failed to like project', 'Action Failed');
    }
  };

  // Handle back navigation
  const handleBackClick = () => {
    navigate(-1);
  };

  // Initial data loading
  useEffect(() => {
    const initializeData = async () => {
      await Promise.all([
        loadProjects(),
        loadLocationData(),
        loadStats()
      ]);
    };

    initializeData();
  }, []);

  // Reload projects when filters change
  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  return (
    <DashboardLayout 
      title="Government Development Projects"
      subtitle="Track ongoing and completed government projects in your county"
      actions={
        <div className="flex gap-3">
          <button 
            onClick={handleBackClick}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-700 transition-colors text-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
          
          {canCreateProjects && (
            <button 
              onClick={() => setShowProjectModal(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors text-sm flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add New Project
            </button>
          )}
        </div>
      }
    >
      <div className="max-w-7xl mx-auto">
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center hover:shadow-md transition-shadow">
            <div className="text-2xl font-bold text-green-600 mb-2">
              {stats.completed_projects || 0}
            </div>
            <div className="text-gray-700 font-semibold">Completed</div>
            <div className="text-xs text-gray-500 mt-1">Successfully delivered projects</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center hover:shadow-md transition-shadow">
            <div className="text-2xl font-bold text-blue-600 mb-2">
              {stats.in_progress_projects || 0}
            </div>
            <div className="text-gray-700 font-semibold">In Progress</div>
            <div className="text-xs text-gray-500 mt-1">Currently under development</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center hover:shadow-md transition-shadow">
            <div className="text-2xl font-bold text-yellow-600 mb-2">
              {stats.planned_projects || 0}
            </div>
            <div className="text-gray-700 font-semibold">Planned</div>
            <div className="text-xs text-gray-500 mt-1">Approved and scheduled</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center hover:shadow-md transition-shadow">
            <div className="text-2xl font-bold text-purple-600 mb-2">
              {stats.total_projects || 0}
            </div>
            <div className="text-gray-700 font-semibold">Total Projects</div>
            <div className="text-xs text-gray-500 mt-1">All government initiatives</div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="mb-8">
          <DevelopmentFilters 
            filters={filters}
            onFilterChange={handleFilterChange}
            counties={counties}
            departments={departments}
          />
        </div>

        {/* Projects List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-4">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="flex space-x-4 p-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0"></div>
                    <div className="flex-1 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="h-2 bg-gray-200 rounded"></div>
                        <div className="h-2 bg-gray-200 rounded"></div>
                        <div className="h-2 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  </div>
                  {index < 2 && <div className="border-t border-gray-100"></div>}
                </div>
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No Projects Found</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {Object.values(filters).some(value => value) 
                  ? "No government projects match your current filters. Try adjusting your search criteria."
                  : "There are no government projects available at the moment."
                }
              </p>
              {Object.values(filters).some(value => value) && (
                <button
                  onClick={() => setFilters({ county: '', department: '', status: '', search: '' })}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {projects.map((project, index) => (
                <GovernmentProjectCard 
                  key={project.id}
                  project={project}
                  onCommentClick={() => handleCommentClick(project)}
                  onLike={() => handleLikeProject(project.id)}
                  onProjectClick={() => handleProjectClick(project)} // ADDED: Project click handler
                  isLast={index === projects.length - 1}
                />
              ))}
            </div>
          )}
        </div>

        {/* Project Creation Modal */}
        {showProjectModal && (
          <ProjectCreationModal
            isOpen={showProjectModal}
            onClose={() => setShowProjectModal(false)}
            onSubmit={handleCreateProject}
            departments={departments}
            assignedCounty={user?.county}
            loading={creatingProject}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default GovernmentProjects;