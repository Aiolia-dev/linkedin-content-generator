'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Project, ProjectType, PROJECT_TYPE_LABELS } from '@/types/project';
import {
  PresentationChartBarIcon,
  DocumentTextIcon,
  CalendarIcon,
  ChatBubbleBottomCenterTextIcon,
  ArrowLongLeftIcon,
} from '@heroicons/react/24/outline';
import ProjectForm from '@/components/projects/ProjectForm';
import { createProject } from '@/lib/firebase/projects';

const PROJECT_TYPES: { 
  type: ProjectType; 
  description: string;
  icon: React.ElementType;
  color: string;
}[] = [
  {
    type: 'linkedin_post',
    description: 'Share insights with your network',
    icon: ChatBubbleBottomCenterTextIcon,
    color: 'indigo',
  },
  {
    type: 'linkedin_carousel',
    description: 'Present topics in a visual format',
    icon: PresentationChartBarIcon,
    color: 'blue',
  },
  {
    type: 'blog_article',
    description: 'Write in-depth articles',
    icon: DocumentTextIcon,
    color: 'indigo',
  },
  {
    type: 'editorial_calendar',
    description: 'Plan your content strategy',
    icon: CalendarIcon,
    color: 'purple',
  },
];

const STEPS = ['type', 'details'] as const;
type Step = typeof STEPS[number];

export default function NewProject() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentStep = (searchParams.get('step') as Step) || 'type';
  const selectedType = searchParams.get('type') as ProjectType | null;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTypeSelection = (type: ProjectType) => {
    const params = new URLSearchParams();
    params.set('step', 'details');
    params.set('type', type);
    router.push(`/projects/new?${params.toString()}`);
  };

  const handleBack = () => {
    if (currentStep === 'details') {
      const params = new URLSearchParams();
      params.set('step', 'type');
      router.push(`/projects/new?${params.toString()}`);
    } else {
      router.push('/dashboard');
    }
  };

  const handleProjectSubmit = async (data: Partial<Project>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const projectId = await createProject(data);
      router.push(`/projects/${projectId}/generate`);
    } catch (error) {
      console.error('Error creating project:', error);
      setError('Failed to create project. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={handleBack}
          className="group flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors duration-200"
        >
          <ArrowLongLeftIcon className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform duration-200" />
          <span>Back to {currentStep === 'details' ? 'Project Types' : 'Dashboard'}</span>
        </button>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {STEPS.map((step, index) => (
              <div key={step} className="flex items-center">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center
                  ${currentStep === step ? 'bg-blue-500 text-white' : 
                    index < STEPS.indexOf(currentStep) ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'}
                `}>
                  {index + 1}
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`
                    h-1 w-24 mx-2
                    ${index < STEPS.indexOf(currentStep) ? 'bg-green-500' : 'bg-gray-200'}
                  `} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center space-x-[140px] mt-2">
            <span className="text-sm text-gray-600">Select Type</span>
            <span className="text-sm text-gray-600">Project Details</span>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 text-red-700 bg-red-100 rounded-lg">
            {error}
          </div>
        )}

        {currentStep === 'type' ? (
          <>
            <h1 className="text-3xl font-bold mb-2 text-gray-900">Create New Project</h1>
            <p className="text-gray-600 mb-8">Select the type of content you want to create</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {PROJECT_TYPES.map(({ type, description, icon: Icon, color }) => (
                <button
                  key={type}
                  onClick={() => handleTypeSelection(type)}
                  className={`group relative p-6 rounded-xl border-2 text-left transition-all hover:shadow-lg
                    ${selectedType === type 
                      ? `border-${color}-500 bg-${color}-50` 
                      : 'border-gray-100 hover:border-gray-200 bg-white'
                    }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`p-2 rounded-lg bg-${color}-100 text-${color}-600 group-hover:bg-${color}-200`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {PROJECT_TYPE_LABELS[type]}
                      </h3>
                      <p className="text-sm text-gray-500">{description}</p>
                    </div>
                  </div>
                  <div className={`absolute inset-x-0 bottom-0 h-0.5 bg-${color}-500 scale-x-0 group-hover:scale-x-100 transition-transform`} />
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold mb-2 text-gray-900">
              {selectedType && PROJECT_TYPE_LABELS[selectedType]} Details
            </h1>
            <p className="text-gray-600 mb-8">
              Fill in the details below to create your content. Our AI will help you generate engaging content based on your input.
            </p>

            <div className="bg-white shadow rounded-lg p-6">
              {selectedType && (
                <ProjectForm 
                  type={selectedType}
                  onSubmit={handleProjectSubmit}
                  disabled={isLoading}
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
