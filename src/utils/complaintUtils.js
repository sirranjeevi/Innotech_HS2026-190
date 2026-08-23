/**
 * Complaint Lifecycle & Filtering Utilities
 */

import {
  COMPLAINT_STATUS,
  ALLOWED_STATUS_TRANSITIONS,
  LIFECYCLE_STAGES,
  STATUS_METADATA,
} from '../constants';

/**
 * Validates if moving from currentStatus to targetStatus is valid
 * according to the strict 6-stage lifecycle.
 * 
 * @param {string} currentStatus 
 * @param {string} targetStatus 
 * @returns {boolean}
 */
export const isValidStatusTransition = (currentStatus, targetStatus) => {
  const allowed = ALLOWED_STATUS_TRANSITIONS[currentStatus];
  if (!allowed) return false;
  return allowed.includes(targetStatus);
};

/**
 * Gets index position (0-5) in the 6-stage resolution lifecycle
 * @param {string} status 
 * @returns {number}
 */
export const getLifecycleStageIndex = (status) => {
  const idx = LIFECYCLE_STAGES.indexOf(status);
  return idx >= 0 ? idx : 0;
};

/**
 * Returns display metadata (label, colors) for a status code
 * @param {string} status 
 * @returns {Object}
 */
export const getStatusDisplay = (status) => {
  return (
    STATUS_METADATA[status] || {
      label: status || 'Unknown',
      color: '#475569',
      bgColor: '#F1F5F9',
      borderColor: '#E2E8F0',
      description: '',
    }
  );
};

/**
 * Checks if a complaint was filed by the specified citizen user
 * @param {Object} complaint 
 * @param {Object} user 
 * @returns {boolean}
 */
export const isComplaintOwner = (complaint, user) => {
  if (!complaint || !user) return false;
  if (complaint.citizenId && user.id && complaint.citizenId === user.id) return true;
  if (user.username && complaint.citizenName?.toLowerCase() === user.username.toLowerCase()) return true;
  if (user.name && complaint.citizenName?.toLowerCase() === user.name.toLowerCase()) return true;
  if (user.email && complaint.citizenEmail?.toLowerCase() === user.email.toLowerCase()) return true;
  if (user.phone && complaint.citizenPhone && complaint.citizenPhone === user.phone) return true;
  return false;
};
