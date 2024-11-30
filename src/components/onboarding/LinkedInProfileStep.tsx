import { OnboardingData } from '@/app/(onboarding)/onboarding/page';
import { useState } from 'react';

interface LinkedInProfileStepProps {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export default function LinkedInProfileStep({
  data,
  updateData,
  onNext,
  onBack,
}: LinkedInProfileStepProps) {
  const [error, setError] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  const handleLinkedInConnect = async () => {
    setIsConnecting(true);
    setError('');

    try {
      // TODO: Implement actual LinkedIn OAuth flow
      // For now, we'll simulate a successful connection
      await new Promise((resolve) => setTimeout(resolve, 1500));

      updateData({
        linkedinProfile: {
          connected: true,
          profileUrl: 'https://linkedin.com/in/username', // This will come from the OAuth response
          accessToken: 'dummy-token', // This will be the actual OAuth token
        },
      });

      onNext();
    } catch (err) {
      setError('Failed to connect to LinkedIn. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSkip = () => {
    // Update with empty LinkedIn profile data
    updateData({
      linkedinProfile: {
        connected: false,
        profileUrl: '',
        accessToken: '',
      },
    });
    onNext();
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h3 className="text-2xl font-semibold text-gray-900 mb-4">Connect Your LinkedIn Profile</h3>
        <p className="text-gray-700 mb-8">
          Connect your LinkedIn profile to enable automatic post scheduling and analytics tracking.
        </p>
      </div>

      <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-sm border">
        {!data.linkedinProfile?.connected ? (
          <div className="space-y-6">
            <div className="flex items-center justify-center">
              <img
                src="/linkedin-logo.png"
                alt="LinkedIn"
                className="w-16 h-16"
                onError={(e) => {
                  e.currentTarget.src = 'https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png';
                }}
              />
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-900 text-center">Benefits of Connecting</h4>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Automatic post scheduling to your profile</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Track post performance and engagement</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Analyze your audience demographics</span>
                </li>
              </ul>
            </div>

            <button
              onClick={handleLinkedInConnect}
              disabled={isConnecting}
              className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-colors ${
                isConnecting
                  ? 'bg-indigo-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {isConnecting ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Connecting...
                </span>
              ) : (
                'Connect LinkedIn Profile'
              )}
            </button>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <div className="text-green-500 text-5xl mb-4">✓</div>
            <h4 className="text-lg font-medium">LinkedIn Profile Connected</h4>
            <p className="text-gray-600">Your LinkedIn profile has been successfully connected.</p>
          </div>
        )}

        {error && <p className="text-red-500 text-sm text-center mt-4">{error}</p>}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <button onClick={onBack} className="px-6 py-2 text-gray-600 hover:text-gray-900">
          Back
        </button>
        {!data.linkedinProfile?.connected && (
          <button
            onClick={handleSkip}
            className="px-6 py-2 text-gray-500 hover:text-gray-700"
          >
            Skip for now
          </button>
        )}
        {data.linkedinProfile?.connected && (
          <button
            onClick={onNext}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Continue
          </button>
        )}
      </div>
    </div>
  );
}
