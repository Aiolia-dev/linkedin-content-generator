import { auth } from '@/lib/firebase/config';
import { User } from 'firebase/auth';

export const getCurrentUser = (): Promise<User | null> => {
  return new Promise((resolve) => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      unsubscribe();
      resolve(user);
    });
  });
};

export const setSessionCookie = async (user: User) => {
  const idToken = await user.getIdToken();
  
  // Envoyer le token au backend pour créer un cookie sécurisé
  const response = await fetch('/api/auth/session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ idToken }),
  });

  if (!response.ok) {
    throw new Error('Failed to set session');
  }
};
