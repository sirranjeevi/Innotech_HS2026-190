import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Bell, CheckCheck, ArrowLeft } from 'lucide-react';
import { useComplaints } from '../../context/ComplaintContext';
import WorkerLayout from '../../components/layout/WorkerLayout';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import NotificationItem from '../../components/common/NotificationItem';
import EmptyState from '../../components/common/EmptyState';

export default function WorkerNotifications() {
  const { workerNotifications, markAllWorkerNotificationsRead } = useComplaints();
  const navigate = useNavigate();

  const unreadCount = workerNotifications.filter((n) => n.unread).length;

  return (
    <WorkerLayout>
      <PageHeader
        title="Field Dispatch & Work Orders Alerts"
        subtitle="Work orders assigned to you, priority updates, and supervisor instructions."
        actions={
          unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              iconStart={<CheckCheck size={16} />}
              onClick={markAllWorkerNotificationsRead}
            >
              Mark All as Read
            </Button>
          )
        }
      />

      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {workerNotifications.length === 0 ? (
          <Card style={{ padding: '40px 20px' }}>
            <EmptyState
              title="No Dispatch Alerts"
              description="You have no unread field work notices at this time."
              icon={<Bell size={32} />}
            />
          </Card>
        ) : (
          <Card style={{ padding: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {workerNotifications.map((n) => (
                <NotificationItem
                  key={n.id}
                  title={n.title}
                  message={n.message}
                  time={n.time}
                  unread={n.unread}
                  type={n.type}
                  onClick={() => {
                    if (n.complaintId) {
                      navigate(`/worker/tasks/${n.complaintId}`);
                    }
                  }}
                />
              ))}
            </div>
          </Card>
        )}
      </div>
    </WorkerLayout>
  );
}
