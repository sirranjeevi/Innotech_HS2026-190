import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

/**
 * Firebase Configuration
 * Reads from Vite environment variables (VITE_FIREBASE_*)
 * with fallback dummy values so the app compiles cleanly without crashing if env is missing.
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDummyKeyForDevelopment1234567890",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "citizen-complaint-portal.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "citizen-complaint-portal",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "citizen-complaint-portal.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789012:web:abcdef1234567890"
};

// Initialize Firebase safely
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
