import { collection, addDoc, doc, updateDoc, onSnapshot, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db, isLiveFirebaseConfigured } from '../firebase/firebase';

/**
 * Dispatch a notification to Firestore or local state
 */
export async function sendNotification({ userId, complaintId, title, message, type = 'info' }) {
  const notificationData = {
    userId: userId || 'all',
    complaintId: complaintId || null,
    title,
    message,
    type,
    isRead: false,
    createdAt: new Date().toISOString(),
  };

  if (isLiveFirebaseConfigured()) {
    try {
      const docRef = await addDoc(collection(db, 'notifications'), notificationData);
      return { id: docRef.id, ...notificationData };
    } catch (err) {
      console.warn('Error sending notification to Firestore:', err);
    }
  }

  return { id: `notif-${Date.now()}`, ...notificationData };
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId) {
  if (isLiveFirebaseConfigured() && notificationId) {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), { isRead: true });
    } catch (err) {
      console.warn('Error updating notification in Firestore:', err);
    }
  }
}

/**
 * Subscribe to realtime notifications for a user or role
 */
export function subscribeToNotifications(userId, callback) {
  if (isLiveFirebaseConfigured()) {
    try {
      const q = query(
        collection(db, 'notifications'),
        orderBy('createdAt', 'desc')
      );
      return onSnapshot(q, (snapshot) => {
        const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        callback(list);
      });
    } catch (err) {
      console.warn('Realtime notifications listener error:', err);
    }
  }
  return () => {};
}
