import React, { useState, useEffect, useRef } from 'react';

const DetailsSection = ({
  formData,
  setFormData,
  onAnalysisUpdate,
  departments,
  loadingDepartments,
  validationErrors
}) => {
  const [aiThinking, setAiThinking] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState(null);
  const [userHasInteracted, setUserHasInteracted] = useState(false);
  const [analysisEnabled, setAnalysisEnabled] = useState(true);
  const [showAIPanel, setShowAIPanel] = useState(false);
  
  const analysisTimeoutRef = useRef(null);
  const lastTitleRef = useRef('');
  const lastDescriptionRef = useRef('');

  // Reset analysis when user manually selects a department
  useEffect(() => {
    if (formData.department && lastAnalysis) {
      setAnalysisEnabled(false);
      setShowAIPanel(false);
    }
  }, [formData.department, lastAnalysis]);

  // Debounced AI analysis with better controls
  useEffect(() => {
    // Clear any existing timeout
    if (analysisTimeoutRef.current) {
      clearTimeout(analysisTimeoutRef.current);
    }

    // Don't analyze if disabled or no meaningful content
    if (!analysisEnabled || !formData.title || !formData.description) {
      return;
    }

    // Don't analyze if content hasn't changed significantly
    if (formData.title === lastTitleRef.current && formData.description === lastDescriptionRef.current) {
      return;
    }

    // Minimum content requirements
    if (formData.title.length < 3 || formData.description.length < 10) {
      return;
    }

    // Set timeout for analysis
    analysisTimeoutRef.current = setTimeout(async () => {
      setAiThinking(true);
      setShowAIPanel(true);
      
      try {
        const analysis = await onAnalysisUpdate(formData.title, formData.description);
        setLastAnalysis(analysis);
        
        // Store current content to avoid re-analysis
        lastTitleRef.current = formData.title;
        lastDescriptionRef.current = formData.description;
        
        // Auto-select only if no department selected and high confidence
        if (analysis && 
            analysis.confidence >= 0.7 && 
            analysis.predicted_department && 
            !formData.department &&
            analysisEnabled) {
          const matchedDept = departments.find(
            dept => dept.name === analysis.predicted_department
          );
          if (matchedDept) {
            setFormData(prev => ({ ...prev, department: matchedDept.id }));
          }
        }
      } catch (error) {
        console.error('AI analysis failed:', error);
      } finally {
        setAiThinking(false);
      }
    }, 2000); // 2 second delay

    return () => {
      if (analysisTimeoutRef.current) {
        clearTimeout(analysisTimeoutRef.current);
      }
    };
  }, [formData.title, formData.description, analysisEnabled, onAnalysisUpdate, setFormData, departments, formData.department]);

  const handleTitleChange = (e) => {
    setFormData(prev => ({ ...prev, title: e.target.value }));
    setUserHasInteracted(true);
  };

  const handleDescriptionChange = (e) => {
    setFormData(prev => ({ ...prev, description: e.target.value }));
    setUserHasInteracted(true);
  };

  const handleDepartmentChange = (e) => {
    const selectedValue = e.target.value;
    setFormData(prev => ({ ...prev, department: selectedValue }));
    
    // When user manually selects a department, disable AI auto-selection
    if (selectedValue) {
      setAnalysisEnabled(false);
      setShowAIPanel(false);
    } else {
      // If user clears selection, re-enable AI
      setAnalysisEnabled(true);
    }
  };

  const enableAIAnalysis = () => {
    setAnalysisEnabled(true);
    setShowAIPanel(true);
    
    // Trigger immediate analysis if we have content
    if (formData.title && formData.description) {
      if (analysisTimeoutRef.current) {
        clearTimeout(analysisTimeoutRef.current);
      }
      analysisTimeoutRef.current = setTimeout(async () => {
        setAiThinking(true);
        try {
          const analysis = await onAnalysisUpdate(formData.title, formData.description);
          setLastAnalysis(analysis);
        } catch (error) {
          console.error('AI analysis failed:', error);
        } finally {
          setAiThinking(false);
        }
      }, 500);
    }
  };

  const disableAIAnalysis = () => {
    setAnalysisEnabled(false);
    setShowAIPanel(false);
    setLastAnalysis(null);
    
    if (analysisTimeoutRef.current) {
      clearTimeout(analysisTimeoutRef.current);
    }
  };

  const applyAISuggestion = () => {
    if (lastAnalysis && lastAnalysis.predicted_department) {
      const matchedDept = departments.find(
        dept => dept.name === lastAnalysis.predicted_department
      );
      if (matchedDept) {
        setFormData(prev => ({ ...prev, department: matchedDept.id }));
        setAnalysisEnabled(false);
        setShowAIPanel(false);
      }
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-50 border-green-200';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getConfidenceText = (confidence) => {
    if (confidence >= 0.8) return 'High Confidence';
    if (confidence >= 0.6) return 'Medium Confidence';
    return 'Low Confidence';
  };

  const getConfidenceIcon = (confidence) => {
    if (confidence >= 0.8) return '✅';
    if (confidence >= 0.6) return '⚠️';
    return '❌';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Report Details</h2>
      
      {/* AI Control Panel */}
      <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-900">AI Department Assistant</h3>
            <p className="text-sm text-gray-600">Get AI suggestions for the most relevant department</p>
          </div>
          <div className="flex items-center gap-2">
            {analysisEnabled ? (
              <button
                type="button"
                onClick={disableAIAnalysis}
                className="px-3 py-1 text-sm bg-red-100 text-red-700 border border-red-300 rounded-md hover:bg-red-200 transition-colors"
              >
                Disable AI
              </button>
            ) : (
              <button
                type="button"
                onClick={enableAIAnalysis}
                className="px-3 py-1 text-sm bg-green-100 text-green-700 border border-green-300 rounded-md hover:bg-green-200 transition-colors"
              >
                Enable AI
              </button>
            )}
          </div>
        </div>
        
        {analysisEnabled && (
          <div className="mt-2 text-xs text-gray-500">
            AI will automatically suggest departments as you type. You can disable this anytime.
          </div>
        )}
      </div>

      {/* AI Analysis Panel */}
      {showAIPanel && analysisEnabled && (
        <div className="mb-6">
          {aiThinking ? (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
                <div>
                  <p className="text-blue-700 font-medium">Analyzing your report...</p>
                  <p className="text-blue-600 text-sm">Determining the most relevant department</p>
                </div>
              </div>
            </div>
          ) : lastAnalysis ? (
            <div className={`p-4 border rounded-lg ${getConfidenceColor(lastAnalysis.confidence)}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{getConfidenceIcon(lastAnalysis.confidence)}</span>
                    <div>
                      <h4 className="font-medium">AI Analysis Complete</h4>
                      <p className="text-sm opacity-75">
                        {getConfidenceText(lastAnalysis.confidence)} ({(lastAnalysis.confidence * 100).toFixed(0)}%)
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><strong>Suggested Department:</strong></p>
                      <p className="font-semibold text-lg mt-1">
                        {lastAnalysis.predicted_department || 'Not determined'}
                      </p>
                    </div>
                    <div>
                      <p><strong>Analysis Details:</strong></p>
                      <ul className="mt-1 space-y-1">
                        <li>• Confidence: {(lastAnalysis.confidence * 100).toFixed(0)}%</li>
                        {lastAnalysis.match_count && (
                          <li>• Keyword matches: {lastAnalysis.match_count}</li>
                        )}
                        <li>• Status: {lastAnalysis.verified ? 'Verified' : 'Needs review'}</li>
                      </ul>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {lastAnalysis.predicted_department && (
                    <div className="mt-4 flex gap-2">
                      <button
                        type="button"
                        onClick={applyAISuggestion}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
                      >
                        Apply This Suggestion
                      </button>
                      <button
                        type="button"
                        onClick={disableAIAnalysis}
                        className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors text-sm font-medium"
                      >
                        Ignore & Disable AI
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Low Confidence Help */}
              {lastAnalysis.confidence < 0.6 && (
                <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded">
                  <p className="font-medium text-orange-800 text-sm">How to improve AI accuracy:</p>
                  <ul className="list-disc list-inside mt-1 text-orange-700 text-xs space-y-1">
                    <li>Add more specific details about the issue</li>
                    <li>Mention the exact service or facility involved</li>
                    <li>Include relevant keywords (medical, road, garbage, etc.)</li>
                    <li>Describe what needs to be fixed</li>
                  </ul>
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}

      {/* Title Input */}
      <div className="mb-6">
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          Issue Title *
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleTitleChange}
          placeholder="Brief, clear summary of the issue (e.g., Potholes on Main Road, Poor Hospital Service)"
          className="w-full border border-gray-300 rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          maxLength={255}
        />
        {validationErrors.title && (
          <p className="mt-1 text-sm text-red-600">{validationErrors.title}</p>
        )}
        <div className="mt-2 flex justify-between text-xs text-gray-500">
          <span>Be specific about the main problem</span>
          <span>{formData.title.length}/255 characters</span>
        </div>
      </div>

      {/* Description Input */}
      <div className="mb-6">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Detailed Description *
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleDescriptionChange}
          placeholder={`Provide comprehensive details about the issue. For better AI assistance, include:

• What exactly happened and when?
• Which specific service or facility is involved?
• What is the impact or consequence?
• What should be done to resolve it?

Example: "On Monday morning at Thika Level 5 Hospital, the emergency department had no doctors available for 4 hours. Patients with critical conditions were left unattended, medical equipment was missing, and the nursing staff was overwhelmed. This negligence created serious health risks that need immediate attention from the Health Department."`}
          rows={8}
          className="w-full border border-gray-300 rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
        />
        {validationErrors.description && (
          <p className="mt-1 text-sm text-red-600">{validationErrors.description}</p>
        )}
        <div className="mt-2 flex justify-between text-xs text-gray-500">
          <span>Detailed descriptions help AI suggest the right department</span>
          <span>{formData.description.length} characters</span>
        </div>
        
        {/* Description Quality Indicator */}
        <div className="mt-3">
          <div className="flex justify-between text-xs mb-1">
            <span className={
              formData.description.length < 50 ? "text-red-600 font-medium" : 
              formData.description.length < 100 ? "text-yellow-600 font-medium" : "text-green-600 font-medium"
            }>
              {formData.description.length < 50 ? "More details needed" : 
               formData.description.length < 100 ? "Good start" : "Excellent detail"}
            </span>
            <span>Recommended: 100+ characters</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                formData.description.length >= 100 ? 'bg-green-500' : 
                formData.description.length >= 50 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${Math.min((formData.description.length / 150) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Department Selection */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="department" className="block text-sm font-medium text-gray-700">
            Responsible Department *
          </label>
          {formData.department && !analysisEnabled && (
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              Manually Selected
            </span>
          )}
          {formData.department && analysisEnabled && lastAnalysis?.predicted_department && 
           departments.find(d => d.id == formData.department)?.name === lastAnalysis.predicted_department && (
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
              AI Suggested
            </span>
          )}
        </div>
        
        <select
          id="department"
          name="department"
          value={formData.department}
          onChange={handleDepartmentChange}
          className="w-full border border-gray-300 rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={loadingDepartments}
        >
          <option value="">{loadingDepartments ? 'Loading departments...' : 'Select the most relevant department'}</option>
          {departments.map((dept) => (
            <option key={dept.id} value={dept.id}>
              {dept.name}
            </option>
          ))}
        </select>
        
        {validationErrors.department && (
          <p className="mt-1 text-sm text-red-600">{validationErrors.department}</p>
        )}
        
        {/* Department Help */}
        <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>Department Guide:</strong> Select the department most responsible for addressing this issue.
          </p>
          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            <div>
              <strong>Health:</strong> Medical services, hospitals, clinics
            </div>
            <div>
              <strong>Roads & Transport:</strong> Potholes, traffic, road safety
            </div>
            <div>
              <strong>Environment:</strong> Garbage, pollution, drainage
            </div>
            <div>
              <strong>Education:</strong> Schools, teachers, education services
            </div>
          </div>
        </div>
      </div>

      {/* Priority Selection */}
      <div className="mb-4">
        <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
          Priority Level
        </label>
        <select
          id="priority"
          name="priority"
          value={formData.priority}
          onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
          className="w-full border border-gray-300 rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="low">Low Priority (Minor issue, no immediate risk)</option>
          <option value="medium">Medium Priority (Should be addressed soon)</option>
          <option value="high">High Priority (Needs prompt attention)</option>
          <option value="urgent">Urgent (Critical issue, immediate risk)</option>
        </select>
        <p className="mt-2 text-xs text-gray-500">
          Help officials prioritize based on severity and impact
        </p>
      </div>
    </div>
  );
};

export default DetailsSection;