import { NextRequest, NextResponse } from 'next/server';
import { getLinkedInAccessToken, getLinkedInProfile } from '@/lib/linkedin/linkedin';
import { adminDb } from '@/lib/firebase/firebase-admin';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const error_description = searchParams.get('error_description');

    console.log('LinkedIn callback received:', {
      code,
      state,
      error,
      error_description,
    });

    if (error || !code || !state) {
      console.error('Error in LinkedIn callback:', error, error_description);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/profile?error=linkedin_connection_failed&details=${error_description}`
      );
    }

    console.log('Exchanging code for token...');
    const tokenResponse = await getLinkedInAccessToken(code);
    console.log('Token received:', tokenResponse);

    if (!tokenResponse.id_token) {
      throw new Error('No ID token received from LinkedIn');
    }

    console.log('Fetching LinkedIn profile...');
    const profile = await getLinkedInProfile(tokenResponse.access_token);

    // Update user's LinkedIn data in Firestore using admin SDK
    if (state) {
      console.log('Checking Firestore for user:', state);
      const userRef = adminDb.collection('users').doc(state);
      const userDoc = await userRef.get();

      const userData = {
        linkedinProfile: {
          ...profile,
          connected: true,
          profileUrl: `https://www.linkedin.com/in/${profile.sub}`,
        },
        linkedinAccessToken: tokenResponse.access_token,
        linkedinTokenExpiry: new Date(Date.now() + tokenResponse.expires_in * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      };

      try {
        if (!userDoc.exists) {
          console.log('User document does not exist, creating it');
          await userRef.set({
            ...userData,
            createdAt: new Date().toISOString(),
          });
        } else {
          console.log('User document exists, updating it');
          await userRef.update(userData);
        }
        console.log('Successfully updated user profile');
      } catch (error) {
        console.error('Error updating Firestore:', error);
        throw error;
      }
    }

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/profile`);
  } catch (error: any) {
    console.error('Detailed error in LinkedIn callback:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/profile?error=linkedin_connection_failed&details=${encodeURIComponent(
        error.message
      )}`
    );
  }
}
