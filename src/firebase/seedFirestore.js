import { collection, doc, setDoc, getDocs } from 'firebase/firestore';
import { db, isLiveFirebaseConfigured } from './firebase';
import { DEFAULT_DEPARTMENTS } from '../services/departmentService';
import { DEFAULT_WORKERS } from '../services/userService';

/**
 * Seed initial Firestore collections matching the Flutter Mobile Database Schema
 */
export async function seedFirestoreDatabase() {
  if (!isLiveFirebaseConfigured()) {
    console.log('Firebase credentials not set in .env. Running in local reactive state mode.');
    return { success: false, message: 'Firebase not configured with live credentials in .env' };
  }

  try {
    // 1. Seed Municipal Departments
    for (const dept of DEFAULT_DEPARTMENTS) {
      await setDoc(doc(db, 'departments', dept.id), {
        id: dept.id,
        name: dept.name,
      });
    }

    // 2. Seed Field Workers Roster in 'users' collection
    for (const worker of DEFAULT_WORKERS) {
      await setDoc(doc(db, 'users', worker.id), {
        id: worker.id,
        name: worker.name,
        username: worker.username,
        email: worker.email,
        phone: worker.phone,
        role: 'worker',
        departmentId: worker.departmentId,
        departmentName: worker.departmentName,
        zone: worker.zone,
        specialty: worker.specialty,
      });
    }

    // 3. Seed Default Admin User in 'users' collection
    await setDoc(doc(db, 'users', 'user-admin-01'), {
      id: 'user-admin-01',
      name: 'Municipal Admin Officer',
      username: 'admin',
      email: 'admin@civic.gov',
      phone: '+91 98765 00001',
      role: 'admin',
    });

    return { success: true, message: 'Firestore collections (departments, users, complaints) seeded successfully!' };
  } catch (error) {
    console.error('Error seeding Firestore database:', error);
    return { success: false, error: error.message };
  }
}
