import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBvY8OVzacXsMFwbCXruQ3vGSnCfhGSyuU",
  authDomain: "ai-content-generator-d2e9c.firebaseapp.com",
  projectId: "ai-content-generator-d2e9c",
  storageBucket: "ai-content-generator-d2e9c.firebasestorage.app",
  messagingSenderId: "958670252487",
  appId: "1:958670252487:web:6b48c1ce7c796b33cd91e2"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
