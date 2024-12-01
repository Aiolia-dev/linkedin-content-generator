'use client';

import { useState } from 'react';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, db } from '@/lib/firebase/config';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const createSession = async (user: any) => {
    try {
      const idToken = await user.getIdToken(true);
      const response = await fetch('/api/auth/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create session');
      }

      return true;
    } catch (error: any) {
      console.error('Error creating session:', error);
      throw error;
    }
  };

  const saveUserProfile = async (user: any) => {
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      // Nouveau utilisateur - créer un nouveau document
      await setDoc(userRef, {
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        createdAt: new Date(),
        updatedAt: new Date(),
        onboardingCompleted: false,
      });
    } else {
      // Utilisateur existant - mettre à jour les informations
      const userData = userDoc.data();
      await updateDoc(userRef, {
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        updatedAt: new Date(),
        // Ne pas écraser les autres données existantes
        ...(!userData.onboardingCompleted && { onboardingCompleted: false }),
      });
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Firebase auth successful');
      
      await createSession(userCredential.user);
      console.log('Session created successfully');
      
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Email login error:', error);
      if (error.code === 'auth/invalid-email' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        setError('Invalid email or password');
      } else if (error.code === 'auth/too-many-requests') {
        setError('Too many failed login attempts. Please try again later.');
      } else {
        setError('An error occurred during login. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      console.log('Starting Google sign in...');
      const result = await signInWithPopup(auth, provider);
      console.log('Google sign in successful:', result.user.email);
      
      // Sauvegarder les informations de profil Google
      await saveUserProfile(result.user);
      console.log('User profile saved');
      
      await createSession(result.user);
      console.log('Session created successfully');
      
      // Rediriger vers onboarding si nouveau utilisateur
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      if (!userDoc.exists() || !userDoc.data().onboardingCompleted) {
        router.push('/onboarding');
      } else {
        router.push('/dashboard');
      }
    } catch (error: any) {
      console.error('Google sign in error:', error);
      if (error.code === 'auth/popup-closed-by-user') {
        setError('Sign in cancelled');
      } else if (error.code === 'auth/popup-blocked') {
        setError('Please allow popups for this website');
      } else {
        setError('An error occurred during Google sign in. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkedInLogin = async () => {
    try {
      setError('LinkedIn authentication will be available soon');
    } catch (error) {
      setError('Error signing in with LinkedIn');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleEmailLogin}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-[#196BF1] focus:border-[#196BF1] focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-[#196BF1] focus:border-[#196BF1] focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#196BF1] hover:bg-[#1559cc] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#196BF1] disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>

        <div className="mt-6 space-y-4">
          <button
            onClick={handleGoogleLogin}
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#196BF1] disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? 'Connecting...' : 'Sign in with Google'}
          </button>
          
          <button
            onClick={handleLinkedInLogin}
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-[#0A66C2] bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#196BF1] disabled:opacity-50"
            disabled={isLoading}
          >
            Sign in with LinkedIn
          </button>

          <div className="text-sm text-center mt-4">
            <a
              href="/register"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Don't have an account? Sign up
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
