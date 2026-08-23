import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { db, isLiveFirebaseConfigured } from '../firebase/firebase';

export const DEFAULT_DEPARTMENTS = [
  { id: 'dept-01', name: 'Solid Waste Management Division' },
  { id: 'dept-02', name: 'Roads & Infrastructure Maintenance' },
  { id: 'dept-03', name: 'Electrical & Street Lighting Dept' },
  { id: 'dept-04', name: 'Water Supply & Sewerage Board' },
  { id: 'dept-05', name: 'Drainage & Stormwater Dept' },
  { id: 'dept-06', name: 'Civil Works & Public Amenities' },
];

/**
 * Fetch all municipal departments from Firestore or default seeds
 */
export async function getDepartments() {
  if (isLiveFirebaseConfigured()) {
    try {
      const snapshot = await getDocs(collection(db, 'departments'));
      if (!snapshot.empty) {
        return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      }
    } catch (err) {
      console.warn('Error fetching departments from Firestore:', err);
    }
  }
  return DEFAULT_DEPARTMENTS;
}

/**
 * Seed default departments to Firestore if collection is empty
 */
export async function seedDepartments() {
  if (isLiveFirebaseConfigured()) {
    try {
      for (const dept of DEFAULT_DEPARTMENTS) {
        await setDoc(doc(db, 'departments', dept.id), { name: dept.name });
      }
    } catch (err) {
      console.warn('Error seeding departments:', err);
    }
  }
}
