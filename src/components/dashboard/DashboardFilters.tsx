'use client';

import { useEffect, useState } from 'react';
import { ProjectType, PROJECT_TYPE_LABELS } from '@/types/project';

interface DashboardFiltersProps {
  selectedTypes: ProjectType[];
  onTypeChange: (type: ProjectType) => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderChange: (order: 'asc' | 'desc') => void;
}

export default function DashboardFilters({
  selectedTypes,
  onTypeChange,
  sortOrder,
  onSortOrderChange,
}: DashboardFiltersProps) {
  const [mounted, setMounted] = useState(false);
  const projectTypes = Object.keys(PROJECT_TYPE_LABELS) as ProjectType[];

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-16" />; // Placeholder with same height
  }

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 mb-6">
      <div className="flex flex-wrap gap-2">
        {projectTypes.map((type) => (
          <button
            key={type}
            onClick={() => onTypeChange(type)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors
              ${
                selectedTypes.includes(type)
                  ? 'bg-indigo-100 text-indigo-800'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            {PROJECT_TYPE_LABELS[type]}
          </button>
        ))}
      </div>
      
      <button
        onClick={() => onSortOrderChange(sortOrder === 'desc' ? 'asc' : 'desc')}
        className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Sort by Date{' '}
        {sortOrder === 'desc' ? (
          <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        ) : (
          <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        )}
      </button>
    </div>
  );
}
