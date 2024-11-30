'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';

interface RouteGuardProps {
  children: React.ReactNode;
  requireOnboarding?: boolean;
}

export default function RouteGuard({ children, requireOnboarding = true }: RouteGuardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/login');
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();

        if (requireOnboarding && !userData?.onboardingCompleted) {
          if (window.location.pathname !== '/onboarding') {
            router.push('/onboarding');
            return;
          }
        } else if (!requireOnboarding && userData?.onboardingCompleted) {
          if (window.location.pathname === '/onboarding') {
            router.push('/dashboard');
            return;
          }
        }

        setLoading(false);
      } catch (error) {
        console.error('Error checking user data:', error);
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router, requireOnboarding]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return <>{children}</>;
}
