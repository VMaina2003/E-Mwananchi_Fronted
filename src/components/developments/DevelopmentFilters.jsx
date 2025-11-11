// src/components/developments/DevelopmentFilters.jsx
import React from 'react';

const DevelopmentFilters = ({ filters, onFilterChange, counties = [], departments = [] }) => {
  return (
    <div className="flex flex-wrap gap-4 p-4 bg-white rounded-lg border border-gray-200">
      <select 
        value={filters.county} 
        onChange={(e) => onFilterChange({...filters, county: e.target.value})}
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
      >
        <option value="">All Counties</option>
        {counties.map(county => (
          <option key={county.id} value={county.id}>{county.name}</option>
        ))}
      </select>

      <select 
        value={filters.department} 
        onChange={(e) => onFilterChange({...filters, department: e.target.value})}
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
      >
        <option value="">All Departments</option>
        {departments.map(dept => (
          <option key={dept.id} value={dept.id}>{dept.name}</option>
        ))}
      </select>

      <select 
        value={filters.status} 
        onChange={(e) => onFilterChange({...filters, status: e.target.value})}
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
      >
        <option value="">All Status</option>
        <option value="planned">Planned</option>
        <option value="in_progress">In Progress</option>
        <option value="completed">Completed</option>
        <option value="delayed">Delayed</option>
      </select>
    </div>
  );
};

export default DevelopmentFilters;