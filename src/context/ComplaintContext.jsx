import React, { createContext, useContext, useState, useEffect } from 'react';

// Seed mock complaints representing realistic civic issues
const INITIAL_MOCK_COMPLAINTS = [
  {
    id: 'CMP-2026-8941',
    citizenId: 'user-citizen-01',
    citizenName: 'Ananya Sharma',
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
        note: 'Issue submitted via Citizen Mobile/Web Portal with location coordinates.',
        status: 'Submitted',
      },
      {
        stage: 'Verified',
        title: 'Municipal Verification Complete',
        time: 'Aug 21, 2026 • 11:15 AM',
        author: 'Admin Officer Sharma',
        note: 'Grievance verified against duplicate records and approved for municipal action.',
        status: 'Under Review',
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
        author: 'Rajesh Kumar (Field Tech)',
        note: 'Work order accepted. Equipment and bitumen mixture mobilized for site repair.',
        status: 'In Progress',
      },
      {
        stage: 'In Progress',
        title: 'Repair Underway on Ground',
        time: 'Aug 22, 2026 • 10:00 AM',
        author: 'Field Crew Alpha',
        note: 'Road excavation, gravel compaction, and asphalt layering currently in progress.',
        status: 'In Progress',
      },
    ],
  },
  {
    id: 'CMP-2026-8910',
    citizenId: 'user-citizen-01',
    citizenName: 'Ananya Sharma',
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
        author: 'Water Board Triage',
        note: 'Grievance validated as high priority municipal main line.',
        status: 'Under Review',
      },
      {
        stage: 'Assigned',
        title: 'Dispatched to Emergency Plumbing Squad',
        time: 'Aug 18, 2026 • 11:00 AM',
        author: 'Municipal Operations',
        note: 'Assigned to Suresh Patil (Team 3).',
        status: 'Assigned',
      },
      {
        stage: 'Accepted',
        title: 'Task Accepted & Supplies Requested',
        time: 'Aug 18, 2026 • 11:45 AM',
        author: 'Suresh Patil',
        note: 'Repair kit and pipe replacements dispatched from central warehouse.',
        status: 'In Progress',
      },
      {
        stage: 'In Progress',
        title: 'Excavation & Joint Welding',
        time: 'Aug 19, 2026 • 09:00 AM',
        author: 'Plumbing Squad 3',
        note: 'Isolated water pressure and began pipe replacement.',
        status: 'In Progress',
      },
      {
        stage: 'Resolved',
        title: 'Ground Resolution Complete & Verified',
        time: 'Aug 19, 2026 • 04:30 PM',
        author: 'Suresh Patil',
        note: 'Main supply pipe successfully replaced and surface restored.',
        status: 'Resolved',
      },
    ],
  },
  {
    id: 'CMP-2026-8955',
    citizenId: 'user-citizen-01',
    citizenName: 'Ananya Sharma',
    category: 'Street Light',
    title: 'Non-functional street light pole #18',
    description: 'Street light pole 18 has been completely unlit for 3 consecutive nights causing dark spots on pedestrian walkway.',
    location: '12.9780° N, 77.6408° E',
    address: 'Opposite Community Hall, 2nd Avenue, Sector 12',
    image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
    createdAt: '2026-08-23T06:45:00.000Z',
    status: 'Submitted',
    department: 'Electrical & Street Lighting Dept',
    worker: 'Pending Department Allocation',
    timeline: [
      {
        stage: 'Submitted',
        title: 'Complaint Registered',
        time: 'Aug 23, 2026 • 06:45 AM',
        author: 'Ananya Sharma (Citizen)',
        note: 'Initial grievance submission registered in civic queue.',
        status: 'Submitted',
      },
    ],
  },
  {
    id: 'CMP-2026-8933',
    citizenId: 'user-citizen-01',
    citizenName: 'Ananya Sharma',
    category: 'Garbage',
    title: 'Uncollected community waste bin overflowing',
    description: 'Commercial waste bin on 5th cross has not been cleared for 4 days, causing foul smell and health hazard.',
    location: '12.9812° N, 77.6015° E',
    address: 'Near Central Vegetable Market, Block C',
    image: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80',
    createdAt: '2026-08-22T14:10:00.000Z',
    status: 'In Progress',
    department: 'Solid Waste Management Division',
    worker: 'Sanitation Truck #12 Crew',
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
        note: 'Scheduled for evening pickup.',
        status: 'Under Review',
      },
      {
        stage: 'Assigned',
        title: 'Assigned to Compactor Truck 12',
        time: 'Aug 22, 2026 • 03:30 PM',
        author: 'Solid Waste Dispatch',
        note: 'Driver alerted for route clearance.',
        status: 'Assigned',
      },
      {
        stage: 'Accepted',
        title: 'En route to Sector Market',
        time: 'Aug 23, 2026 • 07:00 AM',
        author: 'Sanitation Crew',
        note: 'Vehicle departed depot.',
        status: 'In Progress',
      },
      {
        stage: 'In Progress',
        title: 'Waste Clearance in Progress',
        time: 'Aug 23, 2026 • 08:30 AM',
        author: 'Sanitation Crew',
        note: 'Clearing overflowing bin and sanitizing adjacent area.',
        status: 'In Progress',
      },
    ],
  },
];

const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-1',
    complaintId: 'CMP-2026-8941',
    title: 'Field Team Dispatched',
    message: 'Rajesh Kumar (Field Tech) is on-site repairing your reported pothole #CMP-2026-8941.',
    time: '2 hours ago',
    type: 'info',
    unread: true,
  },
  {
    id: 'notif-2',
    complaintId: 'CMP-2026-8910',
    title: 'Resolution Complete 🎉',
    message: 'Water leakage #CMP-2026-8910 was marked Resolved by Suresh Patil. View resolution evidence.',
    time: 'Yesterday',
    type: 'success',
    unread: true,
  },
  {
    id: 'notif-3',
    complaintId: 'CMP-2026-8955',
    title: 'Complaint Registered',
    message: 'Street Light complaint #CMP-2026-8955 has been registered and queued for verification.',
    time: '5 hours ago',
    type: 'info',
    unread: false,
  },
];

const ComplaintContext = createContext(null);

export function ComplaintProvider({ children }) {
  const [complaints, setComplaints] = useState(() => {
    try {
      const saved = localStorage.getItem('civic_complaints_data');
      return saved ? JSON.parse(saved) : INITIAL_MOCK_COMPLAINTS;
    } catch {
      return INITIAL_MOCK_COMPLAINTS;
    }
  });

  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('civic_notifications_data');
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('civic_complaints_data', JSON.stringify(complaints));
    } catch (e) {
      console.error('Error saving complaints to localStorage:', e);
    }
  }, [complaints]);

  useEffect(() => {
    try {
      localStorage.setItem('civic_notifications_data', JSON.stringify(notifications));
    } catch (e) {
      console.error('Error saving notifications to localStorage:', e);
    }
  }, [notifications]);

  /**
   * Submit a new complaint
   */
  const addComplaint = ({ category, description, image, location, address, citizenName, citizenId }) => {
    const nextNumber = complaints.length + 8960;
    const newId = `CMP-2026-${nextNumber}`;
    const nowIso = new Date().toISOString();
    const formattedDate = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const formattedTime = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const newEntry = {
      id: newId,
      citizenId: citizenId || 'user-citizen-01',
      citizenName: citizenName || 'Citizen',
      category: category || 'Other',
      title: `${category} issue reported at ${address ? address.split(',')[0] : 'Municipal Area'}`,
      description: description || '',
      location: location || '12.9716° N, 77.5946° E',
      address: address || 'Sector 12, Municipal Zone',
      image: image || null,
      createdAt: nowIso,
      status: 'Submitted',
      department: getDepartmentForCategory(category),
      worker: 'Pending Department Allocation',
      timeline: [
        {
          stage: 'Submitted',
          title: 'Complaint Registered',
          time: `${formattedDate} • ${formattedTime}`,
          author: `${citizenName || 'Citizen'}`,
          note: 'Grievance submitted via Citizen Portal and assigned a unique tracking ID.',
          status: 'Submitted',
        },
      ],
    };

    // Prepend new complaint
    setComplaints((prev) => [newEntry, ...prev]);

    // Create notification
    const newNotification = {
      id: `notif-${Date.now()}`,
      complaintId: newId,
      title: 'Complaint Registered',
      message: `Your complaint #${newId} (${category}) has been submitted successfully.`,
      time: 'Just now',
      type: 'info',
      unread: true,
    };
    setNotifications((prev) => [newNotification, ...prev]);

    return newEntry;
  };

  /**
   * Helper to determine department by category
   */
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

  /**
   * Get single complaint by ID
   */
  const getComplaintById = (id) => {
    return complaints.find((c) => c.id.toLowerCase() === id?.toLowerCase()) || null;
  };

  /**
   * Mark single or all notifications as read
   */
  const markNotificationRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  return (
    <ComplaintContext.Provider
      value={{
        complaints,
        notifications,
        unreadNotificationCount: notifications.filter((n) => n.unread).length,
        addComplaint,
        getComplaintById,
        markNotificationRead,
        markAllNotificationsRead,
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
