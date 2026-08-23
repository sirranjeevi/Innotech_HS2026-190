import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db, isLiveFirebaseConfigured } from '../firebase/firebase';
import { saveUserProfile } from './userService';

// Helper to run Firestore query with 2.5s timeout
async function withTimeout(promise, timeoutMs = 2500) {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error('Auth operation timed out')), timeoutMs);
  });
  try {
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timeoutId);
    return result;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

/**
 * Login user by fetching directly from Firestore users collection or Firebase Auth
 */
export async function loginWithFirebase(emailOrUsername, password, expectedRole) {
  const cleanInput = emailOrUsername.trim().toLowerCase();

  if (isLiveFirebaseConfigured()) {
    try {
      // 1. Check if user document exists in Firestore 'users' collection by username or email
      const usersRef = collection(db, 'users');

      // Query by username
      const usernameQuery = query(usersRef, where('username', '==', cleanInput));
      const usernameSnap = await withTimeout(getDocs(usernameQuery), 2500).catch(() => null);

      if (usernameSnap && !usernameSnap.empty) {
        const foundDoc = usernameSnap.docs[0];
        const userData = { id: foundDoc.id, ...foundDoc.data() };
        if (!expectedRole || userData.role === expectedRole) {
          return { success: true, user: userData };
        }
      }

      // Query by email
      const emailQuery = query(usersRef, where('email', '==', cleanInput));
      const emailSnap = await withTimeout(getDocs(emailQuery), 2500).catch(() => null);

      if (emailSnap && !emailSnap.empty) {
        const foundDoc = emailSnap.docs[0];
        const userData = { id: foundDoc.id, ...foundDoc.data() };
        if (!expectedRole || userData.role === expectedRole) {
          return { success: true, user: userData };
        }
      }

      // 2. Try standard Firebase Auth signIn if credentials exist in Firebase Auth
      let email = cleanInput;
      if (!email.includes('@')) {
        email = `${cleanInput}@civic.gov`;
      }

      const credential = await withTimeout(signInWithEmailAndPassword(auth, email, password), 2500).catch(() => null);
      if (credential?.user?.uid) {
        const uid = credential.user.uid;
        const userDoc = await withTimeout(getDoc(doc(db, 'users', uid)), 2500).catch(() => null);
        if (userDoc && userDoc.exists()) {
          const userData = { id: uid, ...userDoc.data() };
          return { success: true, user: userData };
        }
      }
    } catch (err) {
      console.warn('Firestore user fetch note:', err.message);
    }
  }

  return { success: false, fallbackRequired: true };
}

/**
 * Register Citizen in Firebase Auth and Firestore users collection
 */
export async function registerCitizenWithFirebase({ fullName, username, email, phone, password }) {
  const cleanUsername = username.trim().toLowerCase();
  const cleanEmail = email.trim().toLowerCase();
  const uid = `user-citizen-${Date.now()}`;

  const userData = {
    id: uid,
    name: fullName.trim(),
    username: cleanUsername,
    email: cleanEmail,
    phone: phone.trim(),
    role: 'citizen',
    password: password, // preserved for matching
    createdAt: new Date().toISOString(),
  };

  if (isLiveFirebaseConfigured()) {
    try {
      // 1. Attempt Firebase Auth registration
      const fbAuthTask = createUserWithEmailAndPassword(auth, cleanEmail, password)
        .then((cred) => cred.user.uid)
        .catch(() => null);

      const authUid = await withTimeout(fbAuthTask, 2500).catch(() => null);
      if (authUid) {
        userData.id = authUid;
      }

      // 2. Write to Firestore 'users' collection
      await saveUserProfile(userData);
      return { success: true, user: userData };
    } catch (err) {
      console.warn('Firebase registration write warning:', err.message);
    }
  }

  return { success: true, user: userData };
}

/**
 * Logout from Firebase Auth
 */
export async function logoutFromFirebase() {
  if (isLiveFirebaseConfigured()) {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('Firebase sign out warning:', err.message);
    }
  }
}
