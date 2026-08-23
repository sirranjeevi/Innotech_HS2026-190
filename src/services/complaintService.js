import { collection, addDoc, doc, updateDoc, getDocs, getDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db, isLiveFirebaseConfigured } from '../firebase/firebase';
import { sendNotification } from './notificationService';

/**
 * Calculate Haversine distance between two coordinates in Kilometers
 */
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 999999;
  const R = 6371; // Earth radius in km
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
 * Checks existing complaints for:
 * 1. Same category
 * 2. Proximity <= 0.5 km (500 meters)
 * 3. Similar description (similarity >= 0.25)
 * @returns {{ isDuplicate: boolean, matchedComplaint: object | null }}
 */
export function detectPossibleDuplicate(newComplaint, existingComplaints = []) {
  for (const existing of existingComplaints) {
    // Only check unresolved complaints
    if (existing.status === 'RESOLVED') continue;

    // Check same category
    const isSameCategory =
      existing.category?.toLowerCase() === newComplaint.category?.toLowerCase();
    if (!isSameCategory) continue;

    // Check distance proximity (within 500m)
    const distKm = calculateDistanceKm(
      Number(newComplaint.latitude),
      Number(newComplaint.longitude),
      Number(existing.latitude),
      Number(existing.longitude)
    );
    const isNearby = distKm <= 0.5;

    // Check description similarity
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
 * Create a new Complaint in Firestore
 */
export async function createComplaintInFirestore(complaintData, existingComplaints = []) {
  const duplicateCheck = detectPossibleDuplicate(complaintData, existingComplaints);

  const nextCount = existingComplaints.length + 8961;
  const complaintNumber = `CMP-2026-${nextCount}`;
  const nowIso = new Date().toISOString();

  const record = {
    complaintNumber,
    citizenId: complaintData.citizenId || 'citizen-01',
    citizenName: complaintData.citizenName || 'Resident Citizen',
    citizenPhone: complaintData.citizenPhone || '+91 98765 43210',
    category: complaintData.category || 'Other',
    description: complaintData.description || '',
    imageUrl: complaintData.imageUrl || null,
    latitude: Number(complaintData.latitude) || 12.9716,
    longitude: Number(complaintData.longitude) || 77.5946,
    address: complaintData.address || 'Sector 12, Municipal Zone',
    status: 'SUBMITTED',
    departmentId: complaintData.departmentId || 'dept-01',
    workerId: 'unassigned',
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

  if (isLiveFirebaseConfigured()) {
    try {
      const docRef = await addDoc(collection(db, 'complaints'), record);
      record.id = docRef.id;
    } catch (err) {
      console.warn('Error creating complaint in Firestore:', err);
      record.id = `cmp-${Date.now()}`;
    }
  } else {
    record.id = `cmp-${Date.now()}`;
  }

  // Trigger Admin notification
  await sendNotification({
    userId: 'admin',
    complaintId: record.complaintNumber,
    title: duplicateCheck.isDuplicate
      ? `⚠️ New Grievance #${record.complaintNumber} (Possible Duplicate)`
      : `New Grievance #${record.complaintNumber} Registered`,
    message: `${record.category} reported at ${record.address}. Status: SUBMITTED.`,
    type: duplicateCheck.isDuplicate ? 'alert' : 'info',
  });

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

  if (isLiveFirebaseConfigured()) {
    try {
      await updateDoc(doc(db, 'complaints', complaintId), updateFields);
    } catch (err) {
      console.warn('Error verifying complaint in Firestore:', err);
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

  if (isLiveFirebaseConfigured()) {
    try {
      await updateDoc(doc(db, 'complaints', complaintId), updateFields);
    } catch (err) {
      console.warn('Error assigning complaint in Firestore:', err);
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

  if (isLiveFirebaseConfigured()) {
    try {
      await updateDoc(doc(db, 'complaints', complaintId), updateFields);
    } catch (err) {
      console.warn('Error accepting task in Firestore:', err);
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

  if (isLiveFirebaseConfigured()) {
    try {
      await updateDoc(doc(db, 'complaints', complaintId), updateFields);
    } catch (err) {
      console.warn('Error starting work in Firestore:', err);
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

  if (isLiveFirebaseConfigured()) {
    try {
      await updateDoc(doc(db, 'complaints', complaintId), updateFields);
    } catch (err) {
      console.warn('Error resolving complaint in Firestore:', err);
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
      return onSnapshot(q, (snapshot) => {
        const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        callback(list);
      });
    } catch (err) {
      console.warn('Error in realtime complaints listener:', err);
    }
  }
  return () => {};
}
