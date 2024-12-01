'use client';

import { useEffect, useState } from 'react';
import { Project } from '@/types/project';
import {
  DocumentTextIcon,
  PresentationChartBarIcon,
  CalendarIcon,
  NewspaperIcon,
  DocumentDuplicateIcon,
  CheckCircleIcon,
  PencilSquareIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

interface DashboardStatsProps {
  projects: Project[];
}

export default function DashboardStats({ projects }: DashboardStatsProps) {
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    byType: {
      linkedin_post: 0,
      linkedin_carousel: 0,
      blog_article: 0,
      editorial_calendar: 0,
    },
  });

  useEffect(() => {
    setStats({
      total: projects.length,
      published: projects.filter((p) => p.status === 'published').length,
      draft: projects.filter((p) => p.status === 'draft').length,
      byType: {
        linkedin_post: projects.filter((p) => p.type === 'linkedin_post').length,
        linkedin_carousel: projects.filter((p) => p.type === 'linkedin_carousel').length,
        blog_article: projects.filter((p) => p.type === 'blog_article').length,
        editorial_calendar: projects.filter((p) => p.type === 'editorial_calendar').length,
      },
    });
  }, [projects]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'linkedin_post':
        return <DocumentTextIcon className="h-8 w-8 text-blue-500" />;
      case 'linkedin_carousel':
        return <PresentationChartBarIcon className="h-8 w-8 text-blue-500" />;
      case 'blog_article':
        return <NewspaperIcon className="h-8 w-8 text-blue-500" />;
      case 'editorial_calendar':
        return <CalendarIcon className="h-8 w-8 text-blue-500" />;
      default:
        return <DocumentDuplicateIcon className="h-8 w-8 text-gray-400" />;
    }
  };

  const getTypeLabel = (type: string) => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getMostCreatedTypeInfo = () => {
    if (stats.total === 0) return { type: 'empty', count: 0 };
    const [type, count] = Object.entries(stats.byType)
      .reduce((a, b) => (a[1] > b[1] ? a : b));
    return { type, count };
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div className="bg-white rounded-lg shadow-sm p-6 flex items-start justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Total Projects</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{stats.total}</p>
        </div>
        <DocumentDuplicateIcon className="h-8 w-8 text-gray-400" />
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-6 flex items-start justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Published</h3>
          <p className="mt-2 text-3xl font-semibold text-green-600">{stats.published}</p>
        </div>
        <CheckCircleIcon className="h-8 w-8 text-green-500" />
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-6 flex items-start justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Drafts</h3>
          <p className="mt-2 text-3xl font-semibold text-yellow-600">{stats.draft}</p>
        </div>
        <PencilSquareIcon className="h-8 w-8 text-yellow-500" />
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Most Created</h3>
            {stats.total > 0 ? (
              <>
                <p className="mt-2 text-3xl font-semibold text-blue-600">{getMostCreatedTypeInfo().count}</p>
                <p className="mt-1 text-sm text-gray-600">{getTypeLabel(getMostCreatedTypeInfo().type)}</p>
              </>
            ) : (
              <p className="mt-2 text-lg text-gray-400">No Projects Yet</p>
            )}
          </div>
          {stats.total > 0 ? (
            getTypeIcon(getMostCreatedTypeInfo().type)
          ) : (
            <ChartBarIcon className="h-8 w-8 text-gray-400" />
          )}
        </div>
      </div>
    </div>
  );
}
