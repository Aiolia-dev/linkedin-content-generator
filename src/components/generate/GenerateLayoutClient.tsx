'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Project } from '@/types/project';
import { useAuthStore } from '@/store/auth';

interface GenerateLayoutClientProps {
  projectId: string;
  children: React.ReactNode;
}

export default function GenerateLayoutClient({ projectId, children }: GenerateLayoutClientProps) {
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    let mounted = true;

    async function fetchProject() {
      if (!projectId) return;
      
      try {
        if (!user) {
          setError('Authentication required');
          return;
        }

        const projectRef = doc(db, 'projects', projectId);
        const projectSnap = await getDoc(projectRef);
        
        if (!mounted) return;

        if (!projectSnap.exists()) {
          setError('Project not found');
          return;
        }

        const projectData = projectSnap.data();
        if (projectData.userId !== user.uid) {
          setError('Unauthorized access');
          return;
        }

        setProject({ id: projectSnap.id, ...projectData } as Project);
      } catch (error) {
        if (mounted) {
          console.error('Error fetching project:', error);
          setError('Failed to load project details');
        }
      }
    }

    fetchProject();
    return () => { mounted = false; };
  }, [projectId, user]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div>
      {children}
      <div id="project-data" data-project={JSON.stringify(project)} />
    </div>
  );
}
