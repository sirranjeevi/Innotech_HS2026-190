import React, { createContext, useContext, useState, useEffect } from 'react';

export const MUNICIPAL_DEPARTMENTS = [
  'Solid Waste Management Division',
  'Roads & Infrastructure Maintenance',
  'Electrical & Street Lighting Dept',
  'Water Supply & Sewerage Board',
  'Drainage & Stormwater Dept',
  'Civil Works & Public Amenities',
];

export const MUNICIPAL_WORKERS = [
  {
    id: 'worker-01',
    name: 'Rajesh Kumar (Field Tech #4)',
    department: 'Roads & Infrastructure Maintenance',
    zone: 'North District Zone 4',
    phone: '+91 98765 00002',
    email: 'rajesh.worker@civic.gov',
    status: 'Active on Duty',
    specialty: 'Asphalt & Bitumen Tarmac Repair',
  },
  {
    id: 'worker-02',
    name: 'Suresh Patil (Senior Plumber)',
    department: 'Water Supply & Sewerage Board',
    zone: 'Central District Zone 1',
    phone: '+91 98765 00003',
    email: 'suresh.patil@civic.gov',
    status: 'Active on Duty',
    specialty: 'High Pressure Pipeline & Valve Welding',
  },
  {
    id: 'worker-03',
    name: 'Amit Sen (Master Electrician)',
    department: 'Electrical & Street Lighting Dept',
    zone: 'East District Zone 2',
    phone: '+91 98765 00004',
    email: 'amit.sen@civic.gov',
    status: 'Active on Duty',
    specialty: 'LED Driver & Street Pole Wiring',
  },
  {
    id: 'worker-04',
    name: 'Vikram Yadav (Sanitation Lead)',
    department: 'Solid Waste Management Division',
    zone: 'West District Zone 3',
    phone: '+91 98765 00005',
    email: 'vikram.yadav@civic.gov',
    status: 'Dispatched',
    specialty: 'Heavy Compactor & Bin Sanitization',
  },
  {
    id: 'worker-05',
    name: 'Ramesh Naidu (Civil Supervisor)',
    department: 'Drainage & Stormwater Dept',
    zone: 'North District Zone 4',
    phone: '+91 98765 00006',
    email: 'ramesh.naidu@civic.gov',
    status: 'Active on Duty',
    specialty: 'Stormwater Culvert & Silt Dredging',
  },
];

// Initial mock grievances representing realistic municipal lifecycle stages
const INITIAL_MOCK_COMPLAINTS = [
  {
    id: 'CMP-2026-8941',
    citizenId: 'user-citizen-01',
    citizenName: 'Ananya Sharma',
    citizenPhone: '+91 98765 43210',
    citizenEmail: 'ananya.sharma@example.com',
    citizenAddress: '42 Blossom Enclave, Sector 12',
    category: 'Pothole',
    title: 'Severe road crater on 4th Main Crossroad',
    description: 'A deep pothole has formed near the junction of 4th Main and Crossroad 2, causing severe traffic jams and vehicle damage during evening peak hours.',
    location: '12.9716° N, 77.5946° E',
    address: '4th Main Crossroad, Near City Care Clinic, Sector 7',
    image: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    createdAt: '2026-08-21T09:30:00.000Z',
    status: 'In Progress',
    department: 'Roads & Infrastructure Maintenance',
    worker: 'Rajesh Kumar (Field Tech #4)',
    timeline: [
      {
        stage: 'Submitted',
        title: 'Complaint Registered',
        time: 'Aug 21, 2026 • 09:30 AM',
        author: 'Ananya Sharma (Citizen)',
        note: 'Issue submitted via Citizen Portal with location coordinates.',
        status: 'Submitted',
      },
      {
        stage: 'Verified',
        title: 'Municipal Verification Complete',
        time: 'Aug 21, 2026 • 11:15 AM',
        author: 'Admin Officer Sharma',
        note: 'Grievance verified against duplicate records and approved for municipal action.',
        status: 'Verified',
      },
      {
        stage: 'Assigned',
        title: 'Work Order Assigned to Department',
        time: 'Aug 21, 2026 • 02:40 PM',
        author: 'Public Works Dispatch',
        note: 'Assigned to North District Asphalt Repair Team (Lead: Rajesh Kumar).',
        status: 'Assigned',
      },
      {
        stage: 'Accepted',
        title: 'Task Accepted by Field Crew',
        time: 'Aug 22, 2026 • 08:30 AM',
        author: 'Rajesh Kumar (Field Tech #4)',
        note: 'Work order accepted. Equipment and bitumen mixture mobilized for site repair.',
        status: 'Accepted',
      },
      {
        stage: 'In Progress',
        title: 'Repair Underway on Ground',
        time: 'Aug 22, 2026 • 10:00 AM',
        author: 'Rajesh Kumar (Field Tech #4)',
        note: 'Road excavation, gravel compaction, and asphalt layering currently in progress.',
        status: 'In Progress',
      },
    ],
  },
  {
    id: 'CMP-2026-8910',
    citizenId: 'user-citizen-01',
    citizenName: 'Ananya Sharma',
    citizenPhone: '+91 98765 43210',
    citizenEmail: 'ananya.sharma@example.com',
    citizenAddress: '42 Blossom Enclave, Sector 12',
    category: 'Water Leakage',
    title: 'Drinking water pipeline rupture leaking onto road',
    description: 'Underground main water pipeline connection ruptured causing continuous clean water wastage and street flooding near Rosewood Colony entrance.',
    location: '12.9625° N, 77.6381° E',
    address: 'Gate 2, Rosewood Colony, Indiranagar',
    image: 'https://images.unsplash.com/photo-1541888946425-d0fbb180c5f2?auto=format&fit=crop&w=800&q=80',
    createdAt: '2026-08-18T08:15:00.000Z',
    status: 'Resolved',
    department: 'Water Supply & Sewerage Board',
    worker: 'Suresh Patil (Senior Plumber)',
    resolvedDate: '2026-08-19T16:30:00.000Z',
    resolutionNotes: 'Excavated 1.2 meters to reach main supply valve. Replaced ruptured 4-inch ductile iron elbow pipe with reinforced polymer joint. Zero leakage confirmed after pressure testing.',
    resolutionImage: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=800&q=80',
    timeline: [
      {
        stage: 'Submitted',
        title: 'Complaint Registered',
        time: 'Aug 18, 2026 • 08:15 AM',
        author: 'Ananya Sharma (Citizen)',
        note: 'Urgent water leakage reported with photo proof.',
        status: 'Submitted',
      },
      {
        stage: 'Verified',
        title: 'Inspection Team Dispatched',
        time: 'Aug 18, 2026 • 09:30 AM',
        author: 'Admin Officer Sharma',
        note: 'Grievance validated as high priority municipal main line.',
        status: 'Verified',
      },
      {
        stage: 'Assigned',
        title: 'Dispatched to Emergency Plumbing Squad',
        time: 'Aug 18, 2026 • 11:00 AM',
        author: 'Water Board Dispatch',
        note: 'Assigned to Suresh Patil (Senior Plumber).',
        status: 'Assigned',
      },
      {
        stage: 'Accepted',
        title: 'Task Accepted & Supplies Requested',
        time: 'Aug 18, 2026 • 11:45 AM',
        author: 'Suresh Patil (Senior Plumber)',
        note: 'Repair kit and pipe replacements dispatched from central warehouse.',
        status: 'Accepted',
      },
      {
        stage: 'In Progress',
        title: 'Excavation & Joint Welding',
        time: 'Aug 19, 2026 • 09:00 AM',
        author: 'Suresh Patil (Senior Plumber)',
        note: 'Isolated water pressure and began pipe replacement.',
        status: 'In Progress',
      },
      {
        stage: 'Resolved',
        title: 'Ground Resolution Complete & Verified',
        time: 'Aug 19, 2026 • 04:30 PM',
        author: 'Suresh Patil (Senior Plumber)',
        note: 'Main supply pipe successfully replaced and surface restored.',
        status: 'Resolved',
      },
    ],
  },
  {
    id: 'CMP-2026-8955',
    citizenId: 'user-citizen-01',
    citizenName: 'Vikram Aditya',
    citizenPhone: '+91 98765 11223',
    citizenEmail: 'vikram.aditya@example.com',
    citizenAddress: '15 Green Glen, Sector 12',
    category: 'Street Light',
    title: 'Non-functional street light pole #18',
    description: 'Street light pole 18 has been completely unlit for 3 consecutive nights causing dark spots on pedestrian walkway.',
    location: '12.9780° N, 77.6408° E',
    address: 'Opposite Community Hall, 2nd Avenue, Sector 12',
    image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
    createdAt: '2026-08-23T06:45:00.000Z',
    status: 'Submitted',
    department: 'Electrical & Street Lighting Dept',
    worker: 'Unassigned',
    timeline: [
      {
        stage: 'Submitted',
        title: 'Complaint Registered',
        time: 'Aug 23, 2026 • 06:45 AM',
        author: 'Vikram Aditya (Citizen)',
        note: 'Initial grievance submission registered in civic queue.',
        status: 'Submitted',
      },
    ],
  },
  {
    id: 'CMP-2026-8958',
    citizenId: 'user-citizen-02',
    citizenName: 'Pooja Hegde',
    citizenPhone: '+91 98765 77889',
    citizenEmail: 'pooja.h@example.com',
    citizenAddress: '88 Lake View, Sector 4',
    category: 'Drainage',
    title: 'Blocked stormwater drain causing waterlogging',
    description: 'Heavy silt accumulation in the concrete culvert is causing water to back up onto the sidewalk during rain.',
    location: '12.9740° N, 77.6110° E',
    address: 'Lake View Main Road, Near Sector 4 Bus Stop',
    image: 'https://images.unsplash.com/photo-1541888946425-d0fbb180c5f2?auto=format&fit=crop&w=800&q=80',
    createdAt: '2026-08-23T08:00:00.000Z',
    status: 'Verified',
    department: 'Drainage & Stormwater Dept',
    worker: 'Unassigned',
    timeline: [
      {
        stage: 'Submitted',
        title: 'Complaint Registered',
        time: 'Aug 23, 2026 • 08:00 AM',
        author: 'Pooja Hegde (Citizen)',
        note: 'Reported street drainage obstruction.',
        status: 'Submitted',
      },
      {
        stage: 'Verified',
        title: 'Supervisor Verified',
        time: 'Aug 23, 2026 • 09:15 AM',
        author: 'Admin Officer Sharma',
        note: 'Field inspection confirmed silt blockage in 15m culvert segment.',
        status: 'Verified',
      },
    ],
  },
  {
    id: 'CMP-2026-8933',
    citizenId: 'user-citizen-01',
    citizenName: 'Ananya Sharma',
    citizenPhone: '+91 98765 43210',
    citizenEmail: 'ananya.sharma@example.com',
    citizenAddress: '42 Blossom Enclave, Sector 12',
    category: 'Garbage',
    title: 'Uncollected community waste bin overflowing',
    description: 'Commercial waste bin on 5th cross has not been cleared for 4 days, causing foul smell and health hazard.',
    location: '12.9812° N, 77.6015° E',
    address: 'Near Central Vegetable Market, Block C',
    image: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80',
    createdAt: '2026-08-22T14:10:00.000Z',
    status: 'Assigned',
    department: 'Solid Waste Management Division',
    worker: 'Vikram Yadav (Sanitation Lead)',
    timeline: [
      {
        stage: 'Submitted',
        title: 'Complaint Registered',
        time: 'Aug 22, 2026 • 02:10 PM',
        author: 'Ananya Sharma (Citizen)',
        note: 'Submitted with photo proof.',
        status: 'Submitted',
      },
      {
        stage: 'Verified',
        title: 'Sanitation Supervisor Approved',
        time: 'Aug 22, 2026 • 03:00 PM',
        author: 'Admin Officer Sharma',
        note: 'Scheduled for clearance dispatch.',
        status: 'Verified',
      },
      {
        stage: 'Assigned',
        title: 'Assigned to Compactor Crew',
        time: 'Aug 22, 2026 • 03:30 PM',
        author: 'Solid Waste Dispatch',
        note: 'Task allocated to Vikram Yadav (Sanitation Lead).',
        status: 'Assigned',
      },
    ],
  },
];

const INITIAL_ADMIN_NOTIFICATIONS = [
  {
    id: 'adm-notif-1',
    complaintId: 'CMP-2026-8955',
    title: 'New Complaint Lodged',
    message: 'New Street Light grievance #CMP-2026-8955 submitted by Vikram Aditya awaiting verification.',
    time: '2 hours ago',
    type: 'alert',
    unread: true,
  },
  {
    id: 'adm-notif-2',
    complaintId: 'CMP-2026-8941',
    title: 'Ground Work Underway',
    message: 'Rajesh Kumar (Field Tech #4) started repair on Pothole #CMP-2026-8941.',
    time: '4 hours ago',
    type: 'info',
    unread: true,
  },
  {
    id: 'adm-notif-3',
    complaintId: 'CMP-2026-8910',
    title: 'Resolution Completed',
    message: 'Suresh Patil marked Water Leakage #CMP-2026-8910 as Resolved with photo evidence.',
    time: 'Yesterday',
    type: 'success',
    unread: false,
  },
];

const INITIAL_WORKER_NOTIFICATIONS = [
  {
    id: 'wrk-notif-1',
    complaintId: 'CMP-2026-8941',
    title: 'Work Order Active',
    message: 'Pothole repair #CMP-2026-8941 on 4th Main Crossroad is currently In Progress.',
    time: '1 hour ago',
    type: 'info',
    unread: true,
  },
  {
    id: 'wrk-notif-2',
    complaintId: 'CMP-2026-8933',
    title: 'New Task Assigned',
    message: 'You have been assigned to Garbage Clearance #CMP-2026-8933. Please accept task to begin.',
    time: '3 hours ago',
    type: 'alert',
    unread: true,
  },
];

const ComplaintContext = createContext(null);

export function ComplaintProvider({ children }) {
  const [complaints, setComplaints] = useState(() => {
    try {
      const saved = localStorage.getItem('civic_complaints_data_v3');
      return saved ? JSON.parse(saved) : INITIAL_MOCK_COMPLAINTS;
    } catch {
      return INITIAL_MOCK_COMPLAINTS;
    }
  });

  const [adminNotifications, setAdminNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('civic_admin_notifications_v3');
      return saved ? JSON.parse(saved) : INITIAL_ADMIN_NOTIFICATIONS;
    } catch {
      return INITIAL_ADMIN_NOTIFICATIONS;
    }
  });

  const [workerNotifications, setWorkerNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('civic_worker_notifications_v3');
      return saved ? JSON.parse(saved) : INITIAL_WORKER_NOTIFICATIONS;
    } catch {
      return INITIAL_WORKER_NOTIFICATIONS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('civic_complaints_data_v3', JSON.stringify(complaints));
    } catch (e) {
      console.error('Error saving complaints:', e);
    }
  }, [complaints]);

  useEffect(() => {
    try {
      localStorage.setItem('civic_admin_notifications_v3', JSON.stringify(adminNotifications));
    } catch (e) {
      console.error('Error saving admin notifications:', e);
    }
  }, [adminNotifications]);

  useEffect(() => {
    try {
      localStorage.setItem('civic_worker_notifications_v3', JSON.stringify(workerNotifications));
    } catch (e) {
      console.error('Error saving worker notifications:', e);
    }
  }, [workerNotifications]);

  const formatNow = () => {
    const formattedDate = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const formattedTime = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
    return `${formattedDate} • ${formattedTime}`;
  };

  /**
   * Citizen: Add Complaint
   */
  const addComplaint = ({ category, description, image, location, address, citizenName, citizenId, citizenPhone, citizenEmail }) => {
    const nextNumber = complaints.length + 8960;
    const newId = `CMP-2026-${nextNumber}`;
    const nowIso = new Date().toISOString();

    const newEntry = {
      id: newId,
      citizenId: citizenId || 'user-citizen-01',
      citizenName: citizenName || 'Citizen',
      citizenPhone: citizenPhone || '+91 98765 43210',
      citizenEmail: citizenEmail || 'citizen@example.com',
      citizenAddress: address || 'Sector 12, Municipal Zone',
      category: category || 'Other',
      title: `${category} issue reported at ${address ? address.split(',')[0] : 'Municipal Area'}`,
      description: description || '',
      location: location || '12.9716° N, 77.5946° E',
      address: address || 'Sector 12, Municipal Zone',
      image: image || null,
      createdAt: nowIso,
      status: 'Submitted',
      department: getDepartmentForCategory(category),
      worker: 'Unassigned',
      timeline: [
        {
          stage: 'Submitted',
          title: 'Complaint Registered',
          time: formatNow(),
          author: citizenName || 'Citizen',
          note: 'Grievance submitted via Citizen Portal and assigned unique tracking ID.',
          status: 'Submitted',
        },
      ],
    };

    setComplaints((prev) => [newEntry, ...prev]);

    // Admin Alert
    setAdminNotifications((prev) => [
      {
        id: `adm-${Date.now()}`,
        complaintId: newId,
        title: 'New Complaint Registered',
        message: `New ${category} grievance #${newId} submitted by ${citizenName || 'Citizen'}.`,
        time: 'Just now',
        type: 'alert',
        unread: true,
      },
      ...prev,
    ]);

    return newEntry;
  };

  /**
   * Admin: Verify Complaint
   */
  const verifyComplaint = (id, adminName = 'Admin Officer Sharma', note = 'Verified by Municipal Administration and approved for work dispatch.') => {
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const newTimeline = [
          ...c.timeline,
          {
            stage: 'Verified',
            title: 'Municipal Verification Approved',
            time: formatNow(),
            author: adminName,
            note: note,
            status: 'Verified',
          },
        ];
        return {
          ...c,
          status: 'Verified',
          timeline: newTimeline,
        };
      })
    );
  };

  /**
   * Admin: Assign Department & Worker
   */
  const assignDepartmentAndWorker = (id, department, worker, adminName = 'Admin Officer Sharma') => {
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const newTimeline = [
          ...c.timeline,
          {
            stage: 'Assigned',
            title: `Assigned to ${department}`,
            time: formatNow(),
            author: adminName,
            note: `Work order dispatched to ${worker}.`,
            status: 'Assigned',
          },
        ];
        return {
          ...c,
          status: 'Assigned',
          department: department,
          worker: worker,
          timeline: newTimeline,
        };
      })
    );

    // Worker Notification
    setWorkerNotifications((prev) => [
      {
        id: `wrk-${Date.now()}`,
        complaintId: id,
        title: 'New Work Order Assigned',
        message: `You have been assigned to Complaint #${id} (${department}).`,
        time: 'Just now',
        type: 'alert',
        unread: true,
      },
      ...prev,
    ]);
  };

  /**
   * Worker: Accept Task
   */
  const acceptTask = (id, workerName = 'Field Worker') => {
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const newTimeline = [
          ...c.timeline,
          {
            stage: 'Accepted',
            title: 'Task Accepted by Field Specialist',
            time: formatNow(),
            author: workerName,
            note: 'Specialist acknowledged work order and mobilized equipment.',
            status: 'Accepted',
          },
        ];
        return {
          ...c,
          status: 'Accepted',
          timeline: newTimeline,
        };
      })
    );
  };

  /**
   * Worker: Start Work (Arrived on Site)
   */
  const startWork = (id, workerName = 'Field Worker') => {
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const newTimeline = [
          ...c.timeline,
          {
            stage: 'In Progress',
            title: 'Active Work Underway on Ground',
            time: formatNow(),
            author: workerName,
            note: 'Field crew arrived on site; active repair and mitigation in progress.',
            status: 'In Progress',
          },
        ];
        return {
          ...c,
          status: 'In Progress',
          timeline: newTimeline,
        };
      })
    );
  };

  /**
   * Worker: Update Progress Note
   */
  const updateTaskProgress = (id, note, workerName = 'Field Worker') => {
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const newTimeline = [
          ...c.timeline,
          {
            stage: 'In Progress',
            title: 'Ground Progress Update',
            time: formatNow(),
            author: workerName,
            note: note,
            status: 'In Progress',
          },
        ];
        return {
          ...c,
          timeline: newTimeline,
        };
      })
    );
  };

  /**
   * Worker: Upload Resolution & Mark Resolved
   */
  const resolveComplaint = (id, { resolutionImage, resolutionNotes }, workerName = 'Field Worker') => {
    const nowIso = new Date().toISOString();
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const newTimeline = [
          ...c.timeline,
          {
            stage: 'Resolved',
            title: 'Ground Resolution Complete & Verified',
            time: formatNow(),
            author: workerName,
            note: resolutionNotes || 'All ground repairs completed and verified against municipal standards.',
            status: 'Resolved',
          },
        ];
        return {
          ...c,
          status: 'Resolved',
          resolvedDate: nowIso,
          resolutionImage: resolutionImage || 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=800&q=80',
          resolutionNotes: resolutionNotes || 'Repairs completed and site cleaned.',
          timeline: newTimeline,
        };
      })
    );

    // Admin & Citizen notifications
    setAdminNotifications((prev) => [
      {
        id: `adm-res-${Date.now()}`,
        complaintId: id,
        title: 'Task Resolved by Field Crew',
        message: `Complaint #${id} was marked Resolved by ${workerName}.`,
        time: 'Just now',
        type: 'success',
        unread: true,
      },
      ...prev,
    ]);
  };

  const getDepartmentForCategory = (category) => {
    switch (category) {
      case 'Garbage':
        return 'Solid Waste Management Division';
      case 'Pothole':
        return 'Roads & Infrastructure Maintenance';
      case 'Street Light':
        return 'Electrical & Street Lighting Dept';
      case 'Water Leakage':
        return 'Water Supply & Sewerage Board';
      case 'Drainage':
        return 'Drainage & Stormwater Dept';
      case 'Public Infrastructure':
        return 'Civil Works & Public Amenities';
      default:
        return 'General Municipal Administration';
    }
  };

  const getComplaintById = (id) => {
    return complaints.find((c) => c.id.toLowerCase() === id?.toLowerCase()) || null;
  };

  const markAllAdminNotificationsRead = () => {
    setAdminNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const markAllWorkerNotificationsRead = () => {
    setWorkerNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  return (
    <ComplaintContext.Provider
      value={{
        complaints,
        departments: MUNICIPAL_DEPARTMENTS,
        workers: MUNICIPAL_WORKERS,
        adminNotifications,
        workerNotifications,
        notifications: adminNotifications, // default alias for general views
        unreadNotificationCount: adminNotifications.filter((n) => n.unread).length,
        unreadWorkerNotificationCount: workerNotifications.filter((n) => n.unread).length,
        addComplaint,
        verifyComplaint,
        assignDepartmentAndWorker,
        acceptTask,
        startWork,
        updateTaskProgress,
        resolveComplaint,
        getComplaintById,
        markAllAdminNotificationsRead,
        markAllWorkerNotificationsRead,
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
