import React from 'react';

/**
 * Reusable StatusBadge Component supporting Flutter-parity uppercase statuses
 * Supported statuses ONLY: SUBMITTED, VERIFIED, ASSIGNED, ACCEPTED, IN_PROGRESS, RESOLVED
 */
export default function StatusBadge({ status = 'SUBMITTED', pulse = false, className = '' }) {
  const normalizeStatus = (s) => {
    if (!s) return 'SUBMITTED';
    const clean = s.toString().toUpperCase().replace(/\s+/g, '_');
    if (clean === 'PENDING') return 'SUBMITTED';
    if (clean === 'UNDER_REVIEW') return 'VERIFIED';
    return clean;
  };

  const normalized = normalizeStatus(status);

  const getStatusStyles = () => {
    switch (normalized) {
      case 'SUBMITTED':
        return {
          bg: '#FEF3C7',
          text: '#92400E',
          border: '#FDE68A',
          dot: '#D97706',
          label: 'Submitted',
        };
      case 'VERIFIED':
        return {
          bg: '#E0E7FF',
          text: '#3730A3',
          border: '#C7D2FE',
          dot: '#4F46E5',
          label: 'Verified',
        };
      case 'ASSIGNED':
        return {
          bg: '#EFF6FF',
          text: '#1E40AF',
          border: '#BFDBFE',
          dot: '#2563EB',
          label: 'Assigned',
        };
      case 'ACCEPTED':
        return {
          bg: '#F0FDFA',
          text: '#115E59',
          border: '#CCFBF1',
          dot: '#0D9488',
          label: 'Accepted',
        };
      case 'IN_PROGRESS':
        return {
          bg: '#E0F2FE',
          text: '#075985',
          border: '#BAE6FD',
          dot: '#0284C7',
          label: 'In Progress',
        };
      case 'RESOLVED':
        return {
          bg: '#DCFCE7',
          text: '#166534',
          border: '#BBF7D0',
          dot: '#16A34A',
          label: 'Resolved',
        };
      default:
        return {
          bg: '#F1F5F9',
          text: '#475569',
          border: '#E2E8F0',
          dot: '#64748B',
          label: status,
        };
    }
  };

  const styleConfig = getStatusStyles();

  return (
    <span
      className={`status-badge ${className}`.trim()}
      style={{
        backgroundColor: styleConfig.bg,
        color: styleConfig.text,
        borderColor: styleConfig.border,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '3px 10px',
        borderRadius: 'var(--radius-full)',
        fontSize: '12px',
        fontWeight: '700',
        lineHeight: 1,
        border: `1px solid ${styleConfig.border}`,
      }}
    >
      <span
        className={`badge-dot ${pulse ? 'pulse-dot' : ''}`}
        style={{ backgroundColor: styleConfig.dot, width: '6px', height: '6px', borderRadius: '50%' }}
      />
      <span>{styleConfig.label}</span>
    </span>
  );
}
