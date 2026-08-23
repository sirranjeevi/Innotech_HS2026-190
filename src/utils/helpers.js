/**
 * General Helper Utilities
 */

/**
 * Format ISO date string into readable user format
 * @param {string|number|Date} dateVal 
 * @param {boolean} includeTime 
 * @returns {string}
 */
export const formatDate = (dateVal, includeTime = false) => {
  if (!dateVal) return 'N/A';
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return String(dateVal);
    
    if (includeTime) {
      return d.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }

    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return String(dateVal);
  }
};

/**
 * Truncate long strings safely
 * @param {string} str 
 * @param {number} maxLen 
 * @returns {string}
 */
export const truncateText = (str, maxLen = 60) => {
  if (!str) return '';
  if (str.length <= maxLen) return str;
  return `${str.substring(0, maxLen).trim()}...`;
};

/**
 * Format coordinates for display
 * @param {number} lat 
 * @param {number} lng 
 * @returns {string}
 */
export const formatCoordinates = (lat, lng) => {
  if (lat === undefined || lng === undefined) return 'Coordinates not set';
  const numLat = Number(lat);
  const numLng = Number(lng);
  if (isNaN(numLat) || isNaN(numLng)) return 'Coordinates not set';
  return `${numLat.toFixed(5)}, ${numLng.toFixed(5)}`;
};
