'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Project } from '@/types/project';
import { db } from '@/lib/firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';
import {
  ArrowLongLeftIcon,
  DocumentTextIcon,
  TagIcon,
  SpeakerWaveIcon,
  LightBulbIcon,
  SparklesIcon,
  PencilSquareIcon,
  ClockIcon,
  CheckCircleIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import EditProjectModal from '@/components/projects/EditProjectModal';

export default function GenerateContent() {
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGeneratedContent, setHasGeneratedContent] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    const projectDataElement = document.getElementById('project-data');
    if (!projectDataElement) {
      setError('Project data not found');
      setIsLoading(false);
      return;
    }

    try {
      const projectDataString = projectDataElement.getAttribute('data-project');
      if (!projectDataString) {
        throw new Error('Project data is empty');
      }
      const projectData = JSON.parse(projectDataString);
      setProject(projectData);
      
      // Check if project has generated content
      checkGeneratedContent(projectData.id);
    } catch (error) {
      console.error('Error parsing project data:', error);
      setError('Failed to load project details');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkGeneratedContent = async (projectId: string) => {
    try {
      const projectRef = doc(db, 'projects', projectId);
      const projectDoc = await getDoc(projectRef);
      
      if (projectDoc.exists()) {
        const projectData = projectDoc.data();
        setHasGeneratedContent(!!projectData.generatedContent);
      }
    } catch (error) {
      console.error('Error checking generated content:', error);
    }
  };

  const handleBack = () => {
    router.push('/projects');
  };

  const handleGenerateContent = async () => {
    if (!project) return;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      // TODO: Implement content generation API call
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulated API call
      console.log('Generate content for project:', project.id);
    } catch (error) {
      console.error('Error generating content:', error);
      setError('Failed to generate content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const getProjectTitle = (type: ProjectType): string => {
    switch (type) {
      case 'linkedin_post':
        return 'New LinkedIn Post';
      case 'linkedin_carousel':
        return 'New LinkedIn Carousel';
      case 'blog_article':
        return 'New Blog Article';
      case 'editorial_calendar':
        return 'New Editorial Calendar';
      default:
        return 'Untitled Project';
    }
  };

  const handleEditClick = () => {
    setIsEditModalOpen(true);
  };

  const handleEditClose = () => {
    setIsEditModalOpen(false);
  };

  const handleEditSave = async () => {
    // Refresh project data after save
    if (project) {
      const projectRef = doc(db, 'projects', project.id);
      const projectDoc = await getDoc(projectRef);
      if (projectDoc.exists()) {
        setProject({ ...projectDoc.data(), id: projectDoc.id } as Project);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error || 'Project not found'}</p>
            </div>
          </div>
        </div>
        <button
          onClick={handleBack}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLongLeftIcon className="h-5 w-5 mr-2" />
          Back to Projects
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={handleBack}
          className="group flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-150"
        >
          <ArrowLongLeftIcon className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform duration-150" />
          <span>Back to Projects</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                <DocumentTextIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-white mb-1">
                  {project.title || getProjectTitle(project.type)}
                </h1>
                <div className="flex items-center text-blue-100 text-sm space-x-4">
                  <div className="flex items-center">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    <span>Created just now</span>
                  </div>
                  <div className="flex items-center">
                    <div className={`inline-flex items-center px-2 py-0.5 rounded ${project.status === 'published' ? 'bg-green-500' : 'bg-gray-500'}`}>
                      <span className="text-white text-xs font-medium">
                        {project.status === 'published' ? 'Published' : 'Draft'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={handleEditClick}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-150"
              title="Edit project"
            >
              <PencilIcon className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Project Type */}
            <div className="flex items-start space-x-4 p-6 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/30 border border-blue-100">
              <div className="p-2 bg-blue-100 rounded-lg">
                <PencilSquareIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-sm font-medium text-blue-900/60 mb-1">Project Type</h2>
                <p className="text-blue-900 font-medium">{project.type}</p>
              </div>
            </div>

            {/* Subject */}
            {project.content?.subject && (
              <div className="flex items-start space-x-4 p-6 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100/30 border border-purple-100">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <LightBulbIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-sm font-medium text-purple-900/60 mb-1">Subject</h2>
                  <p className="text-purple-900 font-medium">{project.content.subject}</p>
                </div>
              </div>
            )}

            {/* Tone */}
            {project.content?.tone && (
              <div className="flex items-start space-x-4 p-6 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100/30 border border-indigo-100">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <SpeakerWaveIcon className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-sm font-medium text-indigo-900/60 mb-1">Tone</h2>
                  <p className="text-indigo-900 font-medium">{project.content.tone}</p>
                </div>
              </div>
            )}

            {/* Content Length */}
            {project.content?.contentLength && (
              <div className="flex items-start space-x-4 p-6 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100/30 border border-amber-100">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <ClockIcon className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-sm font-medium text-amber-900/60 mb-1">Content Length</h2>
                  <p className="text-amber-900 font-medium">
                    {project.content.contentLength.type === 'custom' ? (
                      `Custom (${project.content.contentLength.customWordCount} words)`
                    ) : project.content.contentLength.type === 'short' ? (
                      'Short (150-250 words)'
                    ) : project.content.contentLength.type === 'medium' ? (
                      'Medium (300-500 words)'
                    ) : (
                      'Long (600-1000 words)'
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Keywords Section */}
          {project.content?.keywords && (
            <div className="mt-6 p-6 rounded-xl bg-gradient-to-br from-green-50 to-green-100/30 border border-green-100">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-green-100 rounded-lg mr-3">
                  <TagIcon className="h-6 w-6 text-green-600" />
                </div>
                <h2 className="text-sm font-medium text-green-900/60">Keywords</h2>
              </div>
              <div className="flex flex-wrap gap-2 ml-12">
                {project.content.keywords.split(',').map((keyword, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium bg-white text-green-700 border border-green-200 shadow-sm hover:bg-green-50 transition-colors duration-150"
                  >
                    {keyword.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Section */}
        <div className="border-t border-gray-100">
          <div className="p-8 flex flex-col items-center space-y-4">
            {hasGeneratedContent && (
              <div className="flex items-center text-green-600 mb-2">
                <CheckCircleIcon className="h-5 w-5 mr-2" />
                <span className="text-sm">Content has already been generated for this project</span>
              </div>
            )}
            <button
              className={`
                relative overflow-hidden group
                ${isGenerating 
                  ? 'bg-blue-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-blue-100'
                }
                text-white px-8 py-3.5 rounded-xl transition-all duration-200 flex items-center space-x-3
              `}
              onClick={handleGenerateContent}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  <span className="font-medium">Generating Content...</span>
                </>
              ) : (
                <>
                  <SparklesIcon className="h-5 w-5" />
                  <span className="font-medium">{hasGeneratedContent ? 'Regenerate Content' : 'Generate Content'}</span>
                  <div className="absolute inset-0 -z-10 bg-gradient-to-r from-blue-600 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <EditProjectModal
        project={project}
        isOpen={isEditModalOpen}
        onClose={handleEditClose}
        onSave={handleEditSave}
      />
    </div>
  );
}
