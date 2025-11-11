// src/components/dashboard/StatsCards.jsx - UPDATE THE USEEFFECT
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import dashboardService from '../../services/api/dashboardService'; // ADD THIS

const StatsCards = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // USE THE REAL API CALL
      const response = await dashboardService.getDashboardStats();
      setStats(response.data);
      
    } catch (err) {
      console.error('Error fetching dashboard statistics:', err);
      setError('Failed to load statistics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ... rest of your existing StatsCards code remains the same
};