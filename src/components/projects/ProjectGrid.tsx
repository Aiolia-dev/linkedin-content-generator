'use client';

import { Project, PROJECT_TYPE_LABELS } from '@/types/project';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

interface ProjectGridProps {
  projects: Project[];
}

export default function ProjectGrid({ projects }: ProjectGridProps) {
  const router = useRouter();

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <div
          key={project.id}
          className="group relative bg-white rounded-lg shadow-sm ring-1 ring-gray-200 hover:shadow-lg hover:ring-gray-300 transition-all duration-200 cursor-pointer"
          onClick={() => router.push(`/projects/${project.id}/generate`)}
        >
          <div className="p-6">
            <div className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-indigo-100 text-indigo-800 mb-4">
              {PROJECT_TYPE_LABELS[project.type]}
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors duration-200">
              {project.content?.subject || 'Untitled Project'}
            </h3>
            
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <time dateTime={project.createdAt?.toISOString()}>
                {format(new Date(project.createdAt), 'MMM d, yyyy')}
              </time>
            </div>

            {project.content?.keywords && (
              <div className="mt-4">
                <div className="flex flex-wrap gap-2">
                  {project.content.keywords.split(',').map((keyword, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-800"
                    >
                      {keyword.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
