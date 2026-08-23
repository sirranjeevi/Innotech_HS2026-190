import React from 'react';
import { Calendar, MapPin, Tag, ArrowRight } from 'lucide-react';
import StatusBadge from './StatusBadge';

/**
 * Reusable ComplaintCard Component
 * Displays complaint information without priority, critical, or severity indicators.
 */
export default function ComplaintCard({
  id,
  title,
  description,
  category,
  status = 'submitted',
  createdAt,
  location,
  onClick,
  className = '',
}) {
  return (
    <div
      className={`complaint-card ${className}`.trim()}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="complaint-card-header">
        <div>
          {id && <span className="complaint-id">#{id}</span>}
          <h4 className="complaint-title">{title}</h4>
        </div>
        <StatusBadge status={status} />
      </div>

      {description && <p className="complaint-desc">{description}</p>}

      <div className="complaint-meta">
        {category && (
          <div className="complaint-meta-item">
            <Tag size={13} color="var(--color-primary-600)" />
            <span>{category}</span>
          </div>
        )}
        {location && (
          <div className="complaint-meta-item">
            <MapPin size={13} color="var(--color-accent-600)" />
            <span>{location}</span>
          </div>
        )}
        {createdAt && (
          <div className="complaint-meta-item">
            <Calendar size={13} color="var(--color-text-subtle)" />
            <span>{createdAt}</span>
          </div>
        )}
      </div>

      {onClick && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
          <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-primary-600)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            View Details <ArrowRight size={14} />
          </span>
        </div>
      )}
    </div>
  );
}
