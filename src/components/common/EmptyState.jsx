import React from 'react';
import { Inbox } from 'lucide-react';

/**
 * Reusable EmptyState Component
 */
export default function EmptyState({
  title = 'No Records Found',
  description = 'There are no items to display at this time.',
  icon = <Inbox size={32} />,
  action = null,
  className = '',
}) {
  return (
    <div className={`empty-state ${className}`.trim()}>
      <div className="empty-state-icon">{icon}</div>
      <h4 className="empty-state-title">{title}</h4>
      <p className="empty-state-desc">{description}</p>
      {action && <div className="empty-state-action">{action}</div>}
    </div>
  );
}
