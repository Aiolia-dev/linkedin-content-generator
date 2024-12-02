'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
  PencilIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import EditProjectModal from '@/components/projects/EditProjectModal';
import { LinkedInPostSimulator } from '@/components/content/LinkedInPostSimulator';
import { usePersona } from '@/hooks/usePersona';

export default function GenerateContent() {
  const router = useRouter();
  const params = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGeneratedContent, setHasGeneratedContent] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Get personaId from project once it's loaded
  const personaId = !isLoading && project ? (project.personaId || project.persona) : undefined;
  console.log('Project state:', { isLoading, project, personaId });
  
  const { persona, isLoading: isLoadingPersona } = usePersona(personaId);
  console.log('Persona state:', { persona, isLoadingPersona, personaId });

  useEffect(() => {
    const fetchProject = async () => {
      if (!params.id) {
        console.log('No project ID found in params');
        setError('Project ID not found');
        setIsLoading(false);
        return;
      }

      try {
        console.log('Fetching project with ID:', params.id);
        const projectRef = doc(db, 'projects', params.id as string);
        const projectDoc = await getDoc(projectRef);
        
        if (!projectDoc.exists()) {
          console.log('Project document not found');
          throw new Error('Project not found');
        }

        const rawData = projectDoc.data();
        console.log('Raw project data from Firestore:', rawData);
        console.log('Project persona field:', rawData.persona);
        console.log('Project personaId field:', rawData.personaId);

        const projectData = {
          id: projectDoc.id,
          ...rawData,
          createdAt: rawData.createdAt?.toDate(),
          updatedAt: rawData.updatedAt?.toDate(),
          // Ensure we get the persona ID from the correct field
          personaId: rawData.personaId || rawData.persona
        } as Project;

        console.log('Setting project state with:', projectData);
        console.log('Final personaId:', projectData.personaId);
        setProject(projectData);
        setIsLoading(false);
        
        if (projectData.generatedContent) {
          setHasGeneratedContent(true);
          setGeneratedContent(projectData.generatedContent);
        }
      } catch (error) {
        console.error('Error fetching project:', error);
        setError('Failed to load project details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [params.id]);

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
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectType: project.type,
          tone: project.tone,
          subject: project.subject,
          contentLength: project.contentLength,
          keywords: project.keywords,
          persona: project.persona,
          projectId: project.id
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate content');
      }

      const data = await response.json();
      setGeneratedContent(data.content);
      setHasGeneratedContent(true);
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

  const formatProjectType = (type: string): string => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const formatContentLength = (contentLength: ContentLengthConfig | undefined): string => {
    if (!contentLength || !contentLength.type) return 'Not specified';
    
    if (contentLength.type === 'custom' && contentLength.wordCount) {
      return `${contentLength.wordCount} words`;
    }
    
    const type = contentLength.type;
    return type.charAt(0).toUpperCase() + type.slice(1);
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
      <div className="max-w-4xl mx-auto">
        <button
          onClick={handleBack}
          className="group flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors duration-200"
        >
          <ArrowLongLeftIcon className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform duration-200" />
          <span>Back to Projects</span>
        </button>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {project?.content?.title || project?.content?.subject || 'New LinkedIn Post'}
          </h1>
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PencilIcon className="h-4 w-4 mr-2" />
            Edit Project
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-2 gap-6">
            <div className="flex items-center space-x-2">
              <DocumentTextIcon className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-500">Type</p>
                <p className="text-sm text-gray-900">LinkedIn Post</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <SpeakerWaveIcon className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-500">Tone</p>
                <p className="text-sm text-gray-900">{project?.content?.tone || 'Not specified'}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <ClockIcon className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-500">Length</p>
                <p className="text-sm text-gray-900">
                  {(() => {
                    const length = project?.content?.contentLength;
                    if (!length) return 'Not specified';
                    if (typeof length === 'string') return length;
                    if (length.type === 'custom' && length.customWordCount) {
                      return `${length.customWordCount} words`;
                    }
                    switch (length.type) {
                      case 'short':
                        return 'Short (150-250 words)';
                      case 'medium':
                        return 'Medium (300-500 words)';
                      case 'long':
                        return 'Long (600-1000 words)';
                      default:
                        return length.type;
                    }
                  })()}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <TagIcon className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-500">Keywords</p>
                <p className="text-sm text-gray-900">
                  {Array.isArray(project?.content?.keywords) 
                    ? project.content.keywords.join(', ') 
                    : project?.content?.keywords || 'Not specified'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <LightBulbIcon className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-500">Subject</p>
                <p className="text-sm text-gray-900">{project?.content?.subject || 'Not specified'}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <UserGroupIcon className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-500">Target Audience</p>
                <p className="text-sm text-gray-900">
                  {project?.content?.targetAudience || 'Not specified'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {!hasGeneratedContent ? (
          <div className="flex justify-center">
            <button
              onClick={handleGenerateContent}
              disabled={isGenerating}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <SparklesIcon className="w-5 h-5" />
                  <span>Generate Content</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <LinkedInPostSimulator content={generatedContent} isLoading={isGenerating} />
        )}
      </div>

      <EditProjectModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        project={project}
        onProjectUpdated={(updatedProject) => setProject(updatedProject)}
      />
    </div>
  );
}
