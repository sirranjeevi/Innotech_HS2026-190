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
  Calendar,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useComplaints } from '../../context/ComplaintContext';
import CitizenLayout from '../../components/layout/CitizenLayout';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import ComplaintCard from '../../components/common/ComplaintCard';
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

export default function CitizenDashboard() {
  const { user } = useAuth();
  const { complaints } = useComplaints();
  const navigate = useNavigate();

  // Filter complaints filed ONLY by this specific citizen
  const citizenComplaints = complaints.filter((c) => isCitizenComplaint(c, user));

  // Metrics for this citizen
  const totalComplaints = citizenComplaints.length;
  const submittedCount = citizenComplaints.filter((c) => c.status === 'SUBMITTED').length;
  const inProgressCount = citizenComplaints.filter(
    (c) => c.status === 'IN_PROGRESS' || c.status === 'ACCEPTED' || c.status === 'ASSIGNED'
  ).length;
  const resolvedCount = citizenComplaints.filter((c) => c.status === 'RESOLVED').length;

  const recentComplaints = citizenComplaints.slice(0, 3);

  return (
    <CitizenLayout>
      <PageHeader
        title={`Welcome, ${user?.name || user?.username || 'Citizen'} 👋`}
        subtitle="Manage your reported civic concerns, follow municipal progress, and view verified resolution evidence."
        actions={
          <Link to="/citizen/report">
            <Button variant="accent" size="md" iconStart={<PlusCircle size={18} />}>
              Report Issue
            </Button>
          </Link>
        }
      />

      {/* 4 Metric Cards for this Citizen */}
      <div className="grid grid-cols-4 gap-4" style={{ marginBottom: '28px' }}>
        <Card style={{ padding: '20px' }}>
          <div className="flex items-center justify-between">
            <div>
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: '600' }}>
                Total Complaints
              </p>
              <h3 style={{ fontSize: '28px', fontWeight: '800', marginTop: '4px', color: 'var(--color-primary-900)' }}>
                {totalComplaints}
              </h3>
            </div>
            <div
              style={{
                width: '44px',
                height: '44px',
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
              <p style={{ fontSize: '13px', color: '#D97706', fontWeight: '600' }}>
                Submitted
              </p>
              <h3 style={{ fontSize: '28px', fontWeight: '800', marginTop: '4px', color: '#D97706' }}>
                {submittedCount}
              </h3>
            </div>
            <div
              style={{
                width: '44px',
                height: '44px',
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
              <p style={{ fontSize: '13px', color: '#0284C7', fontWeight: '600' }}>
                In Progress
              </p>
              <h3 style={{ fontSize: '28px', fontWeight: '800', marginTop: '4px', color: '#0284C7' }}>
                {inProgressCount}
              </h3>
            </div>
            <div
              style={{
                width: '44px',
                height: '44px',
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
              <p style={{ fontSize: '13px', color: '#16A34A', fontWeight: '600' }}>
                Resolved
              </p>
              <h3 style={{ fontSize: '28px', fontWeight: '800', marginTop: '4px', color: '#16A34A' }}>
                {resolvedCount}
              </h3>
            </div>
            <div
              style={{
                width: '44px',
                height: '44px',
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

      {/* Main Grid: Citizen's Own Recent Complaints */}
      <div className="grid grid-cols-3 gap-6">
        <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="flex items-center justify-between">
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--color-text-main)' }}>
              Recent Complaints
            </h3>
            {totalComplaints > 0 && (
              <Link
                to="/citizen/complaints"
                style={{
                  fontSize: '13px',
                  fontWeight: '700',
                  color: 'var(--color-primary-600)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                View All ({totalComplaints}) <ArrowRight size={14} />
              </Link>
            )}
          </div>

          {recentComplaints.length === 0 ? (
            <Card style={{ padding: '40px 20px' }}>
              <EmptyState
                title="You Haven't Filed Any Complaints Yet"
                description="Notice an issue in your neighborhood? Click below to file your first civic complaint."
                action={
                  <Link to="/citizen/report">
                    <Button variant="accent" size="sm" iconStart={<PlusCircle size={16} />}>
                      Report an Issue
                    </Button>
                  </Link>
                }
              />
            </Card>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {recentComplaints.map((item) => (
                <Card
                  key={item.id || item.complaintNumber}
                  interactive
                  onClick={() => navigate(`/citizen/complaints/${item.complaintNumber || item.id}`)}
                >
                  <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="complaint-id">#{item.complaintNumber || item.id}</span>
                        <h4 style={{ fontSize: '16.5px', fontWeight: '800', marginTop: '4px' }}>
                          {item.category} Issue
                        </h4>
                      </div>
                      <StatusBadge status={item.status} pulse={item.status === 'IN_PROGRESS'} />
                    </div>

                    <p style={{ fontSize: '13.5px', color: 'var(--color-text-muted)', lineClamp: 2 }}>
                      {item.description}
                    </p>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingTop: '10px',
                        borderTop: '1px solid var(--color-border-subtle)',
                        fontSize: '12.5px',
                        color: 'var(--color-text-muted)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={13} color="var(--color-accent-600)" />
                        <span>{item.address}</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={13} />
                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Right Col: Instant Reporting Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Card
            style={{
              padding: '24px',
              backgroundColor: 'var(--color-primary-900)',
              color: '#FFFFFF',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Sparkles size={20} color="var(--color-accent-400)" />
              <h4 style={{ fontSize: '17px', fontWeight: '800', color: '#FFFFFF' }}>
                Instant Civic Reporting
              </h4>
            </div>
            <p style={{ fontSize: '13.5px', color: '#E2E8F0', lineHeight: 1.5, marginBottom: '20px' }}>
              Spot garbage overflowing, dark street lights, road potholes, or water pipe leaks? Geotag and submit in seconds.
            </p>
            <Link to="/citizen/report">
              <Button
                variant="accent"
                fullWidth
                size="md"
                iconEnd={<ArrowRight size={16} />}
              >
                File New Complaint
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </CitizenLayout>
  );
}
