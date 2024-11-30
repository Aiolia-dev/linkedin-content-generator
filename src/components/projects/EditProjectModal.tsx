import { Fragment, useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Project } from '@/types/project';
import { db } from '@/lib/firebase/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { SparklesIcon } from '@heroicons/react/24/outline';

interface EditProjectModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
  onGenerateContent?: (projectId: string) => void;
}

const contentLengthOptions = [
  { id: 'short', name: 'Short', description: '150-250 words', minWords: 150, maxWords: 250 },
  { id: 'medium', name: 'Medium', description: '300-500 words', minWords: 300, maxWords: 500 },
  { id: 'long', name: 'Long', description: '600-1000 words', minWords: 600, maxWords: 1000 },
  { id: 'custom', name: 'Custom', description: 'Specify word count', minWords: 0, maxWords: 0 },
];

export default function EditProjectModal({ project, isOpen, onClose, onSave, onGenerateContent }: EditProjectModalProps) {
  const [formData, setFormData] = useState({
    subject: '',
    keywords: '',
    tone: '',
    targetAudience: '',
    contentLength: {
      type: 'medium',
      customWordCount: null as number | null,
    }
  });
  
  const [customWordCount, setCustomWordCount] = useState<number | null>(null);

  useEffect(() => {
    if (project && project.content) {
      setFormData({
        subject: project.content.subject || '',
        keywords: project.content.keywords || '',
        tone: project.content.tone || '',
        targetAudience: project.content.targetAudience || '',
        contentLength: project.content.contentLength || { type: 'medium', customWordCount: null }
      });
      if (project.content.contentLength?.type === 'custom') {
        setCustomWordCount(project.content.contentLength.customWordCount || null);
      }
    }
  }, [project]);

  const handleContentLengthChange = (lengthType: string) => {
    setFormData(prev => ({
      ...prev,
      contentLength: {
        type: lengthType,
        customWordCount: lengthType === 'custom' ? customWordCount : null
      }
    }));
  };

  const handleCustomWordCountChange = (value: number | null) => {
    setCustomWordCount(value);
    setFormData(prev => ({
      ...prev,
      contentLength: {
        type: 'custom',
        customWordCount: value
      }
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;

    setIsSaving(true);
    try {
      const projectRef = doc(db, 'projects', project.id);
      
      // Get the word count range based on content length type
      const selectedOption = contentLengthOptions.find(opt => opt.id === formData.contentLength.type);
      const wordCount = formData.contentLength.type === 'custom' 
        ? formData.contentLength.customWordCount
        : selectedOption 
          ? Math.floor((selectedOption.minWords + selectedOption.maxWords) / 2) 
          : null;

      const updatedProject = {
        ...project,
        content: {
          ...project.content,
          subject: formData.subject,
          keywords: formData.keywords,
          tone: formData.tone,
          targetAudience: formData.targetAudience,
          contentLength: {
            type: formData.contentLength.type,
            customWordCount: wordCount,
            ...(selectedOption && {
              minWords: selectedOption.minWords,
              maxWords: selectedOption.maxWords
            })
          }
        }
      };
      
      await updateDoc(projectRef, updatedProject);
      toast.success('Project updated successfully');
      if (onSave) onSave();
      onClose();
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error('Failed to update project');
    } finally {
      setIsSaving(false);
    }
  };

  const [isSaving, setIsSaving] = useState(false);

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="absolute right-0 top-0 pr-4 pt-4">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900">
                      Edit Project
                    </Dialog.Title>
                    <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                      <div className="mt-4 space-y-4">
                        <div>
                          <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                            Subject
                          </label>
                          <input
                            type="text"
                            name="subject"
                            id="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            className="mt-1 block w-full h-10 rounded-md border border-gray-300 px-3 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-gray-900"
                          />
                        </div>

                        <div>
                          <label htmlFor="keywords" className="block text-sm font-medium text-gray-700">
                            Keywords
                          </label>
                          <input
                            type="text"
                            name="keywords"
                            id="keywords"
                            value={formData.keywords}
                            onChange={handleChange}
                            className="mt-1 block w-full h-10 rounded-md border border-gray-300 px-3 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-gray-900"
                            placeholder="Separate keywords with commas"
                          />
                        </div>

                        <div>
                          <label htmlFor="tone" className="block text-sm font-medium text-gray-700">
                            Tone
                          </label>
                          <input
                            type="text"
                            name="tone"
                            id="tone"
                            value={formData.tone}
                            onChange={handleChange}
                            className="mt-1 block w-full h-10 rounded-md border border-gray-300 px-3 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-gray-900"
                          />
                        </div>

                        <div>
                          <label htmlFor="targetAudience" className="block text-sm font-medium text-gray-700">
                            Target Audience
                          </label>
                          <input
                            type="text"
                            name="targetAudience"
                            id="targetAudience"
                            value={formData.targetAudience}
                            onChange={handleChange}
                            className="mt-1 block w-full h-10 rounded-md border border-gray-300 px-3 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-gray-900"
                          />
                        </div>

                        <div>
                          <label className="text-base font-medium text-gray-900">Content Length</label>
                          <p className="text-sm text-gray-500">Choose the desired length for your content</p>

                          {/* Standard length options in a row */}
                          <div className="grid grid-cols-3 gap-3 mt-4">
                            {contentLengthOptions.filter(option => option.id !== 'custom').map((option) => (
                              <div
                                key={option.id}
                                className={`relative flex cursor-pointer rounded-lg border ${
                                  formData.contentLength.type === option.id
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-300'
                                } p-4 shadow-sm focus:outline-none`}
                                onClick={() => handleContentLengthChange(option.id)}
                              >
                                <div className="flex w-full items-center justify-between">
                                  <div className="flex items-center">
                                    <div className="text-sm">
                                      <p className={`font-medium ${
                                        formData.contentLength.type === option.id ? 'text-blue-900' : 'text-gray-900'
                                      }`}>
                                        {option.name}
                                      </p>
                                      <p className={`${
                                        formData.contentLength.type === option.id ? 'text-blue-700' : 'text-gray-500'
                                      }`}>
                                        {option.description}
                                      </p>
                                    </div>
                                  </div>
                                  <div
                                    className={`h-5 w-5 rounded-full border flex items-center justify-center ${
                                      formData.contentLength.type === option.id
                                        ? 'border-blue-500 bg-blue-500'
                                        : 'border-gray-300 bg-white'
                                    }`}
                                  >
                                    {formData.contentLength.type === option.id && (
                                      <div className="h-2.5 w-2.5 rounded-full bg-white" />
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Custom option as a separate section */}
                          <div className="mt-4">
                            <div
                              className={`relative flex cursor-pointer rounded-lg border ${
                                formData.contentLength.type === 'custom'
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-gray-300'
                              } p-4 shadow-sm focus:outline-none`}
                              onClick={() => handleContentLengthChange('custom')}
                            >
                              <div className="flex w-full items-center justify-between">
                                <div className="flex items-center">
                                  <div className="text-sm">
                                    <p className={`font-medium ${
                                      formData.contentLength.type === 'custom' ? 'text-blue-900' : 'text-gray-900'
                                    }`}>
                                      Custom
                                    </p>
                                    <p className={`${
                                      formData.contentLength.type === 'custom' ? 'text-blue-700' : 'text-gray-500'
                                    }`}>
                                      Specify word count
                                    </p>
                                  </div>
                                </div>
                                <div
                                  className={`h-5 w-5 rounded-full border flex items-center justify-center ${
                                    formData.contentLength.type === 'custom'
                                      ? 'border-blue-500 bg-blue-500'
                                      : 'border-gray-300 bg-white'
                                  }`}
                                >
                                  {formData.contentLength.type === 'custom' && (
                                    <div className="h-2.5 w-2.5 rounded-full bg-white" />
                                  )}
                                </div>
                              </div>
                            </div>
                            {formData.contentLength.type === 'custom' && (
                              <div className="mt-4">
                                <label htmlFor="customWordCount" className="block text-sm font-medium text-gray-700">
                                  Specify Word Count
                                </label>
                                <div className="mt-1">
                                  <input
                                    type="number"
                                    id="customWordCount"
                                    min="50"
                                    max="2000"
                                    value={customWordCount ?? ''}
                                    onChange={(e) => handleCustomWordCountChange(e.target.value ? Number(e.target.value) : null)}
                                    className="mt-1 block w-full h-10 rounded-md border border-gray-300 px-3 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-gray-900"
                                    placeholder="Enter word count (50-2000)"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="mt-8 sm:flex sm:flex-row-reverse gap-3">
                        {project?.status === 'draft' && !project.generatedContent && (
                          <button
                            type="button"
                            onClick={() => {
                              if (onGenerateContent && project) {
                                onGenerateContent(project.id);
                              }
                              onClose();
                            }}
                            className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3"
                          >
                            <SparklesIcon className="h-4 w-4 mr-2" />
                            Generate Content
                          </button>
                        )}
                        <button
                          type="submit"
                          disabled={isSaving}
                          className="w-full sm:w-auto inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:text-sm"
                        >
                          {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button
                          type="button"
                          className="mt-3 sm:mt-0 w-full sm:w-auto inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
                          onClick={onClose}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
