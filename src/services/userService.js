import { doc, getDoc, setDoc, getDocs, collection, query, where } from 'firebase/firestore';
import { db, isLiveFirebaseConfigured } from '../firebase/firebase';

export const DEFAULT_WORKERS = [
  {
    id: 'user-worker-01',
    name: 'Rajesh Kumar (Field Tech #4)',
    username: 'worker',
    email: 'rajesh.worker@civic.gov',
    phone: '+91 98765 00002',
    role: 'worker',
    departmentId: 'dept-02',
    departmentName: 'Roads & Infrastructure Maintenance',
    zone: 'North District Zone 4',
    specialty: 'Asphalt & Bitumen Tarmac Repair',
  },
  {
    id: 'user-worker-02',
    name: 'Suresh Patil (Senior Plumber)',
    username: 'suresh_p',
    email: 'suresh.patil@civic.gov',
    phone: '+91 98765 00003',
    role: 'worker',
    departmentId: 'dept-04',
    departmentName: 'Water Supply & Sewerage Board',
    zone: 'Central District Zone 1',
    specialty: 'High Pressure Pipeline & Valve Welding',
  },
  {
    id: 'user-worker-03',
    name: 'Amit Sen (Master Electrician)',
    username: 'amit_s',
    email: 'amit.sen@civic.gov',
    phone: '+91 98765 00004',
    role: 'worker',
    departmentId: 'dept-03',
    departmentName: 'Electrical & Street Lighting Dept',
    zone: 'East District Zone 2',
    specialty: 'LED Driver & Street Pole Wiring',
  },
  {
    id: 'user-worker-04',
    name: 'Vikram Yadav (Sanitation Lead)',
    username: 'vikram_y',
    email: 'vikram.yadav@civic.gov',
    phone: '+91 98765 00005',
    role: 'worker',
    departmentId: 'dept-01',
    departmentName: 'Solid Waste Management Division',
    zone: 'West District Zone 3',
    specialty: 'Heavy Compactor & Bin Sanitization',
  },
  {
    id: 'user-worker-05',
    name: 'Ramesh Naidu (Civil Supervisor)',
    username: 'ramesh_n',
    email: 'ramesh.naidu@civic.gov',
    phone: '+91 98765 00006',
    role: 'worker',
    departmentId: 'dept-05',
    departmentName: 'Drainage & Stormwater Dept',
    zone: 'North District Zone 4',
    specialty: 'Stormwater Culvert & Silt Dredging',
  },
];

/**
 * Fetch user profile by ID from Firestore
 */
export async function getUserProfile(userId) {
  if (isLiveFirebaseConfigured() && userId) {
    try {
      const snap = await getDoc(doc(db, 'users', userId));
      if (snap.exists()) {
        return { id: snap.id, ...snap.data() };
      }
    } catch (err) {
      console.warn('Error fetching user profile from Firestore:', err.message);
    }
  }
  return null;
}

/**
 * Save / update user profile in Firestore
 */
export async function saveUserProfile(user) {
  if (isLiveFirebaseConfigured() && user?.id) {
    try {
      const userRef = doc(db, 'users', user.id);
      await setDoc(userRef, user, { merge: true });
    } catch (err) {
      console.warn('Error saving user profile to Firestore:', err.message);
    }
  }
}

/**
 * Fetch all registered field workers
 */
export async function getFieldWorkers(departmentId = null) {
  if (isLiveFirebaseConfigured()) {
    try {
      let q = query(collection(db, 'users'), where('role', '==', 'worker'));
      if (departmentId) {
        q = query(collection(db, 'users'), where('role', '==', 'worker'), where('departmentId', '==', departmentId));
      }
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      }
    } catch (err) {
      console.warn('Error fetching workers from Firestore:', err.message);
    }
  }
  if (departmentId) {
    return DEFAULT_WORKERS.filter((w) => w.departmentId === departmentId);
  }
  return DEFAULT_WORKERS;
}
