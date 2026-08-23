import React from 'react';
import { Clock, CheckCircle2, AlertCircle, FileText, UserCheck } from 'lucide-react';

/**
 * Reusable Timeline Component for lifecycle and audit events
 */
export default function Timeline({ items = [], className = '' }) {
  if (!items || items.length === 0) {
    return <p className="form-helper">No timeline updates recorded.</p>;
  }

  const getDefaultIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'resolved':
        return <CheckCircle2 size={16} color="#16A34A" />;
      case 'in_progress':
        return <UserCheck size={16} color="#0284C7" />;
      case 'rejected':
        return <AlertCircle size={16} color="#DC2626" />;
      case 'under_review':
        return <Clock size={16} color="#4F46E5" />;
      default:
        return <FileText size={16} color="#2563EB" />;
    }
  };

  return (
    <div className={`timeline ${className}`.trim()}>
      {items.map((item, index) => (
        <div key={item.id || index} className="timeline-item">
          <div className="timeline-line" />
          <div className="timeline-icon-wrap">
            {item.icon || getDefaultIcon(item.status)}
          </div>
          <div className="timeline-content">
            <div className="flex items-center justify-between">
              <h5 className="timeline-title">{item.title}</h5>
              {item.time && <span className="timeline-time">{item.time}</span>}
            </div>
            {item.author && (
              <p style={{ fontSize: '12px', color: 'var(--color-primary-700)', fontWeight: '600', marginBottom: '4px' }}>
                By: {item.author}
              </p>
            )}
            {item.description && <div className="timeline-desc">{item.description}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}
