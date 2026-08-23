import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  PlusCircle,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  MapPin,
  Bell,
  Sparkles,
  Inbox
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useComplaints } from '../../context/ComplaintContext';
import CitizenLayout from '../../components/layout/CitizenLayout';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import ComplaintCard from '../../components/common/ComplaintCard';
import NotificationItem from '../../components/common/NotificationItem';
import EmptyState from '../../components/common/EmptyState';

export default function CitizenDashboard() {
  const { user } = useAuth();
  const { complaints, notifications } = useComplaints();
  const navigate = useNavigate();

  // Filter complaints for current citizen or show all seeded citizen grievances
  const citizenComplaints = complaints.filter(
    (c) => !c.citizenId || c.citizenId === user?.id || c.citizenName === user?.name || user?.role === 'citizen'
  );

  // Status Metrics
  const totalCount = citizenComplaints.length;
  const submittedCount = citizenComplaints.filter((c) => c.status?.toLowerCase() === 'submitted').length;
  const inProgressCount = citizenComplaints.filter((c) => c.status?.toLowerCase() === 'in progress' || c.status?.toLowerCase() === 'in_progress').length;
  const resolvedCount = citizenComplaints.filter((c) => c.status?.toLowerCase() === 'resolved').length;

  const recentComplaints = citizenComplaints.slice(0, 4);

  return (
    <CitizenLayout>
      <PageHeader
        title={`Welcome back, ${user?.name || user?.username || 'Citizen'}!`}
        subtitle="Track your reported municipal grievances and report new community issues in real-time."
        actions={
          <Link to="/citizen/report">
            <Button
              variant="accent"
              size="md"
              iconStart={<PlusCircle size={18} />}
            >
              Report Issue
            </Button>
          </Link>
        }
      />

      {/* 4 Quick Stat Summary Cards */}
      <div className="grid grid-cols-4 gap-4" style={{ marginBottom: '28px' }}>
        <Card style={{ padding: '20px' }}>
          <div className="flex items-center justify-between">
            <div>
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: '600' }}>
                Total Complaints
              </p>
              <h3 style={{ fontSize: '28px', fontWeight: '800', marginTop: '4px', color: 'var(--color-primary-900)' }}>
                {totalCount}
              </h3>
            </div>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-primary-100)',
                color: 'var(--color-primary-700)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FileText size={22} />
            </div>
          </div>
        </Card>

        <Card style={{ padding: '20px' }}>
          <div className="flex items-center justify-between">
            <div>
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: '600' }}>
                Submitted
              </p>
              <h3 style={{ fontSize: '28px', fontWeight: '800', marginTop: '4px', color: '#D97706' }}>
                {submittedCount}
              </h3>
            </div>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-status-submitted-bg)',
                color: '#D97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Clock size={22} />
            </div>
          </div>
        </Card>

        <Card style={{ padding: '20px' }}>
          <div className="flex items-center justify-between">
            <div>
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: '600' }}>
                In Progress
              </p>
              <h3 style={{ fontSize: '28px', fontWeight: '800', marginTop: '4px', color: '#0284C7' }}>
                {inProgressCount}
              </h3>
            </div>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-status-progress-bg)',
                color: '#0284C7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <TrendingUp size={22} />
            </div>
          </div>
        </Card>

        <Card style={{ padding: '20px' }}>
          <div className="flex items-center justify-between">
            <div>
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: '600' }}>
                Resolved
              </p>
              <h3 style={{ fontSize: '28px', fontWeight: '800', marginTop: '4px', color: '#16A34A' }}>
                {resolvedCount}
              </h3>
            </div>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-status-resolved-bg)',
                color: '#16A34A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckCircle2 size={22} />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Grid: Recent Complaints + Quick Actions */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Complaints */}
        <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="flex items-center justify-between">
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--color-text-main)' }}>
              Recent Complaints
            </h3>
            <Link
              to="/citizen/complaints"
              style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--color-primary-600)', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              View All ({totalCount}) <ArrowRight size={15} />
            </Link>
          </div>

          {recentComplaints.length === 0 ? (
            <EmptyState
              title="No Complaints Lodged Yet"
              description="You have not filed any civic grievances yet. Click below to lodge your first issue."
              action={
                <Link to="/citizen/report">
                  <Button variant="accent" size="sm" iconStart={<PlusCircle size={15} />}>
                    Report Issue Now
                  </Button>
                </Link>
              }
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {recentComplaints.map((c) => (
                <ComplaintCard
                  key={c.id}
                  id={c.id}
                  title={c.title}
                  description={c.description}
                  category={c.category}
                  status={c.status}
                  location={c.address || c.location}
                  createdAt={new Date(c.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                  onClick={() => navigate(`/citizen/complaints/${c.id}`)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Col: Quick Report Banner & Recent Alerts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Action Promo Card */}
          <Card
            style={{
              padding: '24px',
              backgroundColor: 'var(--color-primary-50)',
              borderColor: 'var(--color-primary-200)',
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-accent-600)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '14px',
                boxShadow: '0 4px 10px rgba(13, 148, 136, 0.3)',
              }}
            >
              <PlusCircle size={24} />
            </div>

            <h4 style={{ fontSize: '17px', fontWeight: '800', color: 'var(--color-primary-950)', marginBottom: '6px' }}>
              Spot a civic issue?
            </h4>

            <p style={{ fontSize: '13.5px', color: 'var(--color-text-muted)', lineHeight: 1.5, marginBottom: '18px' }}>
              Report broken streetlights, water leaks, or road craters directly to municipal authorities with geotagged evidence.
            </p>

            <Link to="/citizen/report">
              <Button variant="accent" fullWidth iconEnd={<ArrowRight size={16} />}>
                Report Issue
              </Button>
            </Link>
          </Card>

          {/* Recent Alerts Card */}
          <Card
            header={
              <div className="flex items-center justify-between" style={{ width: '100%' }}>
                <span style={{ fontSize: '15px', fontWeight: '700' }}>Recent Updates</span>
                <Link to="/citizen/notifications" style={{ fontSize: '12.5px', color: 'var(--color-primary-600)', fontWeight: '600' }}>
                  See all
                </Link>
              </div>
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {notifications.slice(0, 3).map((n) => (
                <NotificationItem
                  key={n.id}
                  title={n.title}
                  message={n.message}
                  time={n.time}
                  unread={n.unread}
                  type={n.type}
                  onClick={() => {
                    if (n.complaintId) navigate(`/citizen/complaints/${n.complaintId}`);
                  }}
                />
              ))}
            </div>
          </Card>
        </div>
      </div>
    </CitizenLayout>
  );
}
