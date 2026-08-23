/**
 * Centralized Application Constants
 * 
 * Defines immutable user roles, complaint statuses, categories,
 * and the strict 6-stage municipal resolution lifecycle.
 */

// User Roles
export const USER_ROLES = Object.freeze({
  CITIZEN: 'citizen',
  ADMIN: 'admin',
  WORKER: 'worker',
});

// Allowed 6-Stage Complaint Lifecycle Statuses
export const COMPLAINT_STATUS = Object.freeze({
  SUBMITTED: 'SUBMITTED',
  VERIFIED: 'VERIFIED',
  ASSIGNED: 'ASSIGNED',
  ACCEPTED: 'ACCEPTED',
  IN_PROGRESS: 'IN_PROGRESS',
  RESOLVED: 'RESOLVED',
});

// Strict Lifecycle Progression Order
export const LIFECYCLE_STAGES = Object.freeze([
  COMPLAINT_STATUS.SUBMITTED,
  COMPLAINT_STATUS.VERIFIED,
  COMPLAINT_STATUS.ASSIGNED,
  COMPLAINT_STATUS.ACCEPTED,
  COMPLAINT_STATUS.IN_PROGRESS,
  COMPLAINT_STATUS.RESOLVED,
]);

// Valid Next Status Transitions
export const ALLOWED_STATUS_TRANSITIONS = Object.freeze({
  [COMPLAINT_STATUS.SUBMITTED]: [COMPLAINT_STATUS.VERIFIED],
  [COMPLAINT_STATUS.VERIFIED]: [COMPLAINT_STATUS.ASSIGNED],
  [COMPLAINT_STATUS.ASSIGNED]: [COMPLAINT_STATUS.ACCEPTED],
  [COMPLAINT_STATUS.ACCEPTED]: [COMPLAINT_STATUS.IN_PROGRESS],
  [COMPLAINT_STATUS.IN_PROGRESS]: [COMPLAINT_STATUS.RESOLVED],
  [COMPLAINT_STATUS.RESOLVED]: [],
});

// Civic Complaint Categories
export const COMPLAINT_CATEGORIES = Object.freeze([
  'Garbage',
  'Pothole',
  'Street Light',
  'Water Leakage',
  'Drainage',
  'Public Infrastructure',
  'Other',
]);

// Category to Department ID Mapping
export const CATEGORY_DEPARTMENT_MAP = Object.freeze({
  Garbage: 'dept-01', // Solid Waste Management
  Pothole: 'dept-02', // Roads & Infrastructure
  'Street Light': 'dept-03', // Electrical & Street Lighting
  'Water Leakage': 'dept-04', // Water Supply & Sewerage
  Drainage: 'dept-05', // Stormwater & Drainage
  'Public Infrastructure': 'dept-06', // Town Planning & Maintenance
  Other: 'dept-06',
});

// Status Badge Display Metadata
export const STATUS_METADATA = Object.freeze({
  [COMPLAINT_STATUS.SUBMITTED]: {
    label: 'Submitted',
    color: '#D97706',
    bgColor: '#FEF3C7',
    borderColor: '#FDE68A',
    description: 'Complaint registered and awaiting admin verification.',
  },
  [COMPLAINT_STATUS.VERIFIED]: {
    label: 'Verified',
    color: '#4338CA',
    bgColor: '#E0E7FF',
    borderColor: '#C7D2FE',
    description: 'Complaint verified by administrative review team.',
  },
  [COMPLAINT_STATUS.ASSIGNED]: {
    label: 'Assigned',
    color: '#0284C7',
    bgColor: '#E0F2FE',
    borderColor: '#BAE6FD',
    description: 'Assigned to municipal department and field workforce.',
  },
  [COMPLAINT_STATUS.ACCEPTED]: {
    label: 'Accepted',
    color: '#0D9488',
    bgColor: '#CCFBF1',
    borderColor: '#99F6E4',
    description: 'Task accepted by assigned field technician.',
  },
  [COMPLAINT_STATUS.IN_PROGRESS]: {
    label: 'In Progress',
    color: '#2563EB',
    bgColor: '#DBEAFE',
    borderColor: '#BFDBFE',
    description: 'Field repair team active on site.',
  },
  [COMPLAINT_STATUS.RESOLVED]: {
    label: 'Resolved',
    color: '#16A34A',
    bgColor: '#DCFCE7',
    borderColor: '#BBF7D0',
    description: 'Resolution completed with photographic evidence verified.',
  },
});
