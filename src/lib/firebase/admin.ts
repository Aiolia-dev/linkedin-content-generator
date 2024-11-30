import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

if (!process.env.FIREBASE_PRIVATE_KEY || !process.env.FIREBASE_CLIENT_EMAIL) {
  console.error(
    'Missing FIREBASE_PRIVATE_KEY or FIREBASE_CLIENT_EMAIL environment variables'
  );
  process.exit(1);
}

const firebaseAdminConfig = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
};

export const app = !getApps().length
  ? initializeApp({
      credential: cert(firebaseAdminConfig),
    })
  : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
