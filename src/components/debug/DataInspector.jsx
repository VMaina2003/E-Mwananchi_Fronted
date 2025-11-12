// src/components/debug/DataInspector.jsx
import React from 'react';

const DataInspector = ({ data, title }) => {
  if (!data) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <h3 className="text-lg font-semibold text-yellow-800">{title}</h3>
        <p className="text-yellow-700">No data available</p>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <h3 className="text-lg font-semibold text-blue-800 mb-2">{title}</h3>
      <div className="mb-2">
        <strong>Data Type:</strong> {Array.isArray(data) ? `Array (${data.length} items)` : typeof data}
      </div>
      <pre className="text-sm bg-white p-3 rounded border overflow-auto max-h-64">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
};

export default DataInspector;