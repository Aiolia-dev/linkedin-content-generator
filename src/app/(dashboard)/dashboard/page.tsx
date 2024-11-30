'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Project, ProjectType } from '@/types/project';
import ProjectCard from '@/components/dashboard/ProjectCard';
import DashboardFilters from '@/components/dashboard/DashboardFilters';
import DashboardStats from '@/components/dashboard/DashboardStats';

function ClientOnly({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 animate-pulse">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm p-6 h-24"></div>
            ))}
          </div>
          <div className="h-12 bg-gray-200 rounded mb-6"></div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm p-6 h-32"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

function DashboardContent() {
  const { user } = useAuthStore();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTypes, setSelectedTypes] = useState<ProjectType[]>([]);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const router = useRouter();

  useEffect(() => {
    async function fetchProjects() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const projectsRef = collection(db, 'projects');
        const q = query(
          projectsRef,
          where('userId', '==', user.uid),
          orderBy('createdAt', sortOrder)
        );
        const querySnapshot = await getDocs(q);
        
        const fetchedProjects = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate?.() || new Date(),
            updatedAt: data.updatedAt?.toDate?.() || new Date(),
          };
        }) as Project[];

        setProjects(fetchedProjects);
        setError(null);
      } catch (error) {
        console.error('Error fetching projects:', error);
        setError('An error occurred while loading your projects. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, [user, sortOrder]);

  const handleTypeChange = (type: ProjectType) => {
    setSelectedTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const handleProjectClick = (project: Project) => {
    router.push(`/projects/${project.id}`);
  };

  const filteredProjects = projects.filter(project =>
    selectedTypes.length === 0 || selectedTypes.includes(project.type)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
              Dashboard
            </h2>
          </div>
          <div className="mt-4 flex md:ml-4 md:mt-0">
            <button
              onClick={() => router.push('/projects/new')}
              type="button"
              className="ml-3 inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              New Project
            </button>
          </div>
        </div>

        <DashboardStats projects={projects} />
        
        <DashboardFilters
          selectedTypes={selectedTypes}
          onTypeChange={handleTypeChange}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
        />

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Recent Projects</h2>
            <button
              onClick={() => router.push('/projects')}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100"
            >
              View All Projects
              <span className="ml-2 text-indigo-500">({filteredProjects.length})</span>
            </button>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.length > 0 ? (
              <>
                {filteredProjects.slice(0, 3).map(project => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onClick={handleProjectClick}
                  />
                ))}
              </>
            ) : (
              <div className="col-span-full text-center py-12">
                <h3 className="text-lg font-medium text-gray-900">Welcome to your dashboard!</h3>
                <p className="mt-2 text-gray-500">Get started by creating your first project.</p>
                <button
                  onClick={() => router.push('/projects/new')}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Create Project
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ClientOnly>
      <DashboardContent />
    </ClientOnly>
  );
}
