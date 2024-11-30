'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase/firebase';
import { db } from '@/lib/firebase/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { ViewToggle } from '@/components/projects/ViewToggle';
import { TagIcon, UsersIcon, FunnelIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import { XMarkIcon } from '@heroicons/react/20/solid';
import { PROJECT_TYPE_LABELS, ProjectType, ProjectStatus } from '@/types/project';
import ConfirmationModal from '@/components/shared/ConfirmationModal';
import EditProjectModal from '@/components/projects/EditProjectModal';
import { deleteProject } from '@/lib/firebase/projects';
import { toast } from 'react-hot-toast';

interface Project {
  id: string;
  type: string;
  status: ProjectStatus;
  content: {
    subject?: string;
    keywords?: string;
    tone?: string;
    targetAudience?: string;
    generatedContent?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

interface Filter {
  type: string | null;
  status: ProjectStatus | null;
}

const PROJECT_STATUSES: ProjectStatus[] = ['draft', 'published'];

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState<Filter>({ type: null, status: null });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push('/login');
        return;
      }

      try {
        const projectsRef = collection(db, 'projects');
        const q = query(
          projectsRef,
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        const fetchedProjects = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            type: data.type || 'Unknown',
            status: data.status || 'draft',
            content: data.content || {},
            createdAt: data.createdAt?.toDate?.() || new Date(),
            updatedAt: data.updatedAt?.toDate?.() || new Date(),
            userId: data.userId,
          } as Project;
        });

        setProjects(fetchedProjects);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const filteredProjects = projects.filter(project => {
    if (filters.type && project.type !== filters.type) return false;
    if (filters.status && project.status !== filters.status) return false;
    return true;
  });

  const handleFilterChange = (filterType: keyof Filter, value: string | null) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  const clearFilters = () => {
    setFilters({ type: null, status: null });
    setIsFilterOpen(false);
  };

  const handleDeleteClick = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation(); // Prevent navigation to project details
    setProjectToDelete(project);
  };

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;

    try {
      await deleteProject(projectToDelete.id);
      setProjects(projects.filter(p => p.id !== projectToDelete.id));
      toast.success('Project deleted successfully');
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
    }
  };

  const handleGenerateContent = (projectId: string) => {
    router.push(`/projects/${projectId}/generate`);
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex justify-center items-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and organize all your content generation projects
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium transition-colors duration-200 ${
                isFilterOpen || filters.type || filters.status
                  ? 'border-blue-500 text-blue-600 bg-blue-50 hover:bg-blue-100'
                  : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
              }`}
            >
              <FunnelIcon className="h-4 w-4 mr-2" />
              Filter
              {(filters.type || filters.status) && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {Object.values(filters).filter(Boolean).length}
                </span>
              )}
            </button>

            {isFilterOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10 divide-y divide-gray-100">
                <div className="px-4 py-3 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-gray-900">Filters</h3>
                    {(filters.type || filters.status) && (
                      <button
                        onClick={clearFilters}
                        className="text-xs text-blue-600 hover:text-blue-500 font-medium"
                      >
                        Clear all filters
                      </button>
                    )}
                  </div>
                </div>

                <div className="py-2">
                  <div className="px-4 py-3">
                    <div className="space-y-1">
                      <h4 className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        Content Type
                      </h4>
                      <div className="space-y-2">
                        {Object.entries(PROJECT_TYPE_LABELS).map(([value, label]) => (
                          <label key={value} className="flex items-center">
                            <input
                              type="radio"
                              name="type"
                              value={value}
                              checked={filters.type === value}
                              onChange={(e) => handleFilterChange('type', e.target.value)}
                              className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">{label}</span>
                          </label>
                        ))}
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="type"
                            value=""
                            checked={filters.type === null}
                            onChange={() => handleFilterChange('type', null)}
                            className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">All types</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="py-2">
                  <div className="px-4 py-3">
                    <div className="space-y-1">
                      <h4 className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        Status
                      </h4>
                      <div className="space-y-2">
                        {PROJECT_STATUSES.map((status) => (
                          <label key={status} className="flex items-center">
                            <input
                              type="radio"
                              name="status"
                              value={status}
                              checked={filters.status === status}
                              onChange={(e) => handleFilterChange('status', e.target.value)}
                              className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">
                              {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                            </span>
                          </label>
                        ))}
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="status"
                            value=""
                            checked={filters.status === null}
                            onChange={() => handleFilterChange('status', null)}
                            className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">All statuses</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-4 py-3 bg-gray-50 rounded-b-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      {filteredProjects.length} {filteredProjects.length === 1 ? 'result' : 'results'}
                    </span>
                    <button
                      onClick={() => setIsFilterOpen(false)}
                      className="text-xs font-medium text-gray-700 hover:text-gray-900"
                    >
                      Done
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          <ViewToggle view={view} onViewChange={setView} />
          <button
            onClick={() => router.push('/projects/new')}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            New Project
          </button>
        </div>
      </div>

      {(filters.type || filters.status) && (
        <div className="mb-4 flex items-center space-x-2">
          <span className="text-sm text-gray-500">Active filters:</span>
          <div className="flex items-center space-x-2">
            {filters.type && (
              <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {PROJECT_TYPE_LABELS[filters.type as ProjectType]}
                <button
                  onClick={() => handleFilterChange('type', null)}
                  className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-500 focus:outline-none"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </span>
            )}
            {filters.status && (
              <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {filters.status.charAt(0).toUpperCase() + filters.status.slice(1)}
                <button
                  onClick={() => handleFilterChange('status', null)}
                  className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-500 focus:outline-none"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
      
      {filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          {projects.length === 0 ? (
            <>
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No projects</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new project.</p>
              <div className="mt-6">
                <button
                  onClick={() => router.push('/projects/new')}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  New Project
                </button>
              </div>
            </>
          ) : (
            <>
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No matching projects</h3>
              <p className="mt-1 text-sm text-gray-500">Try adjusting your filters</p>
              <div className="mt-6">
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Clear filters
                </button>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="mt-6">
          <div className={`grid gap-6 ${view === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                onClick={() => router.push(`/projects/${project.id}`)}
                className={`group bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer relative ${
                  view === 'grid' ? 'p-6' : 'p-4'
                }`}
              >
                <div className={view === 'grid' ? '' : 'flex items-center justify-between'}>
                  <div className={view === 'grid' ? '' : 'flex-1'}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                          {PROJECT_TYPE_LABELS[project.type as keyof typeof PROJECT_TYPE_LABELS]}
                        </span>
                        {project.content?.tone && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {project.content.tone}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setProjectToEdit(project);
                            setIsEditModalOpen(true);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-blue-50 rounded-full"
                          title="Edit project"
                        >
                          <PencilIcon className="h-5 w-5 text-blue-500" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteClick(e, project)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 rounded-full"
                          title="Delete project"
                        >
                          <TrashIcon className="h-5 w-5 text-red-500" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGenerateContent(project.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-green-50 rounded-full"
                          title="Generate content"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v-3a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 01-1 1H8a1 1 0 00-1 1v2a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-3a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 01-1 1H8a1 1 0 00-1 1v2a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v-3a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 01-1 1H8a1 1 0 00-1 1v2a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v-3" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900 mt-2">
                      {project.content?.subject || 'Untitled Project'}
                    </h2>
                    {project.content?.keywords && (
                      <div className="mt-2 flex items-center text-sm text-gray-600">
                        <TagIcon className="h-4 w-4 mr-1.5 flex-shrink-0" aria-hidden="true" />
                        <span>{project.content.keywords}</span>
                      </div>
                    )}
                    {project.content?.targetAudience && (
                      <div className="mt-1.5 flex items-center text-sm text-gray-600">
                        <UsersIcon className="h-4 w-4 mr-1.5 flex-shrink-0" aria-hidden="true" />
                        <span>{project.content.targetAudience}</span>
                      </div>
                    )}
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        {new Date(project.createdAt).toLocaleDateString()}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {project.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <ConfirmationModal
        isOpen={!!projectToDelete}
        onClose={() => setProjectToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Project"
        message="Are you sure you want to delete this project? This action cannot be undone."
      />

      <EditProjectModal
        project={projectToEdit}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setProjectToEdit(null);
        }}
        onSave={async () => {
          // Refresh projects list
          const user = auth.currentUser;
          if (user) {
            try {
              const projectsRef = collection(db, 'projects');
              const q = query(
                projectsRef,
                where('userId', '==', user.uid),
                orderBy('createdAt', 'desc')
              );
              
              const querySnapshot = await getDocs(q);
              const fetchedProjects = querySnapshot.docs.map(doc => ({
                id: doc.id,
                type: doc.data().type || 'Unknown',
                status: doc.data().status || 'draft',
                content: doc.data().content || {},
                createdAt: doc.data().createdAt?.toDate?.() || new Date(),
                updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
                userId: doc.data().userId,
              } as Project));

              setProjects(fetchedProjects);
            } catch (err) {
              console.error('Error refreshing projects:', err);
              toast.error('Failed to refresh projects');
            }
          }
        }}
        onGenerateContent={handleGenerateContent}
      />
    </div>
  );
}
