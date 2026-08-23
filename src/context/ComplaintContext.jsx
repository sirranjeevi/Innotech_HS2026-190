import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  createComplaintInFirestore,
  verifyComplaintInFirestore,
  assignComplaintInFirestore,
  acceptTaskInFirestore,
  startWorkInFirestore,
  resolveComplaintInFirestore,
  subscribeToComplaints,
  detectPossibleDuplicate
} from '../services/complaintService';
import { getDepartments, DEFAULT_DEPARTMENTS } from '../services/departmentService';
import { getFieldWorkers, DEFAULT_WORKERS } from '../services/userService';
import {
  sendNotification,
  subscribeToNotifications,
  markNotificationAsRead
} from '../services/notificationService';
import { uploadImage } from '../services/storageService';

export const MUNICIPAL_DEPARTMENTS = DEFAULT_DEPARTMENTS.map((d) => d.name);
export const MUNICIPAL_WORKERS = DEFAULT_WORKERS;

const INITIAL_COMPLAINTS_SCHEMA = [
  {
    id: 'cmp-01',
    complaintNumber: 'CMP-2026-8941',
    citizenId: 'user-citizen-01',
    citizenName: 'Ananya Sharma',
    citizenPhone: '+91 98765 43210',
    citizenEmail: 'ananya.sharma@example.com',
    citizenAddress: '42 Blossom Enclave, Sector 12',
    category: 'Pothole',
    description: 'Severe road crater near 4th Main Crossroad causing traffic hazard and vehicle tire damage.',
    imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    latitude: 12.9716,
    longitude: 77.5946,
    address: '4th Main Crossroad, Near City Care Clinic, Sector 7',
    status: 'IN_PROGRESS',
    departmentId: 'dept-02',
    departmentName: 'Roads & Infrastructure Maintenance',
    workerId: 'user-worker-01',
    workerName: 'Rajesh Kumar (Field Tech #4)',
    isPossibleDuplicate: false,
    duplicateMatchedNumber: null,
    createdAt: '2026-08-21T09:30:00.000Z',
    verifiedAt: '2026-08-21T11:15:00.000Z',
    assignedAt: '2026-08-21T14:40:00.000Z',
    acceptedAt: '2026-08-22T08:30:00.000Z',
    startedAt: '2026-08-22T10:00:00.000Z',
    resolvedAt: null,
    resolutionImageUrl: null,
    resolutionNotes: null,
  },
  {
    id: 'cmp-02',
    complaintNumber: 'CMP-2026-8910',
    citizenId: 'user-citizen-01',
    citizenName: 'Ananya Sharma',
    citizenPhone: '+91 98765 43210',
    citizenEmail: 'ananya.sharma@example.com',
    citizenAddress: '42 Blossom Enclave, Sector 12',
    category: 'Water Leakage',
    description: 'Underground main drinking water pipe rupture flooding street entrance with clean potable water.',
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb180c5f2?auto=format&fit=crop&w=800&q=80',
    latitude: 12.9625,
    longitude: 77.6381,
    address: 'Gate 2, Rosewood Colony, Indiranagar',
    status: 'RESOLVED',
    departmentId: 'dept-04',
    departmentName: 'Water Supply & Sewerage Board',
    workerId: 'user-worker-02',
    workerName: 'Suresh Patil (Senior Plumber)',
    isPossibleDuplicate: false,
    duplicateMatchedNumber: null,
    createdAt: '2026-08-18T08:15:00.000Z',
    verifiedAt: '2026-08-18T09:30:00.000Z',
    assignedAt: '2026-08-18T11:00:00.000Z',
    acceptedAt: '2026-08-18T11:45:00.000Z',
    startedAt: '2026-08-19T09:00:00.000Z',
    resolvedAt: '2026-08-19T16:30:00.000Z',
    resolutionImageUrl: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=800&q=80',
    resolutionNotes: 'Excavated 1.2 meters to reach main supply valve. Replaced ruptured 4-inch ductile iron elbow pipe with reinforced polymer joint. Zero leakage confirmed after pressure testing.',
  },
  {
    id: 'cmp-03',
    complaintNumber: 'CMP-2026-8955',
    citizenId: 'user-citizen-02',
    citizenName: 'Vikram Aditya',
    citizenPhone: '+91 98765 11223',
    citizenEmail: 'vikram.aditya@example.com',
    citizenAddress: '15 Green Glen, Sector 12',
    category: 'Street Light',
    description: 'Street light pole 18 unlit for 3 consecutive nights causing darkness on pedestrian walkway.',
    imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
    latitude: 12.9780,
    longitude: 77.6408,
    address: 'Opposite Community Hall, 2nd Avenue, Sector 12',
    status: 'SUBMITTED',
    departmentId: 'dept-03',
    departmentName: 'Electrical & Street Lighting Dept',
    workerId: 'unassigned',
    workerName: 'Unassigned',
    isPossibleDuplicate: false,
    duplicateMatchedNumber: null,
    createdAt: '2026-08-23T06:45:00.000Z',
    verifiedAt: null,
    assignedAt: null,
    acceptedAt: null,
    startedAt: null,
    resolvedAt: null,
    resolutionImageUrl: null,
    resolutionNotes: null,
  },
  {
    id: 'cmp-04',
    complaintNumber: 'CMP-2026-8958',
    citizenId: 'user-citizen-03',
    citizenName: 'Pooja Hegde',
    citizenPhone: '+91 98765 77889',
    citizenEmail: 'pooja.h@example.com',
    citizenAddress: '88 Lake View, Sector 4',
    category: 'Drainage',
    description: 'Silt accumulation blocking concrete culvert drain near bus stop.',
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb180c5f2?auto=format&fit=crop&w=800&q=80',
    latitude: 12.9740,
    longitude: 77.6110,
    address: 'Lake View Main Road, Near Sector 4 Bus Stop',
    status: 'VERIFIED',
    departmentId: 'dept-05',
    departmentName: 'Drainage & Stormwater Dept',
    workerId: 'unassigned',
    workerName: 'Unassigned',
    isPossibleDuplicate: false,
    duplicateMatchedNumber: null,
    createdAt: '2026-08-23T08:00:00.000Z',
    verifiedAt: '2026-08-23T09:15:00.000Z',
    assignedAt: null,
    acceptedAt: null,
    startedAt: null,
    resolvedAt: null,
    resolutionImageUrl: null,
    resolutionNotes: null,
  },
  {
    id: 'cmp-05',
    complaintNumber: 'CMP-2026-8933',
    citizenId: 'user-citizen-01',
    citizenName: 'Ananya Sharma',
    citizenPhone: '+91 98765 43210',
    citizenEmail: 'ananya.sharma@example.com',
    citizenAddress: '42 Blossom Enclave, Sector 12',
    category: 'Garbage',
    description: 'Community garbage container overflowing for 4 days creating foul odor and health hazard.',
    imageUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80',
    latitude: 12.9812,
    longitude: 77.6015,
    address: 'Near Central Vegetable Market, Block C',
    status: 'ASSIGNED',
    departmentId: 'dept-01',
    departmentName: 'Solid Waste Management Division',
    workerId: 'user-worker-04',
    workerName: 'Vikram Yadav (Sanitation Lead)',
    isPossibleDuplicate: false,
    duplicateMatchedNumber: null,
    createdAt: '2026-08-22T14:10:00.000Z',
    verifiedAt: '2026-08-22T15:00:00.000Z',
    assignedAt: '2026-08-22T15:30:00.000Z',
    acceptedAt: null,
    startedAt: null,
    resolvedAt: null,
    resolutionImageUrl: null,
    resolutionNotes: null,
  },
];

const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-1',
    userId: 'all',
    complaintId: 'CMP-2026-8941',
    title: 'Work In Progress',
    message: 'Rajesh Kumar (Field Tech) is repairing pothole #CMP-2026-8941 on 4th Main Crossroad.',
    isRead: false,
    createdAt: '2026-08-22T10:00:00.000Z',
  },
  {
    id: 'notif-2',
    userId: 'all',
    complaintId: 'CMP-2026-8910',
    title: 'Resolution Complete 🎉',
    message: 'Water leakage #CMP-2026-8910 marked Resolved by Suresh Patil with proof.',
    isRead: false,
    createdAt: '2026-08-19T16:30:00.000Z',
  },
  {
    id: 'notif-3',
    userId: 'all',
    complaintId: 'CMP-2026-8955',
    title: 'New Complaint Lodged',
    message: 'Street Light complaint #CMP-2026-8955 registered and queued for verification.',
    isRead: true,
    createdAt: '2026-08-23T06:45:00.000Z',
  },
];

// Helper to deduplicate array of complaints by complaintNumber or id
function deduplicateComplaints(list) {
  const map = new Map();
  list.forEach((item) => {
    const key = item.complaintNumber || item.id;
    if (key) {
      map.set(key, item);
    }
  });
  return Array.from(map.values());
}

const ComplaintContext = createContext(null);

export function ComplaintProvider({ children }) {
  const [complaints, setComplaints] = useState(() => {
    try {
      const saved = localStorage.getItem('civic_complaints_v6');
      return saved ? deduplicateComplaints(JSON.parse(saved)) : INITIAL_COMPLAINTS_SCHEMA;
    } catch {
      return INITIAL_COMPLAINTS_SCHEMA;
    }
  });

  const [departments, setDepartments] = useState(DEFAULT_DEPARTMENTS);
  const [workers, setWorkers] = useState(DEFAULT_WORKERS);

  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('civic_notifications_v6');
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  // Local storage persistence sync
  useEffect(() => {
    try {
      localStorage.setItem('civic_complaints_v6', JSON.stringify(deduplicateComplaints(complaints)));
    } catch (e) {
      console.error('Error storing complaints:', e);
    }
  }, [complaints]);

  useEffect(() => {
    try {
      localStorage.setItem('civic_notifications_v6', JSON.stringify(notifications));
    } catch (e) {
      console.error('Error storing notifications:', e);
    }
  }, [notifications]);

  // Realtime Firestore listeners
  useEffect(() => {
    const unsubComplaints = subscribeToComplaints((remoteList) => {
      if (remoteList && remoteList.length > 0) {
        setComplaints((prev) => {
          const map = new Map();
          remoteList.forEach((r) => map.set(r.complaintNumber || r.id, r));
          prev.forEach((p) => {
            const key = p.complaintNumber || p.id;
            if (!map.has(key)) map.set(key, p);
          });
          return Array.from(map.values());
        });
      }
    });

    const unsubNotifs = subscribeToNotifications('all', (remoteNotifs) => {
      if (remoteNotifs && remoteNotifs.length > 0) {
        setNotifications((prev) => {
          const map = new Map();
          remoteNotifs.forEach((r) => map.set(r.id, r));
          prev.forEach((p) => {
            if (!map.has(p.id)) map.set(p.id, p);
          });
          return Array.from(map.values());
        });
      }
    });

    return () => {
      unsubComplaints();
      unsubNotifs();
    };
  }, []);

  const getDepartmentIdForCategory = (category) => {
    switch (category) {
      case 'Garbage':
        return 'dept-01';
      case 'Pothole':
        return 'dept-02';
      case 'Street Light':
        return 'dept-03';
      case 'Water Leakage':
        return 'dept-04';
      case 'Drainage':
        return 'dept-05';
      default:
        return 'dept-06';
    }
  };

  /**
   * 1. Citizen: Submit Complaint
   */
  const addComplaint = async ({
    category,
    description,
    image,
    latitude,
    longitude,
    address,
    citizenName,
    citizenId,
    citizenPhone,
    citizenEmail,
  }) => {
    let uploadedImageUrl = null;
    if (image) {
      uploadedImageUrl = await uploadImage(image, 'complaints/');
    }

    const deptId = getDepartmentIdForCategory(category);
    const deptObj = departments.find((d) => d.id === deptId) || DEFAULT_DEPARTMENTS.find((d) => d.id === deptId);

    const complaintPayload = {
      category: category || 'Other',
      description: description || '',
      imageUrl: uploadedImageUrl || image || null,
      latitude: Number(latitude) || 12.9716,
      longitude: Number(longitude) || 77.5946,
      address: address || 'Municipal Area, Sector 12',
      citizenName: citizenName || 'Resident Citizen',
      citizenId: citizenId || 'user-citizen-01',
      citizenPhone: citizenPhone || '+91 98765 43210',
      citizenEmail: citizenEmail || 'citizen@example.com',
      departmentId: deptId,
      departmentName: deptObj ? deptObj.name : 'General Municipal Administration',
    };

    const newRecord = await createComplaintInFirestore(complaintPayload, complaints);
    newRecord.departmentName = deptObj ? deptObj.name : 'General Municipal Administration';
    newRecord.workerName = 'Unassigned';

    setComplaints((prev) => {
      // Deduplicate to ensure the new complaint is only present ONCE
      const filtered = prev.filter(
        (c) => c.complaintNumber !== newRecord.complaintNumber && c.id !== newRecord.id
      );
      return [newRecord, ...filtered];
    });

    const newNotif = {
      id: `notif-${Date.now()}`,
      userId: 'all',
      complaintId: newRecord.complaintNumber,
      title: newRecord.isPossibleDuplicate
        ? `⚠️ New Grievance #${newRecord.complaintNumber} (Potential Duplicate)`
        : `New Grievance #${newRecord.complaintNumber} Registered`,
      message: `${category} reported by ${newRecord.citizenName} at ${newRecord.address}. Status: SUBMITTED.`,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [newNotif, ...prev]);

    return newRecord;
  };

  /**
   * 2. Admin: Verify Complaint (SUBMITTED -> VERIFIED)
   */
  const verifyComplaint = async (complaintIdOrNumber, adminName = 'Admin Officer Sharma') => {
    const target = complaints.find(
      (c) => c.id === complaintIdOrNumber || c.complaintNumber === complaintIdOrNumber
    );
    if (!target) return;

    const nowIso = new Date().toISOString();
    verifyComplaintInFirestore(target.id).catch(() => {});

    setComplaints((prev) =>
      prev.map((c) =>
        c.id === target.id || c.complaintNumber === target.complaintNumber
          ? { ...c, status: 'VERIFIED', verifiedAt: nowIso }
          : c
      )
    );

    sendNotification({
      userId: target.citizenId,
      complaintId: target.complaintNumber,
      title: `Grievance #${target.complaintNumber} Verified`,
      message: `Your reported ${target.category} grievance has been verified and approved by municipal administration.`,
      type: 'info',
    }).catch(() => {});

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        userId: target.citizenId,
        complaintId: target.complaintNumber,
        title: `Grievance #${target.complaintNumber} Verified`,
        message: `Your reported ${target.category} grievance has been verified and approved.`,
        isRead: false,
        createdAt: nowIso,
      },
      ...prev,
    ]);
  };

  /**
   * 3. Admin: Assign Department + Worker (VERIFIED -> ASSIGNED)
   */
  const assignDepartmentAndWorker = async (complaintIdOrNumber, departmentNameOrId, workerNameOrId) => {
    const target = complaints.find(
      (c) => c.id === complaintIdOrNumber || c.complaintNumber === complaintIdOrNumber
    );
    if (!target) return;

    const deptObj = departments.find(
      (d) => d.id === departmentNameOrId || d.name === departmentNameOrId
    ) || { id: departmentNameOrId, name: departmentNameOrId };

    const workerObj = workers.find(
      (w) => w.id === workerNameOrId || w.name === workerNameOrId
    ) || { id: workerNameOrId, name: workerNameOrId };

    const nowIso = new Date().toISOString();
    assignComplaintInFirestore(target.id, deptObj.id, workerObj.id).catch(() => {});

    setComplaints((prev) =>
      prev.map((c) =>
        c.id === target.id || c.complaintNumber === target.complaintNumber
          ? {
              ...c,
              status: 'ASSIGNED',
              departmentId: deptObj.id,
              departmentName: deptObj.name,
              department: deptObj.name,
              workerId: workerObj.id,
              workerName: workerObj.name,
              worker: workerObj.name,
              assignedAt: nowIso,
            }
          : c
      )
    );

    sendNotification({
      userId: workerObj.id,
      complaintId: target.complaintNumber,
      title: `New Task Assigned: #${target.complaintNumber}`,
      message: `You have been allocated to work on ${target.category} at ${target.address}.`,
      type: 'alert',
    }).catch(() => {});

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        userId: 'all',
        complaintId: target.complaintNumber,
        title: `Task Assigned: #${target.complaintNumber}`,
        message: `Assigned to ${deptObj.name} (${workerObj.name}).`,
        isRead: false,
        createdAt: nowIso,
      },
      ...prev,
    ]);
  };

  /**
   * 4. Worker: Accept Task (ASSIGNED -> ACCEPTED)
   */
  const acceptTask = async (complaintIdOrNumber, workerName = 'Field Worker') => {
    const target = complaints.find(
      (c) => c.id === complaintIdOrNumber || c.complaintNumber === complaintIdOrNumber
    );
    if (!target) return;

    const nowIso = new Date().toISOString();
    acceptTaskInFirestore(target.id).catch(() => {});

    setComplaints((prev) =>
      prev.map((c) =>
        c.id === target.id || c.complaintNumber === target.complaintNumber
          ? { ...c, status: 'ACCEPTED', acceptedAt: nowIso }
          : c
      )
    );

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        userId: 'admin',
        complaintId: target.complaintNumber,
        title: `Task #${target.complaintNumber} Accepted`,
        message: `${workerName} accepted work order #${target.complaintNumber} and is preparing equipment.`,
        isRead: false,
        createdAt: nowIso,
      },
      ...prev,
    ]);
  };

  /**
   * 5. Worker: Start Work (ACCEPTED -> IN_PROGRESS)
   */
  const startWork = async (complaintIdOrNumber, workerName = 'Field Worker') => {
    const target = complaints.find(
      (c) => c.id === complaintIdOrNumber || c.complaintNumber === complaintIdOrNumber
    );
    if (!target) return;

    const nowIso = new Date().toISOString();
    startWorkInFirestore(target.id).catch(() => {});

    setComplaints((prev) =>
      prev.map((c) =>
        c.id === target.id || c.complaintNumber === target.complaintNumber
          ? { ...c, status: 'IN_PROGRESS', startedAt: nowIso }
          : c
      )
    );

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        userId: target.citizenId,
        complaintId: target.complaintNumber,
        title: `Field Work In Progress #${target.complaintNumber}`,
        message: `${workerName} arrived on site and active repairs are underway.`,
        isRead: false,
        createdAt: nowIso,
      },
      ...prev,
    ]);
  };

  /**
   * 6. Worker: Upload Resolution & Mark Resolved (IN_PROGRESS -> RESOLVED)
   */
  const resolveComplaint = async (
    complaintIdOrNumber,
    { resolutionImage, resolutionNotes },
    workerName = 'Field Specialist'
  ) => {
    const target = complaints.find(
      (c) => c.id === complaintIdOrNumber || c.complaintNumber === complaintIdOrNumber
    );
    if (!target) return;

    let uploadedResUrl = null;
    if (resolutionImage) {
      uploadedResUrl = await uploadImage(resolutionImage, 'resolutions/');
    }

    const nowIso = new Date().toISOString();
    const finalResImage = uploadedResUrl || resolutionImage || 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=800&q=80';
    const finalResNotes = resolutionNotes || 'Repairs completed and ground verified.';

    resolveComplaintInFirestore(target.id, {
      resolutionImageUrl: finalResImage,
      resolutionNotes: finalResNotes,
    }).catch(() => {});

    setComplaints((prev) =>
      prev.map((c) =>
        c.id === target.id || c.complaintNumber === target.complaintNumber
          ? {
              ...c,
              status: 'RESOLVED',
              resolvedAt: nowIso,
              resolutionImageUrl: finalResImage,
              resolutionNotes: finalResNotes,
            }
          : c
      )
    );

    sendNotification({
      userId: target.citizenId,
      complaintId: target.complaintNumber,
      title: `Grievance #${target.complaintNumber} Resolved 🎉`,
      message: `Your reported ${target.category} has been marked Resolved. View the resolution evidence and notes.`,
      type: 'success',
    }).catch(() => {});

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        userId: target.citizenId,
        complaintId: target.complaintNumber,
        title: `Grievance #${target.complaintNumber} Resolved 🎉`,
        message: `Marked Resolved by ${workerName}. View ground resolution proof.`,
        isRead: false,
        createdAt: nowIso,
      },
      ...prev,
    ]);
  };

  const getComplaintById = (idOrNumber) => {
    if (!idOrNumber) return null;
    return (
      complaints.find(
        (c) =>
          c.id?.toLowerCase() === idOrNumber.toLowerCase() ||
          c.complaintNumber?.toLowerCase() === idOrNumber.toLowerCase()
      ) || null
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <ComplaintContext.Provider
      value={{
        complaints,
        departments,
        workers,
        notifications,
        adminNotifications: notifications,
        workerNotifications: notifications,
        unreadNotificationCount: notifications.filter((n) => !n.isRead).length,
        unreadWorkerNotificationCount: notifications.filter((n) => !n.isRead).length,
        addComplaint,
        verifyComplaint,
        assignDepartmentAndWorker,
        acceptTask,
        startWork,
        resolveComplaint,
        getComplaintById,
        markAllNotificationsRead,
        markAllAdminNotificationsRead: markAllNotificationsRead,
        markAllWorkerNotificationsRead: markAllNotificationsRead,
      }}
    >
      {children}
    </ComplaintContext.Provider>
  );
}

export function useComplaints() {
  const context = useContext(ComplaintContext);
  if (!context) {
    throw new Error('useComplaints must be used within a ComplaintProvider');
  }
  return context;
}
