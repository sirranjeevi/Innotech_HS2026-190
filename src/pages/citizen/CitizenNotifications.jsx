import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  ArrowLeft,
  ArrowRight,
  Info,
  CheckCircle2,
  Inbox
} from 'lucide-react';
import { useComplaints } from '../../context/ComplaintContext';
import CitizenLayout from '../../components/layout/CitizenLayout';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import NotificationItem from '../../components/common/NotificationItem';
import EmptyState from '../../components/common/EmptyState';

export default function CitizenNotifications() {
  const { notifications, unreadNotificationCount, markNotificationRead, markAllNotificationsRead } = useComplaints();
  const navigate = useNavigate();

  return (
    <CitizenLayout>
      <PageHeader
        title="Notifications & Updates"
        subtitle="Live status alerts, field team dispatches, and resolution confirmations."
        breadcrumbs={
          <Link
            to="/citizen/dashboard"
            style={{ fontSize: '13px', color: 'var(--color-primary-600)', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </Link>
        }
        actions={
          unreadNotificationCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              iconStart={<CheckCheck size={16} />}
              onClick={markAllNotificationsRead}
            >
              Mark All as Read
            </Button>
          )
        }
      />

      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {notifications.length === 0 ? (
          <Card style={{ padding: '40px 20px' }}>
            <EmptyState
              title="No Notifications"
              description="You have no notifications or activity alerts at this time."
              icon={<Bell size={32} />}
            />
          </Card>
        ) : (
          <Card style={{ padding: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {notifications.map((n) => (
                <NotificationItem
                  key={n.id}
                  title={n.title}
                  message={n.message}
                  time={n.time}
                  unread={n.unread}
                  type={n.type}
                  onClick={() => {
                    markNotificationRead(n.id);
                    if (n.complaintId) {
                      navigate(`/citizen/complaints/${n.complaintId}`);
                    }
                  }}
                />
              ))}
            </div>
          </Card>
        )}
      </div>
    </CitizenLayout>
  );
}
