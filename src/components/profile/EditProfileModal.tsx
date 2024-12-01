'use client';

import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import { OnboardingData } from '@/app/(onboarding)/onboarding/page';
import { toast } from 'react-hot-toast';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileData: OnboardingData;
  userId: string;
  onProfileUpdate: (updatedData: OnboardingData) => void;
}

export default function EditProfileModal({
  isOpen,
  onClose,
  profileData,
  userId,
  onProfileUpdate,
}: EditProfileModalProps) {
  const [formData, setFormData] = useState<OnboardingData>(profileData);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (
    section: keyof OnboardingData,
    field: string,
    value: string | string[]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [section]:
        typeof prev[section] === 'object'
          ? {
              ...prev[section],
              [field]: value,
            }
          : value,
    }));
  };

  const handleTopicChange = (topic: string) => {
    const topics = formData.contentPreferences.topics;
    const newTopics = topics.includes(topic)
      ? topics.filter((t) => t !== topic)
      : [...topics, topic];
    
    handleInputChange('contentPreferences', 'topics', newTopics);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, formData);
      onProfileUpdate(formData);
      toast.success('Profile updated successfully');
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const availableTopics = [
    'Technology',
    'Business',
    'Marketing',
    'Leadership',
    'Entrepreneurship',
    'Personal Development',
    'Innovation',
    'AI & Machine Learning',
    'Career Growth',
    'Industry Trends',
  ];

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
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
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
                    <Dialog.Title as="h3" className="text-xl font-semibold leading-6 text-gray-900 mb-6">
                      Edit Profile
                    </Dialog.Title>

                    <div className="space-y-6">
                      {/* User Type */}
                      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                          <h4 className="text-base font-medium text-gray-900 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                            Account Type
                          </h4>
                        </div>
                        <div className="p-4">
                          <select
                            value={formData.userType}
                            onChange={(e) => handleInputChange('userType', '', e.target.value)}
                            className="mt-1 block w-full h-10 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                          >
                            <option value="individual">Individual</option>
                            <option value="business">Business</option>
                            <option value="creator">Creator</option>
                          </select>
                        </div>
                      </div>

                      {/* Content Preferences */}
                      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                          <h4 className="text-base font-medium text-gray-900 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                            </svg>
                            Content Preferences
                          </h4>
                        </div>
                        <div className="p-4 space-y-4">
                          {/* Tone */}
                          <div className="bg-gray-50 p-3 rounded-md">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Content Tone</label>
                            <select
                              value={formData.contentPreferences.tone}
                              onChange={(e) =>
                                handleInputChange('contentPreferences', 'tone', e.target.value)
                              }
                              className="block w-full h-10 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                            >
                              <option value="professional">Professional</option>
                              <option value="casual">Casual</option>
                              <option value="friendly">Friendly</option>
                              <option value="formal">Formal</option>
                            </select>
                          </div>

                          {/* Frequency */}
                          <div className="bg-gray-50 p-3 rounded-md">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Posting Frequency
                            </label>
                            <select
                              value={formData.contentPreferences.frequency}
                              onChange={(e) =>
                                handleInputChange('contentPreferences', 'frequency', e.target.value)
                              }
                              className="block w-full h-10 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                            >
                              <option value="daily">Daily</option>
                              <option value="weekly">Weekly</option>
                              <option value="biweekly">Bi-weekly</option>
                              <option value="monthly">Monthly</option>
                            </select>
                          </div>

                          {/* Topics */}
                          <div className="bg-gray-50 p-3 rounded-md">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Topics of Interest
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                              {availableTopics.map((topic) => (
                                <label key={topic} className="relative flex items-start py-2">
                                  <div className="min-w-0 flex-1 text-sm">
                                    <div className="select-none font-medium text-gray-700">
                                      <input
                                        type="checkbox"
                                        checked={formData.contentPreferences.topics.includes(topic)}
                                        onChange={() => handleTopicChange(topic)}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                                      />
                                      {topic}
                                    </div>
                                  </div>
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Preferences */}
                      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                          <h4 className="text-base font-medium text-gray-900 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                            </svg>
                            User Preferences
                          </h4>
                        </div>
                        <div className="p-4 space-y-4">
                          {/* Notifications */}
                          <div className="bg-gray-50 p-3 rounded-md">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Notification Settings
                            </label>
                            <select
                              value={formData.preferences.notifications}
                              onChange={(e) =>
                                handleInputChange('preferences', 'notifications', e.target.value)
                              }
                              className="block w-full h-10 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                            >
                              <option value="all">All Notifications</option>
                              <option value="important">Important Only</option>
                              <option value="none">None</option>
                            </select>
                          </div>

                          {/* AI Assistance */}
                          <div className="bg-gray-50 p-3 rounded-md">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              AI Assistance Level
                            </label>
                            <select
                              value={formData.preferences.aiAssistance}
                              onChange={(e) =>
                                handleInputChange('preferences', 'aiAssistance', e.target.value)
                              }
                              className="block w-full h-10 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                            >
                              <option value="high">High (More AI Suggestions)</option>
                              <option value="medium">Medium (Balanced)</option>
                              <option value="low">Low (Minimal AI Input)</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:ml-3 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                  >
                    Cancel
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
