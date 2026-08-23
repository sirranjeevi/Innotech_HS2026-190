/**
 * Civic Duplicate Grievance Detection Utilities
 * 
 * Computes spatial proximity (Haversine formula) and semantic
 * description overlap to flag potential duplicate municipal issues.
 */

/**
 * Calculates great-circle distance between two GPS coordinates in meters
 * @param {number} lat1 
 * @param {number} lon1 
 * @param {number} lat2 
 * @param {number} lon2 
 * @returns {number} Distance in meters
 */
export const calculateHaversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth's radius in meters
  const toRad = (deg) => (deg * Math.PI) / 180;

  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lon2 - lon1);

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

/**
 * Calculates Jaccard word-level similarity between two text descriptions
 * @param {string} textA 
 * @param {string} textB 
 * @returns {number} Similarity score between 0.0 and 1.0
 */
export const calculateTextSimilarity = (textA = '', textB = '') => {
  const tokenize = (str) =>
    new Set(
      str
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .filter((word) => word.length > 2)
    );

  const setA = tokenize(textA);
  const setB = tokenize(textB);

  if (setA.size === 0 || setB.size === 0) return 0;

  const intersection = new Set([...setA].filter((x) => setB.has(x)));
  const union = new Set([...setA, ...setB]);

  return intersection.size / union.size;
};

/**
 * Evaluates whether a new complaint is a duplicate of any active existing complaint
 * Criteria: Same category + within 150m proximity + similar description
 * 
 * @param {Object} newComplaint 
 * @param {Array} existingComplaints 
 * @param {number} maxDistanceMeters 
 * @returns {Object|null} Matching duplicate complaint with distance info, or null
 */
export const findDuplicateComplaint = (
  newComplaint,
  existingComplaints = [],
  maxDistanceMeters = 150
) => {
  if (!newComplaint || !existingComplaints.length) return null;

  for (const existing of existingComplaints) {
    // Only compare unresolved grievances in the same category
    if (existing.status === 'RESOLVED') continue;
    if (existing.category !== newComplaint.category) continue;

    // Check GPS proximity if both have valid coordinates
    if (
      newComplaint.latitude &&
      newComplaint.longitude &&
      existing.latitude &&
      existing.longitude
    ) {
      const distance = calculateHaversineDistance(
        Number(newComplaint.latitude),
        Number(newComplaint.longitude),
        Number(existing.latitude),
        Number(existing.longitude)
      );

      if (distance <= maxDistanceMeters) {
        return {
          ...existing,
          matchType: 'GEOSPATIAL_PROXIMITY',
          distanceMeters: Math.round(distance),
        };
      }
    }

    // Check description similarity
    const similarity = calculateTextSimilarity(
      newComplaint.description,
      existing.description
    );

    if (similarity >= 0.4) {
      return {
        ...existing,
        matchType: 'DESCRIPTION_SIMILARITY',
        similarityScore: similarity,
      };
    }
  }

  return null;
};
