import { OnboardingData } from '@/app/(onboarding)/onboarding/page';
import { useState } from 'react';

interface UserTypeStepProps {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

const userTypes = [
  {
    id: 'individual',
    title: 'Individual',
    description: 'Personal branding and professional growth',
    icon: '👤',
  },
  {
    id: 'business',
    title: 'Business',
    description: 'Company presence and brand awareness',
    icon: '🏢',
  },
  {
    id: 'agency',
    title: 'Agency',
    description: 'Managing multiple client accounts',
    icon: '🤝',
  },
] as const;

export default function UserTypeStep({
  data,
  updateData,
  onNext,
  onBack,
  isFirstStep,
}: UserTypeStepProps) {
  const [error, setError] = useState('');

  const handleUserTypeSelect = (userType: string) => {
    setError('');
    updateData({ userType });
  };

  const handleNext = () => {
    if (!data.userType) {
      setError('Please select a user type to continue');
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h3 className="text-2xl font-semibold text-gray-900 mb-4">Welcome! Let's get started</h3>
        <p className="text-gray-700 mb-8">
          Tell us about yourself so we can personalize your experience.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {userTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => handleUserTypeSelect(type.id)}
            className={`p-6 text-left border-2 rounded-xl transition-all ${
              data.userType === type.id
                ? 'border-indigo-600 bg-indigo-50'
                : 'border-gray-200 hover:border-indigo-200'
            }`}
          >
            <div className="text-3xl mb-3">{type.icon}</div>
            <h4 className="text-lg font-medium text-gray-800 mb-2">{type.title}</h4>
            <p className="text-sm text-gray-800">{type.description}</p>
          </button>
        ))}
      </div>

      {error && <p className="text-red-500 text-sm text-center">{error}</p>}

      {/* Navigation Buttons */}
      <div className="flex justify-end">
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
