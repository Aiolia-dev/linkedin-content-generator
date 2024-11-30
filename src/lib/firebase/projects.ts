import { collection, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { db } from './config';
import { Project } from '@/types/project';
import { getCurrentUser } from '../auth/session';

export const createProject = async (projectData: Partial<Project>): Promise<string> => {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('User must be authenticated to create a project');
  }

  const project = {
    ...projectData,
    userId: user.uid,
    status: 'draft',
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
