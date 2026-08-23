import { collection, addDoc, doc, updateDoc, getDocs, getDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db, isLiveFirebaseConfigured } from '../firebase/firebase';
import { sendNotification } from './notificationService';

// Helper to run Firestore operations with 2.5s timeout
async function withTimeout(promise, timeoutMs = 2500) {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error('Firestore operation timed out')), timeoutMs);
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
 * Calculate Haversine distance between two coordinates in Kilometers
 */
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 999999;
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculate text keyword similarity score between two descriptions (0.0 to 1.0)
 */
export function calculateTextSimilarity(textA = '', textB = '') {
  const sanitize = (t) =>
    t
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 3);

  const wordsA = new Set(sanitize(textA));
  const wordsB = new Set(sanitize(textB));

  if (wordsA.size === 0 || wordsB.size === 0) return 0;

  let intersection = 0;
  for (const word of wordsA) {
    if (wordsB.has(word)) intersection++;
  }

  const union = new Set([...wordsA, ...wordsB]).size;
  return intersection / union;
}

/**
 * Duplicate Detection Engine
 */
export function detectPossibleDuplicate(newComplaint, existingComplaints = []) {
  for (const existing of existingComplaints) {
    if (existing.status === 'RESOLVED') continue;

    const isSameCategory =
      existing.category?.toLowerCase() === newComplaint.category?.toLowerCase();
    if (!isSameCategory) continue;

    const distKm = calculateDistanceKm(
      Number(newComplaint.latitude),
      Number(newComplaint.longitude),
      Number(existing.latitude),
      Number(existing.longitude)
    );
    const isNearby = distKm <= 0.5;

    const similarity = calculateTextSimilarity(
      newComplaint.description,
      existing.description
    );
    const isSimilarDesc = similarity >= 0.25;

    if (isNearby || isSimilarDesc) {
      return {
        isDuplicate: true,
        matchedComplaint: existing,
        reason: isNearby
          ? `Proximity match (${(distKm * 1000).toFixed(0)}m away)`
          : `Description similarity (${(similarity * 100).toFixed(0)}% match)`,
      };
    }
  }

  return { isDuplicate: false, matchedComplaint: null };
}

/**
 * Create a new Complaint in Firestore with timeout protection
 */
export async function createComplaintInFirestore(complaintData, existingComplaints = []) {
  const duplicateCheck = detectPossibleDuplicate(complaintData, existingComplaints);

  const nextCount = existingComplaints.length + 8961;
  const complaintNumber = `CMP-2026-${nextCount}`;
  const nowIso = new Date().toISOString();

  const record = {
    complaintNumber,
    citizenId: complaintData.citizenId || 'user-citizen-01',
    citizenName: complaintData.citizenName || 'Resident Citizen',
    citizenPhone: complaintData.citizenPhone || '+91 98765 43210',
    citizenEmail: complaintData.citizenEmail || 'citizen@example.com',
    citizenAddress: complaintData.address || 'Sector 12, Municipal Zone',
    category: complaintData.category || 'Other',
    description: complaintData.description || '',
    imageUrl: complaintData.imageUrl || null,
    latitude: Number(complaintData.latitude) || 12.9716,
    longitude: Number(complaintData.longitude) || 77.5946,
    address: complaintData.address || 'Sector 12, Municipal Zone',
    status: 'SUBMITTED',
    departmentId: complaintData.departmentId || 'dept-01',
    departmentName: complaintData.departmentName || 'Solid Waste Management Division',
    workerId: 'unassigned',
    workerName: 'Unassigned',
    isPossibleDuplicate: duplicateCheck.isDuplicate,
    duplicateMatchedNumber: duplicateCheck.matchedComplaint?.complaintNumber || null,
    createdAt: nowIso,
    verifiedAt: null,
    assignedAt: null,
    acceptedAt: null,
    startedAt: null,
    resolvedAt: null,
    resolutionImageUrl: null,
    resolutionNotes: null,
  };

  record.id = `cmp-${Date.now()}`;

  if (isLiveFirebaseConfigured()) {
    try {
      const docRef = await withTimeout(addDoc(collection(db, 'complaints'), record), 2500);
      if (docRef?.id) {
        record.id = docRef.id;
      }
    } catch (err) {
      console.warn('Firestore write timed out or offline, stored locally:', err.message);
    }
  }

  // Send Notification
  sendNotification({
    userId: 'admin',
    complaintId: record.complaintNumber,
    title: duplicateCheck.isDuplicate
      ? `⚠️ New Grievance #${record.complaintNumber} (Possible Duplicate)`
      : `New Grievance #${record.complaintNumber} Registered`,
    message: `${record.category} reported by ${record.citizenName} at ${record.address}. Status: SUBMITTED.`,
    type: duplicateCheck.isDuplicate ? 'alert' : 'info',
  }).catch(() => {});

  return record;
}

/**
 * Admin: Verify Complaint (SUBMITTED -> VERIFIED)
 */
export async function verifyComplaintInFirestore(complaintId) {
  const nowIso = new Date().toISOString();
  const updateFields = {
    status: 'VERIFIED',
    verifiedAt: nowIso,
  };

  if (isLiveFirebaseConfigured() && complaintId && !complaintId.startsWith('cmp-')) {
    try {
      await withTimeout(updateDoc(doc(db, 'complaints', complaintId), updateFields), 2500);
    } catch (err) {
      console.warn('Firestore update verified warning:', err.message);
    }
  }

  return updateFields;
}

/**
 * Admin: Assign Department + Worker (VERIFIED -> ASSIGNED)
 */
export async function assignComplaintInFirestore(complaintId, departmentId, workerId) {
  const nowIso = new Date().toISOString();
  const updateFields = {
    status: 'ASSIGNED',
    departmentId,
    workerId,
    assignedAt: nowIso,
  };

  if (isLiveFirebaseConfigured() && complaintId && !complaintId.startsWith('cmp-')) {
    try {
      await withTimeout(updateDoc(doc(db, 'complaints', complaintId), updateFields), 2500);
    } catch (err) {
      console.warn('Firestore update assigned warning:', err.message);
    }
  }

  return updateFields;
}

/**
 * Worker: Accept Task (ASSIGNED -> ACCEPTED)
 */
export async function acceptTaskInFirestore(complaintId) {
  const nowIso = new Date().toISOString();
  const updateFields = {
    status: 'ACCEPTED',
    acceptedAt: nowIso,
  };

  if (isLiveFirebaseConfigured() && complaintId && !complaintId.startsWith('cmp-')) {
    try {
      await withTimeout(updateDoc(doc(db, 'complaints', complaintId), updateFields), 2500);
    } catch (err) {
      console.warn('Firestore update accepted warning:', err.message);
    }
  }

  return updateFields;
}

/**
 * Worker: Start Work (ACCEPTED -> IN_PROGRESS)
 */
export async function startWorkInFirestore(complaintId) {
  const nowIso = new Date().toISOString();
  const updateFields = {
    status: 'IN_PROGRESS',
    startedAt: nowIso,
  };

  if (isLiveFirebaseConfigured() && complaintId && !complaintId.startsWith('cmp-')) {
    try {
      await withTimeout(updateDoc(doc(db, 'complaints', complaintId), updateFields), 2500);
    } catch (err) {
      console.warn('Firestore update in progress warning:', err.message);
    }
  }

  return updateFields;
}

/**
 * Worker: Upload Resolution & Mark Resolved (IN_PROGRESS -> RESOLVED)
 */
export async function resolveComplaintInFirestore(complaintId, { resolutionImageUrl, resolutionNotes }) {
  const nowIso = new Date().toISOString();
  const updateFields = {
    status: 'RESOLVED',
    resolvedAt: nowIso,
    resolutionImageUrl: resolutionImageUrl || null,
    resolutionNotes: resolutionNotes || 'Repairs completed and site verified.',
  };

  if (isLiveFirebaseConfigured() && complaintId && !complaintId.startsWith('cmp-')) {
    try {
      await withTimeout(updateDoc(doc(db, 'complaints', complaintId), updateFields), 2500);
    } catch (err) {
      console.warn('Firestore update resolved warning:', err.message);
    }
  }

  return updateFields;
}

/**
 * Subscribe to realtime complaints updates
 */
export function subscribeToComplaints(callback) {
  if (isLiveFirebaseConfigured()) {
    try {
      const q = query(collection(db, 'complaints'), orderBy('createdAt', 'desc'));
      return onSnapshot(
        q,
        (snapshot) => {
          const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
          callback(list);
        },
        (error) => {
          console.warn('Firestore realtime listener error (running in local mode):', error.message);
        }
      );
    } catch (err) {
      console.warn('Error setting up realtime complaints listener:', err);
    }
  }
  return () => {};
}
