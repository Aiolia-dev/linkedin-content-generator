import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/firebase-admin';
import { adminDb } from '@/lib/firebase/firebase-admin';

export async function POST(request: Request) {
  try {
    const { sessionCookie } = await request.json();
    
    if (!sessionCookie) {
      return NextResponse.json({ isAuthenticated: false }, { status: 401 });
    }

    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie);
    const userDoc = await adminDb.collection('users').doc(decodedClaims.uid).get();
    const userData = userDoc.data();

    return NextResponse.json({
      isAuthenticated: true,
      onboardingCompleted: userData?.onboardingCompleted ?? false,
    });
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return NextResponse.json({ isAuthenticated: false }, { status: 401 });
  }
}
