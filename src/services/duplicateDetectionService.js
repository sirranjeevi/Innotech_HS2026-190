/**
 * Duplicate Grievance Detection Service
 * 
 * Identifies potential duplicate municipal issues before writing to database.
 */

import { findDuplicateComplaint } from '../utils/duplicateDetection';

/**
 * Checks if a proposed complaint has a duplicate in active complaint records
 * @param {Object} complaintData 
 * @param {Array} existingComplaints 
 * @param {number} radiusMeters 
 * @returns {Object|null}
 */
export const checkDuplicateComplaint = (
  complaintData,
  existingComplaints = [],
  radiusMeters = 150
) => {
  try {
    return findDuplicateComplaint(complaintData, existingComplaints, radiusMeters);
  } catch (error) {
    console.warn('Duplicate detection check bypassed due to error:', error);
    return null;
  }
};
