import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, isLiveFirebaseConfigured } from '../firebase/firebase';
import { saveUserProfile } from './userService';

/**
 * Login user with Firebase Auth or fallback prebuilt authentication
 */
export async function loginWithFirebase(emailOrUsername, password, expectedRole) {
  if (isLiveFirebaseConfigured()) {
    try {
      // Firebase auth expects email
      let email = emailOrUsername;
      if (!email.includes('@')) {
        email = `${emailOrUsername.toLowerCase()}@civic.gov`;
      }
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const uid = credential.user.uid;

      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const userData = { id: uid, ...userDoc.data() };
        return { success: true, user: userData };
      }
    } catch (err) {
      console.warn('Firebase Auth sign in failed, checking mock credentials:', err);
    }
  }

  return { success: false, fallbackRequired: true };
}

/**
 * Register Citizen in Firebase Auth and Firestore users collection
 */
export async function registerCitizenWithFirebase({ fullName, username, email, phone, password }) {
  if (isLiveFirebaseConfigured()) {
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = credential.user.uid;

      const userData = {
        id: uid,
        name: fullName,
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        phone,
        role: 'citizen',
        createdAt: new Date().toISOString(),
      };

      await saveUserProfile(userData);
      return { success: true, user: userData };
    } catch (err) {
      console.warn('Firebase Auth registration failed:', err);
      return { success: false, error: err.message };
    }
  }

  return { success: false, fallbackRequired: true };
}

/**
 * Logout from Firebase Auth
 */
export async function logoutFromFirebase() {
  if (isLiveFirebaseConfigured()) {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('Firebase sign out error:', err);
    }
  }
}
