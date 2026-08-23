import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  UserCheck,
  ArrowRight,
  TrendingUp,
  MapPin,
  Building,
  Eye,
  Compass,
  Layers,
  Users,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useComplaints } from '../../context/ComplaintContext';
import AdminLayout from '../../components/layout/AdminLayout';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import Table from '../../components/common/Table';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { complaints, departments } = useComplaints();
  const navigate = useNavigate();

  // 6 Required Metric Counters
  const totalCount = complaints.length;
  const newCount = complaints.filter((c) => c.status === 'SUBMITTED').length;
  const verifiedCount = complaints.filter((c) => c.status === 'VERIFIED').length;
  const assignedCount = complaints.filter((c) => c.status === 'ASSIGNED').length;
  const inProgressCount = complaints.filter(
    (c) => c.status === 'IN_PROGRESS' || c.status === 'ACCEPTED'
  ).length;
  const resolvedCount = complaints.filter((c) => c.status === 'RESOLVED').length;

  const duplicateCount = complaints.filter((c) => c.isPossibleDuplicate).length;
  const recentComplaints = complaints.slice(0, 6);

  const columns = [
    {
      key: 'complaintNumber',
      header: 'Complaint ID',
      width: '160px',
      render: (val, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="complaint-id">#{val || row.id}</span>
          {row.isPossibleDuplicate && (
            <span
              style={{
                fontSize: '10px',
                fontWeight: '800',
                backgroundColor: '#FEF3C7',
                color: '#92400E',
                padding: '1px 5px',
                borderRadius: '4px',
                border: '1px solid #FDE68A',
              }}
            >
              ⚠️ Duplicate
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category / Citizen',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: '600', color: 'var(--color-text-main)' }}>{val}</div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
            Citizen: <strong>{row.citizenName || 'Resident'}</strong> • {row.address?.split(',')[0]}
          </div>
        </div>
      ),
    },
    {
      key: 'departmentName',
      header: 'Department',
      render: (val) => (
        <span style={{ fontSize: '13px', color: 'var(--color-primary-800)', fontWeight: '600' }}>
          {val || 'General Administration'}
        </span>
      ),
    },
    {
      key: 'workerName',
      header: 'Assigned Worker',
      render: (val) => (
        <span style={{ fontSize: '12.5px', color: val && val !== 'Unassigned' ? 'var(--color-text-main)' : '#94A3B8' }}>
          {val || 'Unassigned'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: '130px',
      render: (val) => <StatusBadge status={val} pulse={val === 'SUBMITTED' || val === 'IN_PROGRESS'} />,
    },
    {
      key: 'actions',
      header: 'Action',
      width: '110px',
      align: 'right',
      render: (_, row) => (
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/admin/complaints/${row.complaintNumber || row.id}`);
          }}
          iconStart={<Eye size={13} />}
        >
          Inspect
        </Button>
      ),
    },
  ];

  return (
    <AdminLayout>
      <PageHeader
        title="Municipal Operations Dashboard"
        subtitle={`Welcome, ${user?.name || 'Administrator'} • Centralized triage, departmental allocation, and real-time Firestore sync.`}
        badge={
          <span
            style={{
              fontSize: '12px',
              fontWeight: '700',
              padding: '4px 12px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: '#FEF3C7',
              color: '#92400E',
              border: '1px solid #FDE68A',
            }}
          >
            Municipal Admin Control
          </span>
        }
        actions={
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link to="/admin/map">
              <Button variant="outline" size="sm" iconStart={<Compass size={15} />}>
                City Map View
              </Button>
            </Link>
            <Link to="/admin/complaints">
              <Button variant="primary" size="sm" iconStart={<FileText size={15} />}>
                Manage Queue
              </Button>
            </Link>
          </div>
        }
      />

      {/* 6 Required Metric Cards Grid */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
          gap: '16px',
          marginBottom: '28px',
        }}
      >
        <Card style={{ padding: '18px' }}>
          <p style={{ fontSize: '12.5px', color: 'var(--color-text-muted)', fontWeight: '600' }}>
            Total Complaints
          </p>
          <h3 style={{ fontSize: '28px', fontWeight: '800', marginTop: '4px', color: 'var(--color-primary-900)' }}>
            {totalCount}
          </h3>
        </Card>

        <Card style={{ padding: '18px' }}>
          <p style={{ fontSize: '12.5px', color: '#D97706', fontWeight: '700' }}>
            New (Submitted)
          </p>
          <h3 style={{ fontSize: '28px', fontWeight: '800', marginTop: '4px', color: '#D97706' }}>
            {newCount}
          </h3>
        </Card>

        <Card style={{ padding: '18px' }}>
          <p style={{ fontSize: '12.5px', color: '#4F46E5', fontWeight: '700' }}>
            Verified
          </p>
          <h3 style={{ fontSize: '28px', fontWeight: '800', marginTop: '4px', color: '#4F46E5' }}>
            {verifiedCount}
          </h3>
        </Card>

        <Card style={{ padding: '18px' }}>
          <p style={{ fontSize: '12.5px', color: 'var(--color-primary-600)', fontWeight: '700' }}>
            Assigned
          </p>
          <h3 style={{ fontSize: '28px', fontWeight: '800', marginTop: '4px', color: 'var(--color-primary-700)' }}>
            {assignedCount}
          </h3>
        </Card>

        <Card style={{ padding: '18px' }}>
          <p style={{ fontSize: '12.5px', color: '#0284C7', fontWeight: '700' }}>
            In Progress
          </p>
          <h3 style={{ fontSize: '28px', fontWeight: '800', marginTop: '4px', color: '#0284C7' }}>
            {inProgressCount}
          </h3>
        </Card>

        <Card style={{ padding: '18px' }}>
          <p style={{ fontSize: '12.5px', color: '#16A34A', fontWeight: '700' }}>
            Resolved
          </p>
          <h3 style={{ fontSize: '28px', fontWeight: '800', marginTop: '4px', color: '#16A34A' }}>
            {resolvedCount}
          </h3>
        </Card>
      </div>

      {/* Main Grid: Master Queue Table & Department Workloads */}
      <div className="grid grid-cols-3 gap-6">
        <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Card
            header={
              <div className="flex items-center justify-between" style={{ width: '100%' }}>
                <h3 style={{ fontSize: '16.5px', fontWeight: '800' }}>Recent Master Queue Submissions</h3>
                <Link
                  to="/admin/complaints"
                  style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-primary-600)', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  View All ({totalCount}) <ArrowRight size={14} />
                </Link>
              </div>
            }
          >
            <Table
              columns={columns}
              data={recentComplaints}
              onRowClick={(row) => navigate(`/admin/complaints/${row.complaintNumber || row.id}`)}
            />
          </Card>
        </div>

        {/* Right Col: Quick Map Preview & Department breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Card
            style={{
              padding: '22px',
              backgroundColor: 'var(--color-primary-50)',
              borderColor: 'var(--color-primary-200)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Compass size={20} color="var(--color-primary-700)" />
              <h4 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--color-primary-950)' }}>
                Google Maps GIS Live Feed
              </h4>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: 1.5, marginBottom: '16px' }}>
              Interactive city map plotting all active grievances with GPS coordinate inspection.
            </p>
            <Link to="/admin/map">
              <Button variant="primary" fullWidth size="sm" iconEnd={<ArrowRight size={15} />}>
                Launch Map Viewer
              </Button>
            </Link>
          </Card>

          {/* Department Overview */}
          <Card
            header={
              <div className="flex items-center justify-between" style={{ width: '100%' }}>
                <span style={{ fontSize: '15px', fontWeight: '700' }}>Department Teams</span>
                <Link to="/admin/departments" style={{ fontSize: '12.5px', color: 'var(--color-primary-600)', fontWeight: '600' }}>
                  Manage
                </Link>
              </div>
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {departments.slice(0, 5).map((dept) => {
                const count = complaints.filter((c) => c.departmentId === dept.id || c.departmentName === dept.name).length;
                return (
                  <div
                    key={dept.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      backgroundColor: 'var(--color-bg-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '13px',
                    }}
                  >
                    <div style={{ fontWeight: '600', color: 'var(--color-text-main)' }}>{dept.name}</div>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: '700',
                        backgroundColor: count > 0 ? 'var(--color-primary-100)' : '#E2E8F0',
                        color: count > 0 ? 'var(--color-primary-800)' : '#64748B',
                        padding: '2px 8px',
                        borderRadius: '10px',
                      }}
                    >
                      {count} tasks
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
