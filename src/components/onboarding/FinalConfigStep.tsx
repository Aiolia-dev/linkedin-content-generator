import { OnboardingData } from '@/app/(onboarding)/onboarding/page';
import { useState } from 'react';

interface FinalConfigStepProps {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

const notificationOptions = [
  {
    id: 'all',
    title: 'All Updates',
    description: 'Receive notifications for post performance, engagement, and system updates',
  },
  {
    id: 'important',
    title: 'Important Only',
    description: 'Receive notifications for significant engagement milestones and system updates',
  },
  {
    id: 'none',
    title: 'None',
    description: 'Opt out of all notifications',
  },
] as const;

const aiAssistanceOptions = [
  {
    id: 'aggressive',
    title: 'Proactive',
    description: 'AI suggests content improvements and optimizations automatically',
  },
  {
    id: 'balanced',
    title: 'Balanced',
    description: 'AI provides suggestions when requested',
  },
  {
    id: 'minimal',
    title: 'Minimal',
    description: 'AI assistance only for basic tasks',
  },
] as const;

export default function FinalConfigStep({
  data,
  updateData,
  onNext,
  onBack,
}: FinalConfigStepProps) {
  const [error, setError] = useState('');

  const handleNotificationChange = (option: typeof notificationOptions[number]['id']) => {
    updateData({
      preferences: {
        ...data.preferences,
        notifications: option,
      },
    });
  };

  const handleAIAssistanceChange = (option: typeof aiAssistanceOptions[number]['id']) => {
    updateData({
      preferences: {
        ...data.preferences,
        aiAssistance: option,
      },
    });
  };

  const handleFinish = () => {
    if (!data.preferences?.notifications) {
      setError('Please select your notification preferences');
      return;
    }
    if (!data.preferences?.aiAssistance) {
      setError('Please select your AI assistance level');
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h3 className="text-2xl font-semibold text-gray-900 mb-4">Final Configuration</h3>
        <p className="text-gray-700 mb-8">
          Customize your experience with these final settings. You can always change these later.
        </p>
      </div>

      {/* Notification Preferences */}
      <div className="space-y-4">
        <h4 className="text-lg font-medium text-gray-900">Notification Preferences</h4>
        <div className="grid gap-4 sm:grid-cols-3">
          {notificationOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => handleNotificationChange(option.id)}
              className={`p-4 text-left border-2 rounded-xl transition-all ${
                data.preferences?.notifications === option.id
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-gray-200 hover:border-indigo-200'
              }`}
            >
              <h5 className="font-medium text-gray-900">{option.title}</h5>
              <p className="text-sm text-gray-700">{option.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* AI Assistance Level */}
      <div className="space-y-4">
        <h4 className="text-lg font-medium text-gray-900">AI Assistance Level</h4>
        <div className="grid gap-4 sm:grid-cols-3">
          {aiAssistanceOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => handleAIAssistanceChange(option.id)}
              className={`p-4 text-left border-2 rounded-xl transition-all ${
                data.preferences?.aiAssistance === option.id
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-gray-200 hover:border-indigo-200'
              }`}
            >
              <h5 className="font-medium text-gray-900">{option.title}</h5>
              <p className="text-sm text-gray-700">{option.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="bg-gray-50 p-6 rounded-xl">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Configuration Summary</h4>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-700">User Type</p>
            <p className="font-medium text-gray-900">{data.userType || 'Not selected'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-700">Content Tone</p>
            <p className="font-medium text-gray-900">{data.contentPreferences?.tone || 'Not selected'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-700">Posting Frequency</p>
            <p className="font-medium text-gray-900">{data.contentPreferences?.frequency || 'Not selected'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-700">LinkedIn Profile</p>
            <p className="font-medium text-gray-900">
              {data.linkedInProfile?.connected ? 'Connected' : 'Not connected'}
            </p>
          </div>
        </div>
      </div>

      {error && <p className="text-red-500 text-sm text-center">{error}</p>}

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <button onClick={onBack} className="px-6 py-2 text-gray-900 hover:text-gray-900">
          Back
        </button>
        <button
          onClick={handleFinish}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Complete Setup
        </button>
      </div>
    </div>
  );
}
