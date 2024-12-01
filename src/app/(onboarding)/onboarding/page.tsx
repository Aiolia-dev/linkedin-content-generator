'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase/config';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import UserTypeStep from '@/components/onboarding/UserTypeStep';
import ContentPreferencesStep from '@/components/onboarding/ContentPreferencesStep';
import LinkedInProfileStep from '@/components/onboarding/LinkedInProfileStep';
import FinalConfigStep from '@/components/onboarding/FinalConfigStep';
import RouteGuard from '@/components/auth/RouteGuard'; // Correction du chemin d'importation du RouteGuard

export interface OnboardingData {
  userType: string;
  userInfo: {
    firstName?: string;
    lastName?: string;
    companyName?: string;
    agencyName?: string;
  };
  contentPreferences: {
    tone: 'professional' | 'casual' | 'technical';
    frequency: 'daily' | 'weekly' | 'monthly';
    topics: string[];
  };
  linkedInProfile: {
    connected: boolean;
    profileUrl: string;
    accessToken: string;
  };
  preferences: {
    notifications: 'all' | 'important' | 'none';
    aiAssistance: 'aggressive' | 'balanced' | 'minimal';
  };
}

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    userType: '',
    userInfo: {},
    contentPreferences: {
      tone: 'professional',
      frequency: 'weekly',
      topics: [],
    },
    linkedInProfile: {
      connected: false,
      profileUrl: '',
      accessToken: '',
    },
    preferences: {
      notifications: 'important',
      aiAssistance: 'balanced',
    },
  });

  useEffect(() => {
    const checkUser = async () => {
      const user = auth.currentUser;
      if (!user) {
        router.push('/login');
        return;
      }

      // Vérifier si l'utilisateur a déjà complété l'onboarding
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists() && userDoc.data().onboardingCompleted) {
        router.push('/dashboard');
      }
    };

    checkUser();
  }, [router]);

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Dernière étape, sauvegarder les données
      const user = auth.currentUser;
      if (user) {
        try {
          await updateDoc(doc(db, 'users', user.uid), {
            ...onboardingData,
            onboardingCompleted: true,
            updatedAt: new Date(),
          });
          router.push('/dashboard');
        } catch (error) {
          console.error('Error saving onboarding data:', error);
        }
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateData = (data: Partial<OnboardingData>) => {
    setOnboardingData(prev => ({
      ...prev,
      ...data,
    }));
  };

  const handleComplete = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      const userData = {
        onboardingCompleted: true,
        userType: onboardingData.userType,
        userInfo: onboardingData.userInfo,
        contentPreferences: onboardingData.contentPreferences,
        linkedInProfile: onboardingData.linkedInProfile,
        preferences: onboardingData.preferences,
        email: user.email,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      if (!userDoc.exists()) {
        // Create new document if it doesn't exist
        await setDoc(userDocRef, userData);
      } else {
        // Update existing document
        await updateDoc(userDocRef, userData);
      }

      router.push('/dashboard');
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  const steps = [
    {
      id: 'user-type',
      title: 'User Type',
      description: 'Tell us about yourself',
      component: UserTypeStep,
    },
    {
      id: 'content-preferences',
      title: 'Content Preferences',
      description: 'Customize your content strategy',
      component: ContentPreferencesStep,
    },
    {
      id: 'linkedin-profile',
      title: 'LinkedIn Profile',
      description: 'Connect your LinkedIn account',
      component: LinkedInProfileStep,
    },
    {
      id: 'final-config',
      title: 'Final Configuration',
      description: 'Configure your preferences',
      component: FinalConfigStep,
    },
  ];

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <RouteGuard requireOnboarding={false}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 py-12">
          <div className="mb-8">
            <div className="flex justify-center mb-4">
              <div className="flex items-center">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        index <= currentStep
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {index + 1}
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`w-20 h-1 mx-2 ${
                          index < currentStep ? 'bg-indigo-600' : 'bg-gray-200'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 text-center">
              {steps[currentStep].title}
            </h2>
            <p className="mt-2 text-gray-600 text-center">
              {steps[currentStep].description}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-xl p-8">
            <CurrentStepComponent
              data={onboardingData}
              updateData={updateData}
              onNext={currentStep === steps.length - 1 ? handleComplete : handleNext}
              onBack={handleBack}
              isFirstStep={currentStep === 0}
              isLastStep={currentStep === steps.length - 1}
            />
          </div>
        </div>
      </div>
    </RouteGuard>
  );
}
