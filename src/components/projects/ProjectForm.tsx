'use client';

import { useState, useEffect } from 'react';
import { Project, ProjectType } from '@/types/project';
import { Persona } from '@/types/persona';
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useAuthStore } from '@/store/auth';

interface ProjectFormProps {
  type: ProjectType;
  onSubmit: (data: Partial<Project>) => void;
  disabled?: boolean;
}

const inputStyles = "h-10 mt-1 block w-full rounded-md border border-gray-300 px-3 shadow-sm focus:border-blue-400 focus:ring-1 focus:ring-blue-200 focus:ring-opacity-40 bg-white text-gray-900 transition-colors duration-200";
const labelStyles = "block text-sm font-medium text-gray-700 mb-1";

export default function ProjectForm({ type, onSubmit, disabled = false }: ProjectFormProps) {
  const { user } = useAuthStore();
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [formData, setFormData] = useState({
    subject: '',
    keywords: '',
    tone: 'professional',
    targetAudience: '',
    personaId: null as string | null,
    contentLength: {
      type: 'medium' as const,
      customWordCount: null as number | null,
    },
  });

  const [showCustomWordCount, setShowCustomWordCount] = useState(false);
  const [customWordCountError, setCustomWordCountError] = useState<string | null>(null);

  useEffect(() => {
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

    loadPersonas();
  }, [user]);

  const validateCustomWordCount = (count: number | null) => {
    if (count === null) return 'Word count is required';
    if (count < 1) return 'Word count must be at least 1';
    if (count > 10000) return 'Word count cannot exceed 10,000';
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.contentLength.type === 'custom') {
      const error = validateCustomWordCount(formData.contentLength.customWordCount);
      if (error) {
        setCustomWordCountError(error);
        return;
      }
    }

    const cleanedData = {
      type,
      subject: formData.subject,
      keywords: formData.keywords.split(',').map(k => k.trim()).filter(k => k !== ''),
      tone: formData.tone,
      contentLength: formData.contentLength.type,
      persona: formData.personaId || undefined,
      status: 'draft' as const
    };

    onSubmit(cleanedData);
  };

  const handleContentLengthChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      contentLength: {
        type: value as 'short' | 'medium' | 'long' | 'custom',
        customWordCount: value === 'custom' ? prev.contentLength.customWordCount : null,
      }
    }));
    setShowCustomWordCount(value === 'custom');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="subject" className={labelStyles}>Subject/Topic</label>
        <input
          type="text"
          id="subject"
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          className={inputStyles}
          placeholder="Enter the main topic of your content"
          required
          disabled={disabled}
        />
      </div>

      <div>
        <label htmlFor="keywords" className={labelStyles}>Keywords (comma separated)</label>
        <input
          type="text"
          id="keywords"
          value={formData.keywords}
          onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
          className={inputStyles}
          placeholder="e.g., technology, innovation, future"
          disabled={disabled}
        />
      </div>

      <div>
        <label htmlFor="contentLength" className={labelStyles}>Content Length</label>
        <select
          id="contentLength"
          value={formData.contentLength.type}
          onChange={(e) => handleContentLengthChange(e.target.value)}
          className={inputStyles}
          disabled={disabled}
        >
          <option value="short">Short (150-250 words)</option>
          <option value="medium">Medium (300-500 words)</option>
          <option value="long">Long (600-1000 words)</option>
          <option value="custom">Custom</option>
        </select>
      </div>

      {showCustomWordCount && (
        <div>
          <label htmlFor="customWordCount" className={labelStyles}>Custom Word Count</label>
          <input
            type="number"
            id="customWordCount"
            value={formData.contentLength.customWordCount || ''}
            onChange={(e) => {
              const value = parseInt(e.target.value) || null;
              setFormData({
                ...formData,
                contentLength: {
                  ...formData.contentLength,
                  customWordCount: value,
                }
              });
              setCustomWordCountError(validateCustomWordCount(value));
            }}
            className={`${inputStyles} ${customWordCountError ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''}`}
            placeholder="Enter desired word count"
            min="1"
            max="10000"
            disabled={disabled}
          />
          {customWordCountError && (
            <p className="mt-1 text-sm text-red-600">{customWordCountError}</p>
          )}
        </div>
      )}

      <div>
        <label htmlFor="tone" className={labelStyles}>Tone</label>
        <select
          id="tone"
          value={formData.tone}
          onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
          className={inputStyles}
          disabled={disabled}
        >
          <option value="professional">Professional</option>
          <option value="casual">Casual</option>
          <option value="friendly">Friendly</option>
          <option value="authoritative">Authoritative</option>
          <option value="educational">Educational</option>
        </select>
      </div>

      <div>
        <label htmlFor="targetAudience" className={labelStyles}>Target Audience</label>
        <input
          type="text"
          id="targetAudience"
          value={formData.targetAudience}
          onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
          className={inputStyles}
          placeholder="e.g., tech professionals, entrepreneurs"
          disabled={disabled}
        />
      </div>

      <div>
        <label htmlFor="persona" className={labelStyles}>
          Persona (Optional)
          <span className="ml-1 text-sm text-gray-500 font-normal">- Select a persona to personalize your content</span>
        </label>
        <select
          id="persona"
          value={formData.personaId || ''}
          onChange={(e) => setFormData({ ...formData, personaId: e.target.value || null })}
          className={inputStyles}
          disabled={disabled}
        >
          <option value="">No persona selected</option>
          {personas.map((persona) => (
            <option key={persona.id} value={persona.id}>
              {persona.title}
            </option>
          ))}
        </select>
      </div>

      <div className="pt-4">
        <button
          type="submit"
          disabled={disabled}
          className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-colors duration-200 ${
            disabled
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          }`}
        >
          {disabled ? 'Creating...' : 'Create Project'}
        </button>
      </div>
    </form>
  );
}
