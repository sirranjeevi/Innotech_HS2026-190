/**
 * Firebase Configuration
 * 
 * Safely loads credentials from environment variables (Vite prefix `VITE_FIREBASE_`)
 * with fallback protection for development and local testing.
 */

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyCr64Cyq_O7gatowuTyzXaF-hAbeVIV3nM',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'civicconnect-84049.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'civicconnect-84049',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'civicconnect-84049.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '53949082689',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:53949082689:web:339b4f14253fae607eeac0',
};

// Check if Firebase configuration has valid credentials
export const isFirebaseConfigured = () => {
  return (
    Boolean(firebaseConfig.apiKey) &&
    Boolean(firebaseConfig.projectId) &&
    firebaseConfig.apiKey !== 'YOUR_API_KEY'
  );
};
