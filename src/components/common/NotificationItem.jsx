import React from 'react';
import { Bell, CheckCircle2, MessageSquare, AlertCircle } from 'lucide-react';

/**
 * Reusable NotificationItem Component
 */
export default function NotificationItem({
  title,
  message,
  time,
  unread = false,
  type = 'info',
  onClick,
  className = '',
}) {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={16} color="#16A34A" />;
      case 'alert':
        return <AlertCircle size={16} color="#D97706" />;
      case 'comment':
        return <MessageSquare size={16} color="#2563EB" />;
      default:
        return <Bell size={16} color="#1E40AF" />;
    }
  };

  return (
    <div
      className={`notification-item ${unread ? 'unread' : ''} ${className}`.trim()}
      onClick={onClick}
      role="button"
      tabIndex={0}
    >
      <div className="notification-icon-wrap">{getIcon()}</div>
      
      <div className="notification-body">
        <h5 className="notification-title">{title}</h5>
        {message && <p className="notification-message">{message}</p>}
        {time && <span className="notification-time">{time}</span>}
      </div>

      {unread && <div className="notification-dot" title="Unread notification" />}
    </div>
  );
}
