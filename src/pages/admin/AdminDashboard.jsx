import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import Timeline from '../../components/common/Timeline';
import {
  ShieldCheck,
  Users,
  FileCheck2,
  Clock,
  Eye,
  Info,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  // Sample admin grievance records for route testing (strictly NO priority/severity)
  const municipalComplaints = [
    {
      id: 'CMP-2026-8941',
      citizen: 'Ananya Sharma',
      title: 'Pothole repair required on 4th Main Crossroad',
      category: 'Roads & Infrastructure',
      ward: 'Ward 12 (North)',
      assignedWorker: 'Rajesh Kumar (Field Tech)',
      status: 'in_progress',
      createdAt: 'Aug 22, 2026',
      description: 'Crater on tarmac causing vehicular traffic congestion.',
      timeline: [
        {
          title: 'Citizen Submission',
          time: 'Aug 22, 09:00 AM',
          author: 'Ananya Sharma',
          description: 'Lodge with GPS marker and road description.',
          status: 'submitted',
        },
        {
          title: 'Admin Triage & Assignment',
          time: 'Aug 22, 10:15 AM',
          author: 'Admin Officer',
          description: 'Assigned to North Ward Asphalt Division.',
          status: 'under_review',
        },
        {
          title: 'Dispatched to Field',
          time: 'Aug 22, 11:30 AM',
          author: 'Rajesh Kumar',
          description: 'Equipment mobilized.',
          status: 'in_progress',
        },
      ],
    },
    {
      id: 'CMP-2026-8942',
      citizen: 'Ramesh Patel',
      title: 'Garbage dump clearance near Community Centre',
      category: 'Sanitation & Waste',
      ward: 'Ward 08 (East)',
      assignedWorker: 'Sanitation Squad B',
      status: 'under_review',
      createdAt: 'Aug 23, 2026',
      description: 'Accumulation of garden waste and dry refuse.',
      timeline: [
        {
          title: 'Citizen Submission',
          time: 'Aug 23, 07:45 AM',
          author: 'Ramesh Patel',
          description: 'Lodge with photo attachment.',
          status: 'submitted',
        },
      ],
    },
    {
      id: 'CMP-2026-8930',
      citizen: 'Sunita Rao',
      title: 'Water pipe leak near Sector 4 reservoir',
      category: 'Water Supply',
      ward: 'Ward 04 (Central)',
      assignedWorker: 'Plumbing Crew 3',
      status: 'resolved',
      createdAt: 'Aug 21, 2026',
      description: 'Main joint leakage sealed and pressure restored.',
      timeline: [
        {
          title: 'Resolution Completed',
          time: 'Aug 21, 04:30 PM',
          author: 'Plumbing Crew 3',
          description: 'Replaced rubber gasket and reinforced pipe clamp.',
          status: 'resolved',
        },
      ],
    },
  ];

  const adminColumns = [
    {
      key: 'id',
      header: 'Tracking ID',
      render: (val) => <span className="complaint-id">#{val}</span>,
    },
    {
      key: 'title',
      header: 'Complaint & Ward',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: '600', color: 'var(--color-text-main)' }}>{val}</div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
            Citizen: {row.citizen} • {row.ward}
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
    },
    {
      key: 'assignedWorker',
      header: 'Assigned Unit',
      render: (val) => (
        <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--color-primary-800)' }}>
          {val || 'Unassigned'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (val) => <StatusBadge status={val} pulse={val === 'in_progress'} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_, row) => (
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedComplaint(row);
          }}
          iconStart={<Eye size={13} />}
        >
          Review
        </Button>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title="Municipal Administration Portal"
        subtitle={`Administrative dashboard active for ${user?.name || user?.username}. Oversee municipal resolution workflows.`}
        badge={
          <span
            style={{
              fontSize: '12px',
              fontWeight: '700',
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: '#FEF3C7',
              color: '#92400E',
              border: '1px solid #FDE68A',
            }}
          >
            Admin Level Access
          </span>
        }
      />

      {/* Part 1 Info Banner */}
      <div
        style={{
          padding: '14px 18px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: '#EFF6FF',
          border: '1px solid #BFDBFE',
          color: '#1E3A8A',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '24px',
          fontSize: '13.5px',
        }}
      >
        <Info size={20} color="#2563EB" />
        <div>
          <strong>Admin Protected Route Verified:</strong> Cross-role authorization check passed. Admin accounts are prebuilt without public registration per design requirements.
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-4 gap-4" style={{ marginBottom: '28px' }}>
        <Card style={{ padding: '18px' }}>
          <p style={{ fontSize: '12.5px', color: 'var(--color-text-muted)', fontWeight: '600' }}>Total Grievances</p>
          <h3 style={{ fontSize: '26px', fontWeight: '800', marginTop: '4px', color: 'var(--color-primary-900)' }}>
            38
          </h3>
        </Card>

        <Card style={{ padding: '18px' }}>
          <p style={{ fontSize: '12.5px', color: 'var(--color-text-muted)', fontWeight: '600' }}>Under Review</p>
          <h3 style={{ fontSize: '26px', fontWeight: '800', marginTop: '4px', color: '#4F46E5' }}>
            6
          </h3>
        </Card>

        <Card style={{ padding: '18px' }}>
          <p style={{ fontSize: '12.5px', color: 'var(--color-text-muted)', fontWeight: '600' }}>In Field Action</p>
          <h3 style={{ fontSize: '26px', fontWeight: '800', marginTop: '4px', color: '#0284C7' }}>
            14
          </h3>
        </Card>

        <Card style={{ padding: '18px' }}>
          <p style={{ fontSize: '12.5px', color: 'var(--color-text-muted)', fontWeight: '600' }}>Resolved (30d)</p>
          <h3 style={{ fontSize: '26px', fontWeight: '800', marginTop: '4px', color: '#16A34A' }}>
            18
          </h3>
        </Card>
      </div>

      {/* Municipal Table */}
      <Card header="Municipal Complaints Master Queue">
        <Table
          columns={adminColumns}
          data={municipalComplaints}
          onRowClick={(row) => setSelectedComplaint(row)}
        />
      </Card>

      {/* Review Modal */}
      {selectedComplaint && (
        <Modal
          isOpen={!!selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
          title={`Admin Review: #${selectedComplaint.id}`}
          footer={
            <Button variant="primary" size="sm" onClick={() => setSelectedComplaint(null)}>
              Close Review
            </Button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="flex items-center justify-between">
              <span className="complaint-id">#{selectedComplaint.id}</span>
              <StatusBadge status={selectedComplaint.status} />
            </div>

            <div>
              <h4 style={{ fontSize: '16px', fontWeight: '700' }}>{selectedComplaint.title}</h4>
              <p style={{ fontSize: '13.5px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                {selectedComplaint.description}
              </p>
            </div>

            <div style={{ padding: '12px', background: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-md)', fontSize: '13px' }}>
              <div><strong>Citizen:</strong> {selectedComplaint.citizen}</div>
              <div style={{ marginTop: '4px' }}><strong>Ward:</strong> {selectedComplaint.ward}</div>
              <div style={{ marginTop: '4px' }}><strong>Assigned Crew:</strong> {selectedComplaint.assignedWorker}</div>
            </div>

            {selectedComplaint.timeline && (
              <div>
                <h5 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '10px' }}>Resolution Audit Trail</h5>
                <Timeline items={selectedComplaint.timeline} />
              </div>
            )}
          </div>
        </Modal>
      )}
    </DashboardLayout>
  );
}
