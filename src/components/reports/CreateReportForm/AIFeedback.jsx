import React from 'react';

const AIFeedback = ({ aiAnalysis, confidenceLevel }) => {
  if (!aiAnalysis) return null;

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

  const getSuggestions = (confidence) => {
    if (confidence >= 0.8) {
      return [
        "Your report is clear and well-described",
        "Department automatically assigned",
        "Ready for immediate processing"
      ];
    }
    if (confidence >= 0.6) {
      return [
        "Consider adding more specific details",
        "Department suggested but review recommended",
        "Add location specifics if possible"
      ];
    }
    return [
      "Please provide more detailed description",
      "Specify the exact nature of the issue",
      "Include location and department information",
      "Add relevant images for better classification"
    ];
  };

  return (
    <div className={`border rounded-lg p-4 mb-6 ${getConfidenceColor(aiAnalysis.confidence)}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-lg">AI Analysis Results</h3>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(aiAnalysis.confidence)}`}>
          {getConfidenceText(aiAnalysis.confidence)} ({(aiAnalysis.confidence * 100).toFixed(0)}%)
        </span>
      </div>

      <div className="space-y-3">
        {aiAnalysis.predicted_department && (
          <div className="flex items-start space-x-2">
            <div className={`w-2 h-2 rounded-full mt-2 ${
              aiAnalysis.confidence >= 0.8 ? 'bg-green-500' : 
              aiAnalysis.confidence >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'
            }`}></div>
            <div>
              <p className="font-medium">Suggested Department</p>
              <p className="text-gray-700">{aiAnalysis.predicted_department}</p>
            </div>
          </div>
        )}

        {aiAnalysis.predicted_county && (
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 rounded-full mt-2 bg-blue-500"></div>
            <div>
              <p className="font-medium">Detected Location</p>
              <p className="text-gray-700">{aiAnalysis.predicted_county}</p>
            </div>
          </div>
        )}

        <div className="border-t pt-3">
          <p className="font-medium mb-2">Recommendations:</p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            {getSuggestions(aiAnalysis.confidence).map((suggestion, index) => (
              <li key={index} className="text-gray-700">{suggestion}</li>
            ))}
          </ul>
        </div>

        {aiAnalysis.confidence < 0.6 && (
          <div className="bg-orange-50 border border-orange-200 rounded p-3">
            <p className="font-medium text-orange-800">Manual Review Required</p>
            <p className="text-orange-700 text-sm mt-1">
              Please select the appropriate department below to ensure your report reaches the right team quickly.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIFeedback;