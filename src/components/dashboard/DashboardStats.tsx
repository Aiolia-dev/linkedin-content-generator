'use client';

import { useEffect, useState } from 'react';
import { Project } from '@/types/project';

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

  const getMostCreatedType = () => {
    if (stats.total === 0) return 'No Projects Yet';
    return Object.entries(stats.byType)
      .reduce((a, b) => (a[1] > b[1] ? a : b))[0]
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-sm font-medium text-gray-500">Total Projects</h3>
        <p className="mt-2 text-3xl font-semibold text-gray-900">{stats.total}</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-sm font-medium text-gray-500">Published</h3>
        <p className="mt-2 text-3xl font-semibold text-green-600">{stats.published}</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-sm font-medium text-gray-500">Drafts</h3>
        <p className="mt-2 text-3xl font-semibold text-yellow-600">{stats.draft}</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-sm font-medium text-gray-500">Most Created</h3>
        <p className="mt-2 text-3xl font-semibold text-indigo-600">
          {getMostCreatedType()}
        </p>
      </div>
    </div>
  );
}
