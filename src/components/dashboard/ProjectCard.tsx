import { Project, PROJECT_TYPE_COLORS, PROJECT_TYPE_LABELS } from '@/types/project';
import { format } from 'date-fns';
import { useState, useEffect } from 'react';
import { PencilIcon, SparklesIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

interface ProjectCardProps {
  project: Project;
  onClick: (project: Project) => void;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
}

const getProjectPreview = (project: Project): string => {
  switch (project.type) {
    case 'linkedin_post':
      return (project.content as any).subject || 'New LinkedIn Post';
    case 'linkedin_carousel':
      return (project.content as any).subject || 'New Carousel';
    case 'blog_article':
      return (project.content as any).title || 'New Blog Article';
    case 'editorial_calendar':
      return 'Editorial Calendar';
    default:
      return 'New Project';
  }
};

const getTypeColor = (type: Project['type']): { bg: string; text: string; icon: string } => {
  const colorMap = {
    linkedin_post: {
      bg: 'bg-blue-50 hover:bg-blue-100',
      text: 'text-blue-700',
      icon: 'bg-blue-100',
    },
    linkedin_carousel: {
      bg: 'bg-purple-50 hover:bg-purple-100',
      text: 'text-purple-700',
      icon: 'bg-purple-100',
    },
    blog_article: {
      bg: 'bg-green-50 hover:bg-green-100',
      text: 'text-green-700',
      icon: 'bg-green-100',
    },
    editorial_calendar: {
      bg: 'bg-orange-50 hover:bg-orange-100',
      text: 'text-orange-700',
      icon: 'bg-orange-100',
    },
  };
  return colorMap[type] || { bg: 'bg-gray-50 hover:bg-gray-100', text: 'text-gray-700', icon: 'bg-gray-100' };
};

const getStatusBadge = (status: Project['status']): JSX.Element => {
  const currentStatus = status || 'draft';
  const styles = {
    draft: 'bg-yellow-100 text-yellow-800',
    published: 'bg-green-100 text-green-800',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[currentStatus]}`}>
      {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
    </span>
  );
};

export default function ProjectCard({ project, onClick, onEdit, onDelete }: ProjectCardProps) {
  const [formattedDate, setFormattedDate] = useState<string>('');
  const colors = getTypeColor(project.type);
  const router = useRouter();

  useEffect(() => {
    setFormattedDate(format(new Date(project.createdAt), 'MMM d, yyyy'));
  }, [project.createdAt]);

  return (
    <div
      onClick={() => onClick(project)}
      className={`group relative flex flex-col justify-between p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer ${colors.bg}`}
    >
      <div className="absolute top-0 left-0 w-full h-1 rounded-t-lg bg-gradient-to-r from-transparent via-current to-transparent opacity-20 group-hover:opacity-30" 
           style={{ color: colors.text.replace('text-', '') }} />
      <div>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors.icon} ${colors.text}`}>
                {PROJECT_TYPE_LABELS[project.type as keyof typeof PROJECT_TYPE_LABELS]}
              </span>
              {project.content?.tone && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {project.content.tone}
                </span>
              )}
            </div>
          </div>
          {getStatusBadge(project.status)}
        </div>
        <p className="text-gray-900 line-clamp-3">
          {project.type === 'linkedin_post'
            ? (project.content as any).generatedContent?.slice(0, 100) + '...'
            : getProjectPreview(project)}
        </p>
      </div>
      <div className="mt-4 text-xs text-gray-500">
        {formattedDate}
      </div>
      <div className="flex items-center space-x-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(project);
          }}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-blue-50 rounded-full"
          title="Edit project"
        >
          <PencilIcon className="h-5 w-5 text-blue-500" />
        </button>
        {project.status === 'draft' && !project.generatedContent && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/projects/${project.id}/generate`);
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-blue-50 rounded-full"
            title="Generate content"
          >
            <SparklesIcon className="h-5 w-5 text-blue-500" />
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(project);
          }}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 rounded-full"
          title="Delete project"
        >
          <TrashIcon className="h-5 w-5 text-red-500" />
        </button>
      </div>
    </div>
  );
}
