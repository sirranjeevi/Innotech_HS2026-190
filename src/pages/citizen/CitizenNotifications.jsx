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
import { useAuth } from '../../context/AuthContext';
import { useComplaints } from '../../context/ComplaintContext';
import CitizenLayout from '../../components/layout/CitizenLayout';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import NotificationItem from '../../components/common/NotificationItem';
import EmptyState from '../../components/common/EmptyState';

// Helper to filter complaints belonging to this citizen
function isCitizenComplaint(c, user) {
  if (!user) return false;
  if (c.citizenId && user.id && c.citizenId === user.id) return true;
  if (user.username && c.citizenName?.toLowerCase() === user.username.toLowerCase()) return true;
  if (user.name && c.citizenName?.toLowerCase() === user.name.toLowerCase()) return true;
  if (user.email && c.citizenEmail?.toLowerCase() === user.email.toLowerCase()) return true;
  if (user.phone && c.citizenPhone && c.citizenPhone === user.phone) return true;
  return false;
}

export default function CitizenNotifications() {
  const { user } = useAuth();
  const { complaints, notifications, markAllNotificationsRead } = useComplaints();
  const navigate = useNavigate();

  // Find all complaint numbers filed by this particular citizen
  const citizenComplaints = complaints.filter((c) => isCitizenComplaint(c, user));
  const citizenComplaintNumbers = new Set(
    citizenComplaints.map((c) => (c.complaintNumber || c.id || '').toUpperCase())
  );

  // Filter notifications belonging ONLY to this particular citizen's complaints
  const citizenNotifications = notifications.filter((n) => {
    // Direct user ID / username match
    if (n.userId && user && (n.userId === user.id || n.userId === user.username)) return true;

    // Complaint match
    if (n.complaintId && citizenComplaintNumbers.has(n.complaintId.toUpperCase())) return true;

    return false;
  });

  const unreadCount = citizenNotifications.filter((n) => !n.isRead).length;

  return (
    <CitizenLayout>
      <PageHeader
        title="My Notifications & Updates"
        subtitle="Live status alerts, field team dispatches, and resolution confirmations for your reported grievances."
        breadcrumbs={
          <Link
            to="/citizen/dashboard"
            style={{ fontSize: '13px', color: 'var(--color-primary-600)', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </Link>
        }
        actions={
          unreadCount > 0 && (
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
        {citizenNotifications.length === 0 ? (
          <Card style={{ padding: '40px 20px' }}>
            <EmptyState
              title="No Notifications For Your Grievances"
              description="You have no notifications or activity alerts for your reported issues at this time."
              icon={<Bell size={32} />}
            />
          </Card>
        ) : (
          <Card style={{ padding: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {citizenNotifications.map((n) => (
                <NotificationItem
                  key={n.id}
                  title={n.title}
                  message={n.message}
                  time={n.createdAt ? new Date(n.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : n.time}
                  unread={!n.isRead}
                  type={n.type || (n.title.includes('Resolved') ? 'success' : 'info')}
                  onClick={() => {
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
