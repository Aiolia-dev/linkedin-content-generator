import { OnboardingData } from '@/app/(onboarding)/onboarding/page';
import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase/config';

interface ContentPreferencesStepProps {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

interface UserInfo {
  firstName?: string;
  lastName?: string;
  companyName?: string;
  agencyName?: string;
}

interface ContentPreferences {
  tone?: string;
  frequency?: string;
  topics?: string[];
}

interface OnboardingData {
  userType: 'individual' | 'business' | 'agency';
  userInfo: UserInfo;
  contentPreferences: ContentPreferences;
}

const tones = [
  {
    id: 'professional',
    title: 'Professional',
    description: 'Formal and business-oriented content',
    icon: '👔',
  },
  {
    id: 'casual',
    title: 'Casual',
    description: 'Friendly and approachable content',
    icon: '😊',
  },
  {
    id: 'technical',
    title: 'Technical',
    description: 'Detailed and expertise-focused content',
    icon: '🔧',
  },
] as const;

const frequencies = [
  {
    id: 'daily',
    title: 'Daily',
    description: 'Maximum visibility and engagement',
  },
  {
    id: 'weekly',
    title: 'Weekly',
    description: 'Balanced and consistent presence',
  },
  {
    id: 'monthly',
    title: 'Monthly',
    description: 'Quality over quantity focus',
  },
] as const;

const suggestedTopics = [
  'Leadership',
  'Innovation',
  'Technology',
  'Marketing',
  'Sales',
  'Personal Development',
  'Business Strategy',
  'Entrepreneurship',
  'Digital Transformation',
  'Career Growth',
  'Industry Trends',
  'Professional Tips',
];

export default function ContentPreferencesStep({
  data,
  updateData,
  onNext,
  onBack,
}: ContentPreferencesStepProps) {
  const [error, setError] = useState('');
  const [customTopic, setCustomTopic] = useState('');
  const [isGoogleAuth, setIsGoogleAuth] = useState(false);

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté via Google
    const user = auth.currentUser;
    const isGoogle = user?.providerData[0]?.providerId === 'google.com';
    setIsGoogleAuth(isGoogle);

    // Si c'est un utilisateur Google, pré-remplir les champs avec les données Google
    if (isGoogle && user) {
      const nameParts = user.displayName?.split(' ') || ['', ''];
      updateData({
        userInfo: {
          ...data.userInfo,
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || '',
        },
      });
    }
  }, []);

  const handleToneSelect = (tone: typeof tones[number]['id']) => {
    updateData({
      contentPreferences: {
        ...data.contentPreferences,
        tone,
      },
    });
  };

  const handleFrequencySelect = (frequency: typeof frequencies[number]['id']) => {
    updateData({
      contentPreferences: {
        ...data.contentPreferences,
        frequency,
      },
    });
  };

  const handleTopicToggle = (topic: string) => {
    const currentTopics = data.contentPreferences.topics;
    const newTopics = currentTopics.includes(topic)
      ? currentTopics.filter((t) => t !== topic)
      : [...currentTopics, topic];

    updateData({
      contentPreferences: {
        ...data.contentPreferences,
        topics: newTopics,
      },
    });
  };

  const handleAddCustomTopic = () => {
    if (customTopic.trim() && !data.contentPreferences.topics.includes(customTopic)) {
      updateData({
        contentPreferences: {
          ...data.contentPreferences,
          topics: [...data.contentPreferences.topics, customTopic.trim()],
        },
      });
      setCustomTopic('');
    }
  };

  const handleUserInfoChange = (field: string, value: string) => {
    setError('');
    updateData({
      userInfo: {
        ...data.userInfo,
        [field]: value,
      },
    });
  };

  const validateUserInfo = () => {
    if (data.userType === 'individual') {
      if (!data.userInfo.firstName || !data.userInfo.lastName) {
        setError('Please enter both your first and last name');
        return false;
      }
    } else if (data.userType === 'business') {
      if (!data.userInfo.companyName) {
        setError('Please enter your company name');
        return false;
      }
    } else if (data.userType === 'agency') {
      if (!data.userInfo.agencyName) {
        setError('Please enter your agency name');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (!validateUserInfo()) return;
    if (!data.contentPreferences.tone) {
      setError('Please select a content tone to continue');
      return;
    }
    if (!data.contentPreferences.frequency) {
      setError('Please select a posting frequency to continue');
      return;
    }
    if (data.contentPreferences.topics.length === 0) {
      setError('Please select at least one topic');
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-8">
      {/* User Info Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Tell us more about you</h2>
        
        {data.userType === 'individual' && (
          <div className="grid grid-cols-2 gap-4">
            {isGoogleAuth ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">First Name</label>
                  <input
                    type="text"
                    value={data.userInfo.firstName || ''}
                    className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 text-gray-800 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Name</label>
                  <input
                    type="text"
                    value={data.userInfo.lastName || ''}
                    className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 text-gray-800 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    disabled
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">First Name</label>
                  <input
                    type="text"
                    value={data.userInfo.firstName || ''}
                    onChange={(e) =>
                      updateData({
                        userInfo: { ...data.userInfo, firstName: e.target.value },
                      })
                    }
                    placeholder="Enter your first name"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Name</label>
                  <input
                    type="text"
                    value={data.userInfo.lastName || ''}
                    onChange={(e) =>
                      updateData({
                        userInfo: { ...data.userInfo, lastName: e.target.value },
                      })
                    }
                    placeholder="Enter your last name"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </>
            )}
          </div>
        )}

        {data.userType === 'business' && (
          <div>
            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
              Company Name
            </label>
            <input
              type="text"
              id="companyName"
              value={data.userInfo.companyName || ''}
              onChange={(e) => handleUserInfoChange('companyName', e.target.value)}
              className="input-common"
              placeholder="Enter your company name"
            />
          </div>
        )}

        {data.userType === 'agency' && (
          <div>
            <label htmlFor="agencyName" className="block text-sm font-medium text-gray-700">
              Agency Name
            </label>
            <input
              type="text"
              id="agencyName"
              value={data.userInfo.agencyName || ''}
              onChange={(e) => handleUserInfoChange('agencyName', e.target.value)}
              className="input-common"
              placeholder="Enter your agency name"
            />
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Content Preferences</h2>
        {/* Tone Selection */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Content Tone</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            {tones.map((tone) => (
              <button
                key={tone.id}
                onClick={() => handleToneSelect(tone.id)}
                className={`p-6 text-left border-2 rounded-xl transition-all ${
                  data.contentPreferences.tone === tone.id
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-200 hover:border-indigo-200'
                }`}
              >
                <div className="text-3xl mb-3">{tone.icon}</div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">{tone.title}</h4>
                <p className="text-sm text-gray-700">{tone.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Posting Frequency */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 mt-8">Posting Frequency</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            {frequencies.map((freq) => (
              <button
                key={freq.id}
                onClick={() => handleFrequencySelect(freq.id)}
                className={`p-6 text-left border-2 rounded-xl transition-all ${
                  data.contentPreferences.frequency === freq.id
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-200 hover:border-indigo-200'
                }`}
              >
                <h4 className="text-lg font-medium text-gray-900 mb-2">{freq.title}</h4>
                <p className="text-sm text-gray-700">{freq.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Topics Selection */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 mt-8">Topics of Interest</h3>
          <p className="text-gray-700 mb-4">Select topics that interest you (at least 3)</p>
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {/* Afficher tous les topics sélectionnés en premier */}
              {data.contentPreferences.topics.map((topic) => (
                <button
                  key={topic}
                  onClick={() => handleTopicToggle(topic)}
                  className="px-4 py-2 rounded-full text-sm transition-all bg-indigo-600 text-white"
                >
                  {topic}
                </button>
              ))}
              {/* Afficher les topics suggérés non sélectionnés */}
              {suggestedTopics
                .filter((topic) => !data.contentPreferences.topics.includes(topic))
                .map((topic) => (
                  <button
                    key={topic}
                    onClick={() => handleTopicToggle(topic)}
                    className="px-4 py-2 rounded-full text-sm transition-all bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    {topic}
                  </button>
                ))}
            </div>
          </div>

          {/* Custom Topic Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              placeholder="Add custom topic..."
              className="input-common flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddCustomTopic();
                }
              }}
            />
            <button
              onClick={handleAddCustomTopic}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={!customTopic.trim()}
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {error && <p className="text-red-500 text-sm text-center">{error}</p>}

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-6 py-2 text-gray-600 hover:text-gray-900"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
