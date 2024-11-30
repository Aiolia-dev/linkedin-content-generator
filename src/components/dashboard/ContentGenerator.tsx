import { useState } from 'react';
import { useAuthStore } from '@/store/auth';

interface ContentGeneratorProps {
  onGenerate: (content: GeneratedContent) => void;
}

export interface GeneratedContent {
  title: string;
  content: string;
  topic: string;
  tone: 'professional' | 'casual' | 'technical';
}

export default function ContentGenerator({ onGenerate }: ContentGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a topic or idea for your post');
      return;
    }

    setGenerating(true);
    setError(null);

    try {
      // TODO: Intégrer l'appel à l'API OpenAI ici
      // Pour l'instant, on simule une génération
      const mockContent: GeneratedContent = {
        title: 'Sample LinkedIn Post',
        content: `Here's a professional post about ${prompt}...`,
        topic: prompt,
        tone: 'professional'
      };

      onGenerate(mockContent);
    } catch (error) {
      console.error('Error generating content:', error);
      setError('Failed to generate content. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Generate New Content</h2>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium text-gray-700">
            What would you like to post about?
          </label>
          <textarea
            id="prompt"
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Enter a topic or idea for your LinkedIn post..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </div>

        {error && (
          <div className="text-sm text-red-600">
            {error}
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={generating || !prompt.trim()}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
            ${generating || !prompt.trim() 
              ? 'bg-indigo-400 cursor-not-allowed' 
              : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
        >
          {generating ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </>
          ) : (
            'Generate Content'
          )}
        </button>
      </div>
    </div>
  );
}
