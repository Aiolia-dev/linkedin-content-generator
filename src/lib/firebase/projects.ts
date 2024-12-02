import { collection, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { db } from './config';
import { Project, Tone, ContentLengthConfig } from '@/types/project';
import { getCurrentUser } from '../auth/session';

export const createProject = async (projectData: Partial<Project>): Promise<string> => {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('User must be authenticated to create a project');
  }

  // Ensure required fields have default values
  const project = {
    type: projectData.type || 'linkedin_post',
    content: {
      title: projectData.subject || '',  // Utiliser le sujet comme titre par défaut
      subject: projectData.subject || '',
      tone: projectData.tone || 'professional' as Tone,
      contentLength: projectData.contentLength || {
        type: 'medium'
      } as ContentLengthConfig,
      keywords: projectData.keywords || [],
    },
    status: 'draft',
    userId: user.uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, 'projects'), project);
  return docRef.id;
};

export const deleteProject = async (projectId: string): Promise<void> => {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('User must be authenticated to delete a project');
  }

  await deleteDoc(doc(db, 'projects', projectId));
};
