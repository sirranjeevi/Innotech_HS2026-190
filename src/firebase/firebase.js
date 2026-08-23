import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { firebaseConfig, isFirebaseConfigured } from '../config/firebaseConfig';

/**
 * Firebase Client Initialization
 * 
 * Sets up Firebase Authentication, Firestore Database, and Cloud Storage instances.
 * Provides live synchronization between Citizen, Admin, and Field Worker portals.
 */

// Singleton Firebase App initialization
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

const isLiveFirebaseConfigured = isFirebaseConfigured;

export { app, auth, db, storage, isLiveFirebaseConfigured };
