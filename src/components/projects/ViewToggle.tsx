'use client';

import React from 'react';
import { LayoutGrid, List } from 'lucide-react';
import { Tooltip, TooltipProvider } from '../ui/Tooltip';
import { cn } from '@/lib/utils';

interface ViewToggleProps {
  view: 'grid' | 'list';
  onViewChange: (view: 'grid' | 'list') => void;
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <TooltipProvider>
      <div className="flex items-center space-x-2 bg-white rounded-lg p-1 shadow-sm">
        <Tooltip content="Grid View">
          <button
            onClick={() => onViewChange('grid')}
            className={cn(
              'p-2 rounded-md transition-colors',
              view === 'grid'
                ? 'bg-gray-100 text-gray-900'
                : 'hover:bg-gray-100 text-gray-600'
            )}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
        </Tooltip>
        <Tooltip content="List View">
          <button
            onClick={() => onViewChange('list')}
            className={cn(
              'p-2 rounded-md transition-colors',
              view === 'list'
                ? 'bg-gray-100 text-gray-900'
                : 'hover:bg-gray-100 text-gray-600'
            )}
          >
            <List className="h-4 w-4" />
          </button>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
