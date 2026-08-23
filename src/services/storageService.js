import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, isLiveFirebaseConfigured } from '../firebase/firebase';

/**
 * Upload an image file or base64 data to Firebase Storage
 * @param {File|string} fileOrDataUrl
 * @param {string} pathPrefix - e.g. 'complaints/' or 'resolutions/'
 * @returns {Promise<string>} Download URL
 */
export async function uploadImage(fileOrDataUrl, pathPrefix = 'complaints/') {
  if (!fileOrDataUrl) return null;

  // If already a remote HTTPS URL (e.g. Unsplash sample), return directly
  if (typeof fileOrDataUrl === 'string' && fileOrDataUrl.startsWith('http')) {
    return fileOrDataUrl;
  }

  // If live Firebase is configured, upload to Firebase Storage
  if (isLiveFirebaseConfigured()) {
    try {
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.jpg`;
      const storageRef = ref(storage, `${pathPrefix}${fileName}`);

      let blob;
      if (typeof fileOrDataUrl === 'string' && fileOrDataUrl.startsWith('data:')) {
        const res = await fetch(fileOrDataUrl);
        blob = await res.blob();
      } else if (fileOrDataUrl instanceof File || fileOrDataUrl instanceof Blob) {
        blob = fileOrDataUrl;
      }

      if (blob) {
        const snapshot = await uploadBytes(storageRef, blob);
        const downloadUrl = await getDownloadURL(snapshot.ref);
        return downloadUrl;
      }
    } catch (err) {
      console.warn('Firebase Storage upload failed, using local data URL fallback:', err);
    }
  }

  // Fallback: return dataURL or simulated cloud URL
  return fileOrDataUrl;
}
