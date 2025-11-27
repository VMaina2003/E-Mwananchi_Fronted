// hooks/useReports.js - FIXED VERSION
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import reportService from '../services/api/reportService';

export const useReports = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const createReport = async (reportData) => {
    setLoading(true);
    setError('');

    try {
      console.log("useReports: Sending data to reportService", {
        imageCount: reportData.images?.length || 0,
        hasImages: !!reportData.images,
        imagesType: typeof reportData.images
      });

      // Send data directly to reportService without transformation
      // The reportService will handle FormData creation properly
      const result = await reportService.createReport(reportData);
      
      if (result.success) {
        return { 
          success: true, 
          reportId: result.reportId, 
          data: result.data 
        };
      } else {
        return { 
          success: false, 
          error: result.error,
          details: result.details 
        };
      }
    } catch (err) {
      console.error("useReports: Error creating report:", err);
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.message ||
                          err.message ||
                          'Failed to create report. Please try again.';
      setError(errorMessage);
      return { 
        success: false, 
        error: errorMessage 
      };
    } finally {
      setLoading(false);
    }
  };

  // Local AI simulation for UI feedback only
  const analyzeReport = async (title, description) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const departmentKeywords = {
          'Health': [
            'hospital', 'clinic', 'doctor', 'medical', 'health', 'disease', 'sick',
            'medicine', 'patient', 'ambulance', 'healthcare', 'treatment', 'vaccine',
            'pharmacy', 'nurse', 'emergency'
          ],
          'Education': [
            'school', 'teacher', 'student', 'education', 'classroom', 'exam',
            'learning', 'university', 'college', 'primary', 'secondary', 'books',
            'curriculum', 'tuition', 'scholarship'
          ],
          'Roads and Transport': [
            'road', 'pothole', 'street', 'highway', 'bridge', 'traffic',
            'transport', 'vehicle', 'bus', 'matatu', 'road safety', 'accident',
            'speed bump', 'road repair', 'construction'
          ],
          'Environment and Water': [
            'water', 'pipe', 'drainage', 'sewage', 'flood', 'environment',
            'garbage', 'trash', 'pollution', 'clean', 'waste', 'conservation',
            'river', 'lake', 'sanitation', 'recycling'
          ],
          'Security': [
            'security', 'police', 'crime', 'theft', 'safety', 'robbery',
            'attack', 'violence', 'gang', 'protest', 'demonstration', 'law',
            'order', 'patrol'
          ],
          'Agriculture': [
            'farm', 'crop', 'livestock', 'agriculture', 'farmer', 'harvest',
            'fertilizer', 'irrigation', 'food', 'market', 'produce', 'animal'
          ],
          'Housing and Urban Planning': [
            'house', 'housing', 'building', 'construction', 'planning', 'urban',
            'settlement', 'estate', 'apartment', 'rent', 'land', 'property'
          ],
          'Trade and Industry': [
            'business', 'trade', 'industry', 'market', 'shop', 'commerce',
            'enterprise', 'investment', 'economic', 'development'
          ],
          'Finance and Economic Planning': [
            'finance', 'economic', 'budget', 'money', 'tax', 'revenue',
            'planning', 'development', 'funds', 'grant'
          ],
          'Public Service': [
            'service', 'public', 'government', 'administration', 'office',
            'official', 'citizen', 'service delivery', 'bureaucracy'
          ],
          'ICT and Innovation': [
            'technology', 'internet', 'computer', 'digital', 'innovation',
            'ICT', 'network', 'communication', 'software', 'hardware'
          ]
        };

        let predictedDepartment = null;
        let confidence = 0.3;
        let matchCount = 0;

        const text = (title + ' ' + description).toLowerCase();
        
        for (const [dept, deptKeywords] of Object.entries(departmentKeywords)) {
          const matches = deptKeywords.filter(keyword => text.includes(keyword.toLowerCase()));
          if (matches.length > 0) {
            const matchConfidence = matches.length / deptKeywords.length;
            const totalMatches = matches.length;
            
            if (matchConfidence > confidence || (matchConfidence === confidence && totalMatches > matchCount)) {
              confidence = matchConfidence;
              matchCount = totalMatches;
              predictedDepartment = dept;
            }
          }
        }

        if (matchCount >= 3) confidence = Math.min(confidence + 0.3, 0.95);
        else if (matchCount >= 2) confidence = Math.min(confidence + 0.2, 0.85);
        else if (matchCount >= 1) confidence = Math.min(confidence + 0.1, 0.75);

        confidence = Math.max(0.3, Math.min(0.95, confidence));

        resolve({
          verified: confidence > 0.6,
          confidence: parseFloat(confidence.toFixed(2)),
          predicted_department: predictedDepartment,
          predicted_county: null,
          match_count: matchCount,
          source: 'local_simulation'
        });
      }, 800);
    });
  };

  const getReports = async (params = {}) => {
    setLoading(true);
    try {
      return await reportService.getReports(params);
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.message ||
                          'Failed to fetch reports';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateReportStatus = async (reportId, status) => {
    setLoading(true);
    try {
      return await reportService.updateReportStatus(reportId, status);
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.message ||
                          'Failed to update report status';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteReport = async (reportId) => {
    setLoading(true);
    try {
      return await reportService.deleteReport(reportId);
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.message ||
                          'Failed to delete report';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getReportStats = async () => {
    setLoading(true);
    try {
      return await reportService.getReportStats();
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.message ||
                          'Failed to fetch report statistics';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createReport,
    analyzeReport,
    getReports,
    updateReportStatus,
    deleteReport,
    getReportStats,
    loading,
    error,
    clearError: () => setError(''),
  };
};