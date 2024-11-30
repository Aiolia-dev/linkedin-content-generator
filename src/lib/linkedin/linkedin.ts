import { auth } from '../firebase/firebase';

const LINKEDIN_AUTH_URL = 'https://www.linkedin.com/oauth/v2/authorization';
const LINKEDIN_TOKEN_URL = 'https://www.linkedin.com/oauth/v2/accessToken';
const LINKEDIN_PROFILE_URL = 'https://api.linkedin.com/v2/userinfo';
const LINKEDIN_EMAIL_URL = 'https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))';

export interface LinkedInAuthResponse {
  access_token: string;
  expires_in: number;
  scope: string;
  id_token?: string;
}

export interface LinkedInProfile {
  sub?: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  email?: string;
  locale?: string;
}

export const getLinkedInAuthUrl = () => {
  const clientId = process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID;
  const redirectUri = encodeURIComponent(
    `${process.env.NEXT_PUBLIC_APP_URL}/linkedin/callback`
  );
  const scope = encodeURIComponent('openid profile w_member_social email');
  const state = encodeURIComponent(auth.currentUser?.uid || '');

  return `${LINKEDIN_AUTH_URL}?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}`;
};

export const getLinkedInAccessToken = async (code: string): Promise<LinkedInAuthResponse> => {
  const clientId = process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/linkedin/callback`;

  const response = await fetch(LINKEDIN_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: clientId!,
      client_secret: clientSecret!,
      redirect_uri: redirectUri,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to get LinkedIn access token');
  }

  return response.json();
};

export const getLinkedInProfile = async (accessToken: string): Promise<LinkedInProfile> => {
  try {
    // Fetch user info from LinkedIn's OpenID Connect endpoint
    const response = await fetch(LINKEDIN_PROFILE_URL, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch LinkedIn profile data');
    }

    const data = await response.json();
    
    return {
      sub: data.sub,
      name: data.name,
      given_name: data.given_name,
      family_name: data.family_name,
      picture: data.picture,
      email: data.email,
      locale: data.locale,
    };
  } catch (error) {
    console.error('Detailed LinkedIn profile fetch error:', error);
    throw error;
  }
};
