import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, isLiveFirebaseConfigured } from '../firebase/firebase';

/**
 * Upload an image file or base64 data to Firebase Storage with strict timeout
 * @param {File|string} fileOrDataUrl
 * @param {string} pathPrefix - e.g. 'complaints/' or 'resolutions/'
 * @returns {Promise<string>} Download URL or Base64 Data URL
 */
export async function uploadImage(fileOrDataUrl, pathPrefix = 'complaints/') {
  if (!fileOrDataUrl) return null;

  // If already a remote HTTPS URL (e.g. Unsplash sample), return directly
  if (typeof fileOrDataUrl === 'string' && fileOrDataUrl.startsWith('http')) {
    return fileOrDataUrl;
  }

  // If live Firebase is configured, attempt upload with 2.5 second timeout
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
        // Timeout promise after 2500ms
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Storage upload timeout')), 2500)
        );

        const uploadTask = (async () => {
          const snapshot = await uploadBytes(storageRef, blob);
          return await getDownloadURL(snapshot.ref);
        })();

        const downloadUrl = await Promise.race([uploadTask, timeoutPromise]);
        return downloadUrl;
      }
    } catch (err) {
      console.warn('Firebase Storage upload bypassed/fallback:', err.message);
    }
  }

  // Fallback: return dataURL directly without blocking
  return fileOrDataUrl;
}
