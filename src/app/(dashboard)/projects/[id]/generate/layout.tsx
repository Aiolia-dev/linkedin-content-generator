'use client';

import { db } from '@/lib/firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Project } from '@/types/project';
import { usePathname } from 'next/navigation';

export default function GenerateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pathname = usePathname();
  
  useEffect(() => {
    const fetchProject = async () => {
      // Extract ID from pathname
      const projectId = pathname?.split('/')?.[2];
      
      if (!projectId) {
        setError('No project ID provided');
        setLoading(false);
        return;
      }
      
      try {
        const projectRef = doc(db, 'projects', projectId);
        const projectDoc = await getDoc(projectRef);
        
        if (projectDoc.exists()) {
          const projectData = { ...projectDoc.data(), id: projectDoc.id } as Project;
          setProject(projectData);
        } else {
          setError('Project not found');
        }
      } catch (error) {
        console.error('Error fetching project:', error);
        setError('Failed to load project');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [pathname]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <p className="text-red-700">{error || 'Project data not found'}</p>
        </div>
        <a
          href="/projects"
          className="mt-4 text-blue-600 hover:text-blue-800 flex items-center space-x-1"
        >
          <span>← Back to Projects</span>
        </a>
      </div>
    );
  }

  return (
    <>
      <div 
        id="project-data" 
        data-project={JSON.stringify(project)} 
        style={{ display: 'none' }}
      />
      {children}
    </>
  );
}