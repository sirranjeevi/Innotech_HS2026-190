import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Bell, CheckCheck, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useComplaints } from '../../context/ComplaintContext';
import AdminLayout from '../../components/layout/AdminLayout';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import NotificationItem from '../../components/common/NotificationItem';
import EmptyState from '../../components/common/EmptyState';

export default function AdminNotifications() {
  const { adminNotifications, markAllAdminNotificationsRead } = useComplaints();
  const navigate = useNavigate();

  const unreadCount = adminNotifications.filter((n) => n.unread).length;

  return (
    <AdminLayout>
      <PageHeader
        title="Municipal Alerts & Activity Log"
        subtitle="System logs, new citizen filings, and resolution verifications requiring oversight."
        actions={
          unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              iconStart={<CheckCheck size={16} />}
              onClick={markAllAdminNotificationsRead}
            >
              Mark All as Read
            </Button>
          )
        }
      />

      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {adminNotifications.length === 0 ? (
          <Card style={{ padding: '40px 20px' }}>
            <EmptyState
              title="No Admin Alerts"
              description="All municipal activity has been cleared and reviewed."
              icon={<Bell size={32} />}
            />
          </Card>
        ) : (
          <Card style={{ padding: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {adminNotifications.map((n) => (
                <NotificationItem
                  key={n.id}
                  title={n.title}
                  message={n.message}
                  time={n.time}
                  unread={n.unread}
                  type={n.type}
                  onClick={() => {
                    if (n.complaintId) {
                      navigate(`/admin/complaints/${n.complaintId}`);
                    }
                  }}
                />
              ))}
            </div>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
