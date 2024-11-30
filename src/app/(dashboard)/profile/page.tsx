'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase/firebase';
import { db } from '@/lib/firebase/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { OnboardingData } from '@/app/(onboarding)/onboarding/page';
import EditProfileModal from '@/components/profile/EditProfileModal';
import PersonaManager from '@/components/profile/PersonaManager';
import { PencilIcon } from '@heroicons/react/24/outline';
import { LinkIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/20/solid';
import { getLinkedInAuthUrl } from '@/lib/linkedin/linkedin';
import { Tab } from '@headlessui/react';
import clsx from 'clsx';

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<OnboardingData | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);

  const fetchProfileData = async (userId: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const data = userDoc.data() as OnboardingData;
        console.log('Profile Data:', {
          linkedinProfile: data.linkedinProfile,
          hasProfileUrl: data.linkedinProfile?.profileUrl ? 'yes' : 'no',
          profileUrl: data.linkedinProfile?.profileUrl
        });
        setProfileData(data);
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push('/login');
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (!userDoc.exists()) {
          router.push('/onboarding');
          return;
        }
        
        const userData = userDoc.data() as OnboardingData;
        // Check if onboarding is complete by verifying essential data
        if (!userData.contentPreferences || !userData.preferences || !userData.userType) {
          router.push('/onboarding');
          return;
        }

        setProfileData(userData);
      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (auth.currentUser) {
      fetchProfileData(auth.currentUser.uid);
    }
  }, []);

  const handleLinkedInConnect = async () => {
    if (!auth.currentUser) {
      console.error('No authenticated user found');
      router.push('/login');
      return;
    }
    const authUrl = getLinkedInAuthUrl();
    if (!authUrl.includes(auth.currentUser.uid)) {
      console.error('Invalid auth state for LinkedIn connection');
      return;
    }
    window.location.href = authUrl;
  };

  const handleLinkedInDisconnect = async () => {
    try {
      if (!auth.currentUser) return;

      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        linkedinProfile: {
          connected: false,
          profileUrl: null,
          sub: null,
          name: null,
          email: null
        },
        linkedinAccessToken: null,
        linkedinTokenExpiry: null
      });

      // Refresh the profile data
      const updatedDoc = await getDoc(userRef);
      if (updatedDoc.exists()) {
        const data = updatedDoc.data() as OnboardingData;
        console.log('Updated Profile Data after disconnect:', {
          linkedinProfile: data.linkedinProfile,
          hasProfileUrl: data.linkedinProfile?.profileUrl ? 'yes' : 'no',
          profileUrl: data.linkedinProfile?.profileUrl
        });
        setProfileData(data);
      }
    } catch (error) {
      console.error('Error disconnecting LinkedIn:', error);
    }
  };

  const handleProfileUpdate = async (updatedData: OnboardingData) => {
    try {
      if (!auth.currentUser) return;

      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, updatedData);

      // Refresh the profile data
      const updatedDoc = await getDoc(userRef);
      if (updatedDoc.exists()) {
        const data = updatedDoc.data() as OnboardingData;
        console.log('Updated Profile Data:', {
          linkedinProfile: data.linkedinProfile,
          hasProfileUrl: data.linkedinProfile?.profileUrl ? 'yes' : 'no',
          profileUrl: data.linkedinProfile?.profileUrl
        });
        setProfileData(data);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const contentPreferences = profileData.contentPreferences || {
    tone: 'Not set',
    frequency: 'Not set',
    topics: []
  };

  const linkedinProfile = profileData.linkedinProfile || {
    connected: false
  };

  const preferences = profileData.preferences || {
    notifications: 'Not set',
    aiAssistance: 'Not set'
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
          <Tab.List className="flex space-x-4 border-b border-gray-200 mb-6">
            <Tab
              className={({ selected }) =>
                clsx(
                  'px-4 py-2 text-sm font-medium focus:outline-none',
                  selected
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )
              }
            >
              Profile Information
            </Tab>
            <Tab
              className={({ selected }) =>
                clsx(
                  'px-4 py-2 text-sm font-medium focus:outline-none',
                  selected
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )
              }
            >
              Personas
            </Tab>
          </Tab.List>

          <Tab.Panels>
            <Tab.Panel>
              {/* Profile Information Content */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-lg font-medium text-gray-900">Profile Information</h2>
                      <p className="mt-1 text-sm text-gray-500">
                        Update your profile information and LinkedIn connection.
                      </p>
                    </div>
                    <button
                      onClick={() => setIsEditModalOpen(true)}
                      className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <PencilIcon className="h-4 w-4 mr-2" />
                      Edit Profile
                    </button>
                  </div>

                  {profileData && (
                    <div className="mt-6 border-t border-gray-200 pt-6">
                      <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                          <dd className="mt-1 text-sm text-gray-900">{profileData.fullName}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Job Title</dt>
                          <dd className="mt-1 text-sm text-gray-900">{profileData.jobTitle}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Industry</dt>
                          <dd className="mt-1 text-sm text-gray-900">{profileData.industry}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Company</dt>
                          <dd className="mt-1 text-sm text-gray-900">{profileData.company}</dd>
                        </div>
                      </dl>
                    </div>
                  )}

                  <div className="mt-6 border-t border-gray-200 pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">LinkedIn Connection</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Connect your LinkedIn account to enable content generation.
                        </p>
                      </div>
                      <button
                        onClick={handleLinkedInConnect}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <LinkIcon className="h-4 w-4 mr-2 text-gray-400" />
                        Connect LinkedIn
                        <ArrowTopRightOnSquareIcon className="h-4 w-4 ml-1 text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Tab.Panel>

            <Tab.Panel>
              {/* Personas Content */}
              <PersonaManager />
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>

      {isEditModalOpen && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          profileData={profileData}
          onProfileUpdate={handleProfileUpdate}
        />
      )}
    </div>
  );
}
