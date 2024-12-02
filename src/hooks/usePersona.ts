import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export interface Persona {
  id: string;
  name?: string;
  title: string;
  description: string;
  role?: string;
  company?: string;
}

export const usePersona = (personaId: string | undefined) => {
  const [persona, setPersona] = useState<Persona | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('usePersona effect triggered with personaId:', personaId);
    
    const fetchPersona = async () => {
      if (!personaId) {
        console.log('No personaId provided, resetting persona state');
        setPersona(null);
        setIsLoading(false);
        setError(null);
        return;
      }

      setIsLoading(true);
      setError(null);
      console.log('Starting persona fetch for ID:', personaId);

      try {
        const personaRef = doc(db, 'personas', personaId);
        console.log('Fetching persona document...');
        const personaDoc = await getDoc(personaRef);
        
        if (!personaDoc.exists()) {
          console.log('Persona document not found in Firestore');
          throw new Error('Persona not found');
        }

        const data = personaDoc.data();
        console.log('Raw persona data from Firestore:', data);
        
        if (!data) {
          throw new Error('Persona data is empty');
        }

        const personaData = {
          id: personaDoc.id,
          title: data.title || '',
          description: data.description || '',
          name: data.name || '',
          role: data.role || '',
          company: data.company || '',
        } as Persona;

        console.log('Formatted persona data:', personaData);
        setPersona(personaData);
        setError(null);
      } catch (err) {
        console.error('Error in fetchPersona:', err);
        setError(err instanceof Error ? err.message : 'Failed to load persona');
        setPersona(null);
      } finally {
        console.log('Finishing persona fetch, setting isLoading to false');
        setIsLoading(false);
      }
    };

    fetchPersona();
  }, [personaId]);

  return { persona, isLoading, error };
};
