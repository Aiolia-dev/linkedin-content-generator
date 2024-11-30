import { NextResponse } from 'next/server';
import { getLinkedInAccessToken, getLinkedInProfile } from '@/lib/linkedin/linkedin';
import { db } from '@/lib/firebase/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export async function GET(request: Request) {
  try {
    // Get the authorization code and state from the URL
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state'); // This is the user's Firebase UID
    const error = url.searchParams.get('error');
    const error_description = url.searchParams.get('error_description');

    console.log('LinkedIn callback received:', { code, state, error, error_description });

    if (error) {
      console.error('LinkedIn OAuth error:', error, error_description);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/profile?error=linkedin_auth_failed&details=${encodeURIComponent(error_description || '')}`
      );
    }

    if (!code || !state) {
      console.error('Missing parameters:', { code, state });
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/profile?error=missing_params`
      );
    }

    // Exchange the authorization code for an access token
    console.log('Exchanging code for token...');
    const tokenResponse = await getLinkedInAccessToken(code);
    console.log('Token received:', tokenResponse);
    
    // Get the user's LinkedIn profile
    console.log('Fetching LinkedIn profile...');
    const profile = await getLinkedInProfile(tokenResponse.access_token);
    console.log('Profile received:', profile);

    // Update the user's document in Firestore with LinkedIn information
    const userRef = doc(db, 'users', state);
    await updateDoc(userRef, {
      linkedInProfile: {
        connected: true,
        id: profile.id,
        firstName: profile.localizedFirstName,
        lastName: profile.localizedLastName,
        email: profile.email,
        profileUrl: `https://www.linkedin.com/in/${profile.id}`,
        accessToken: tokenResponse.access_token,
        expiresAt: Date.now() + (tokenResponse.expires_in * 1000),
      },
    });

    // Redirect back to the profile page with success message
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/profile?success=linkedin_connected`
    );
  } catch (error: any) {
    console.error('Detailed error in LinkedIn callback:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/profile?error=linkedin_connection_failed&details=${encodeURIComponent(error.message)}`
    );
  }
}
