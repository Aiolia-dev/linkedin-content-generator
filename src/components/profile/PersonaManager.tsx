import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import { db } from '@/lib/firebase/config';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { Persona, PersonaFormData } from '@/types/persona';
import { PlusIcon, PencilIcon, TrashIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';

export default function PersonaManager() {
  const { user } = useAuthStore();
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPersona, setEditingPersona] = useState<Persona | null>(null);
  const [formData, setFormData] = useState<PersonaFormData>({
    title: '',
    description: '',
  });

  useEffect(() => {
    if (user) {
      loadPersonas();
    }
  }, [user]);

  const loadPersonas = async () => {
    if (!user) return;
    const q = query(collection(db, 'personas'), where('userId', '==', user.uid));
    const querySnapshot = await getDocs(q);
    const loadedPersonas = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Persona[];
    setPersonas(loadedPersonas);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      if (editingPersona) {
        await updateDoc(doc(db, 'personas', editingPersona.id), {
          ...formData,
          updatedAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, 'personas'), {
          ...formData,
          userId: user.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      await loadPersonas();
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving persona:', error);
    }
  };

  const handleDelete = async (personaId: string) => {
    if (confirm('Are you sure you want to delete this persona?')) {
      try {
        await deleteDoc(doc(db, 'personas', personaId));
        await loadPersonas();
      } catch (error) {
        console.error('Error deleting persona:', error);
      }
    }
  };

  const handleDuplicate = async (persona: Persona) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'personas'), {
        title: `${persona.title} (Copy)`,
        description: persona.description,
        parentId: persona.parentId || persona.id,
        userId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      await loadPersonas();
    } catch (error) {
      console.error('Error duplicating persona:', error);
    }
  };

  const resetForm = () => {
    setFormData({ title: '', description: '' });
    setEditingPersona(null);
  };

  const openEditModal = (persona: Persona) => {
    setEditingPersona(persona);
    setFormData({
      title: persona.title,
      description: persona.description,
      parentId: persona.parentId,
    });
    setIsModalOpen(true);
  };

  // Organiser les personas en arborescence
  const organizePersonas = (personas: Persona[]) => {
    const rootPersonas = personas.filter(p => !p.parentId);
    const variants = personas.filter(p => p.parentId);
    
    return rootPersonas.map(persona => ({
      ...persona,
      variants: variants.filter(v => v.parentId === persona.id),
    }));
  };

  const organizedPersonas = organizePersonas(personas);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">My Personas</h2>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          New Persona
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {organizedPersonas.map((persona) => (
          <div key={persona.id} className="space-y-4">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{persona.title}</h3>
                  <p className="mt-2 text-sm text-gray-600">{persona.description}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleDuplicate(persona)}
                    className="p-2 text-gray-400 hover:text-gray-500"
                    title="Duplicate"
                  >
                    <DocumentDuplicateIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => openEditModal(persona)}
                    className="p-2 text-gray-400 hover:text-gray-500"
                    title="Edit"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(persona.id)}
                    className="p-2 text-gray-400 hover:text-gray-500"
                    title="Delete"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              {/* Variants */}
              {persona.variants && persona.variants.length > 0 && (
                <div className="mt-4 pl-6 border-l-2 border-gray-200 space-y-4">
                  {persona.variants.map((variant) => (
                    <div key={variant.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-md font-medium text-gray-900">{variant.title}</h4>
                          <p className="mt-2 text-sm text-gray-600">{variant.description}</p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleDuplicate(variant)}
                            className="p-2 text-gray-400 hover:text-gray-500"
                            title="Duplicate"
                          >
                            <DocumentDuplicateIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => openEditModal(variant)}
                            className="p-2 text-gray-400 hover:text-gray-500"
                            title="Edit"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(variant.id)}
                            className="p-2 text-gray-400 hover:text-gray-500"
                            title="Delete"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal pour créer/éditer un persona */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingPersona ? 'Edit Persona' : 'New Persona'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="mt-1 block w-full h-10 px-3 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-gray-900 placeholder-gray-500"
                  maxLength={50}
                  required
                  placeholder="Enter persona title"
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 block w-full h-[140px] py-3 px-3 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-gray-900 placeholder-gray-500"
                  maxLength={400}
                  required
                  placeholder="Développeuse full-stack senior avec 8 ans d'expérience, je me suis spécialisée dans la création d'applications web robustes et évolutives. Mon expertise en React, Node.js et architecture cloud m'a permis de piloter des projets d'envergure. Diplômée d'une école d'ingénieur, j'ai débuté dans une startup avant de rejoindre une scale-up en croissance."
                />
                <p className="mt-1 text-sm text-gray-500">
                  {formData.description.length}/400 characters
                </p>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {editingPersona ? 'Save Changes' : 'Create Persona'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
