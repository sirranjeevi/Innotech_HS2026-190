import React from 'react';

/**
 * Reusable StatusBadge Component
 * Supported statuses: submitted, pending, under_review, in_progress, assigned, resolved, rejected
 */
export default function StatusBadge({ status = 'submitted', pulse = false, className = '' }) {
  const normalizeStatus = (s) => {
    if (!s) return 'submitted';
    const clean = s.toString().toLowerCase().replace(/\s+/g, '_');
    if (clean === 'pending') return 'submitted';
    if (clean === 'review') return 'under_review';
    if (clean === 'assigned') return 'in_progress';
    return clean;
  };

  const normalized = normalizeStatus(status);

  const labels = {
    submitted: 'Submitted',
    under_review: 'Under Review',
    in_progress: 'In Progress',
    resolved: 'Resolved',
    rejected: 'Rejected',
  };

  const displayLabel = labels[normalized] || status;
  const statusClass = `status-${normalized}`;

  return (
    <span className={`status-badge ${statusClass} ${className}`.trim()}>
      <span className={`badge-dot ${pulse ? 'pulse-dot' : ''}`} />
      <span>{displayLabel}</span>
    </span>
  );
}
