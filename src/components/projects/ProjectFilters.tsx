'use client';

import { ProjectType, PROJECT_TYPE_LABELS } from '@/types/project';
import { FunnelIcon, ArrowsUpDownIcon } from '@heroicons/react/24/outline';

interface ProjectFiltersProps {
  selectedTypes: ProjectType[];
  selectedStatuses: string[];
  sortOrder: 'asc' | 'desc';
  onTypeChange: (types: ProjectType[]) => void;
  onStatusChange: (statuses: string[]) => void;
  onSortChange: (order: 'asc' | 'desc') => void;
}

export default function ProjectFilters({
  selectedTypes,
  selectedStatuses,
  sortOrder,
  onTypeChange,
  onStatusChange,
  onSortChange,
}: ProjectFiltersProps) {
  const handleTypeToggle = (type: ProjectType) => {
    if (selectedTypes.includes(type)) {
      onTypeChange(selectedTypes.filter(t => t !== type));
    } else {
      onTypeChange([...selectedTypes, type]);
    }
  };

  const handleStatusToggle = (status: string) => {
    if (selectedStatuses.includes(status)) {
      onStatusChange(selectedStatuses.filter(s => s !== status));
    } else {
      onStatusChange([...selectedStatuses, status]);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-lg shadow-sm">
      <div className="flex items-center gap-2">
        <FunnelIcon className="h-5 w-5 text-gray-400" />
        <span className="text-sm font-medium text-gray-700">Filters:</span>
      </div>
      
      <div className="flex flex-wrap gap-3">
        <div className="space-y-2">
          <span className="text-sm text-gray-500">Type</span>
          <div className="flex flex-wrap gap-2">
            {Object.entries(PROJECT_TYPE_LABELS).map(([type, label]) => (
              <button
                key={type}
                onClick={() => handleTypeToggle(type as ProjectType)}
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedTypes.includes(type as ProjectType)
                    ? 'bg-indigo-100 text-indigo-800'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-sm text-gray-500">Status</span>
          <div className="flex flex-wrap gap-2">
            {['draft', 'generated'].map((status) => (
              <button
                key={status}
                onClick={() => handleStatusToggle(status)}
                className={`px-3 py-1 rounded-full text-sm capitalize ${
                  selectedStatuses.includes(status)
                    ? 'bg-indigo-100 text-indigo-800'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-sm text-gray-500">Sort by date</span>
          <button
            onClick={() => onSortChange(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="flex items-center gap-2 px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            <ArrowsUpDownIcon className="h-4 w-4" />
            {sortOrder === 'desc' ? 'Newest first' : 'Oldest first'}
          </button>
        </div>
      </div>
    </div>
  );
}
