import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import ComplaintCard from '../../components/common/ComplaintCard';
import Timeline from '../../components/common/Timeline';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import NotificationItem from '../../components/common/NotificationItem';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  Bell,
  Eye,
  Info
} from 'lucide-react';

export default function CitizenDashboard() {
  const { user } = useAuth();
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [infoModalOpen, setInfoModalOpen] = useState(false);

  // Sample data for route and component testing (strictly NO priority/severity)
  const citizenComplaints = [
    {
      id: 'CMP-2026-104',
      title: 'Damaged drainage grate near community park',
      category: 'Drainage & Sewage',
      location: 'Block 4 Park Entrance, Sector 12',
      status: 'in_progress',
      createdAt: 'Aug 21, 2026',
      description: 'Drainage grill broke under heavy load, causing pedestrian risk during evening hours.',
      timeline: [
        {
          title: 'Complaint Registered',
          time: 'Aug 21, 09:30 AM',
          author: user?.name || 'Citizen',
          description: 'Initial grievance submission with location coordinates.',
          status: 'submitted',
        },
        {
          title: 'Supervisor Verified',
          time: 'Aug 21, 02:15 PM',
          author: 'Admin Operations',
          description: 'Assigned to Sector 12 Drainage Maintenance Crew.',
          status: 'under_review',
        },
        {
          title: 'Field Team Arrived',
          time: 'Aug 22, 10:00 AM',
          author: 'Field Crew Alpha',
          description: 'Welding and heavy duty mesh replacement underway.',
          status: 'in_progress',
        },
      ],
    },
    {
      id: 'CMP-2026-102',
      title: 'Flickering street light pole #44',
      category: 'Electrical & Lighting',
      location: 'Blossom Enclave Main Lane',
      status: 'resolved',
      createdAt: 'Aug 18, 2026',
      description: 'Street light constantly blinking every few seconds.',
      timeline: [
        {
          title: 'Complaint Registered',
          time: 'Aug 18, 08:00 PM',
          author: user?.name || 'Citizen',
          description: 'Reported night-time lighting hazard.',
          status: 'submitted',
        },
        {
          title: 'LED Driver Replaced',
          time: 'Aug 19, 11:30 AM',
          author: 'Rajesh Kumar (Field Tech)',
          description: 'Defective power driver replaced and calibrated.',
          status: 'resolved',
        },
      ],
    },
  ];

  const tableColumns = [
    {
      key: 'id',
      header: 'Complaint ID',
      render: (val) => <span className="complaint-id">#{val}</span>,
    },
    {
      key: 'title',
      header: 'Title / Location',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: '600', color: 'var(--color-text-main)' }}>{val}</div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{row.location}</div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
    },
    {
      key: 'status',
      header: 'Status',
      render: (val) => <StatusBadge status={val} pulse={val === 'in_progress'} />,
    },
    {
      key: 'createdAt',
      header: 'Filed Date',
    },
    {
      key: 'action',
      header: 'Action',
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
          View Details
        </Button>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title="Citizen Overview Dashboard"
        subtitle={`Welcome back, ${user?.name || user?.username}! Track and monitor your civic grievances.`}
        badge={<StatusBadge status="resolved" />}
        actions={
          <Button
            variant="accent"
            iconStart={<PlusCircle size={17} />}
            onClick={() => setInfoModalOpen(true)}
          >
            Lodge New Complaint
          </Button>
        }
      />

      {/* Part 1 Notice Card */}
      <div
        style={{
          padding: '14px 18px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--color-primary-50)',
          border: '1px solid var(--color-primary-200)',
          color: 'var(--color-primary-900)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '24px',
          fontSize: '13.5px',
        }}
      >
        <Info size={20} color="var(--color-primary-700)" />
        <div>
          <strong>Part 1 Scope:</strong> Authentication, role protection, responsive layout, and reusable UI components are active. Complaint submission and mutation forms will be built in Part 2.
        </div>
      </div>

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-3 gap-5" style={{ marginBottom: '28px' }}>
        <Card style={{ padding: '20px' }}>
          <div className="flex items-center justify-between">
            <div>
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: '600' }}>Total Lodged</p>
              <h3 style={{ fontSize: '28px', fontWeight: '800', marginTop: '4px', color: 'var(--color-primary-900)' }}>
                {citizenComplaints.length}
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
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: '600' }}>In Progress</p>
              <h3 style={{ fontSize: '28px', fontWeight: '800', marginTop: '4px', color: '#0284C7' }}>
                1
              </h3>
            </div>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-status-progress-bg)',
                color: 'var(--color-status-progress-text)',
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
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: '600' }}>Resolved</p>
              <h3 style={{ fontSize: '28px', fontWeight: '800', marginTop: '4px', color: '#16A34A' }}>
                1
              </h3>
            </div>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-status-resolved-bg)',
                color: 'var(--color-status-resolved-text)',
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

      {/* Main Content Area: Complaints & Notifications */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left 2 Cols: Complaint Cards & Table */}
        <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <Card header="Recent Active Grievances">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {citizenComplaints.map((c) => (
                <ComplaintCard
                  key={c.id}
                  id={c.id}
                  title={c.title}
                  description={c.description}
                  category={c.category}
                  status={c.status}
                  location={c.location}
                  createdAt={c.createdAt}
                  onClick={() => setSelectedComplaint(c)}
                />
              ))}
            </div>
          </Card>

          <Card header="All Registered Complaints Table">
            <Table
              columns={tableColumns}
              data={citizenComplaints}
              onRowClick={(row) => setSelectedComplaint(row)}
            />
          </Card>
        </div>

        {/* Right Col: Notifications & Quick Updates */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Card header="Status Notifications">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <NotificationItem
                title="Field crew deployed"
                message="Maintenance crew Alpha is on-site for #CMP-2026-104."
                time="20 mins ago"
                type="info"
                unread
              />
              <NotificationItem
                title="Resolution verified"
                message="Street light complaint #CMP-2026-102 was marked resolved."
                time="Yesterday"
                type="success"
              />
            </div>
          </Card>

          <Card header="Citizen Guidelines">
            <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
              <p style={{ marginBottom: '8px' }}>
                📌 <strong>Accurate Location:</strong> Pinpointing exact lane and sector landmarks speeds up dispatch by 40%.
              </p>
              <p>
                ⏱️ <strong>SLA Response:</strong> Municipal teams review incoming submissions within 2 hours of registration.
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* Complaint Detail Modal */}
      {selectedComplaint && (
        <Modal
          isOpen={!!selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
          title={`Complaint #${selectedComplaint.id}`}
          footer={
            <Button variant="primary" size="sm" onClick={() => setSelectedComplaint(null)}>
              Close
            </Button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div className="flex items-center justify-between">
              <span className="complaint-id">#{selectedComplaint.id}</span>
              <StatusBadge status={selectedComplaint.status} pulse={selectedComplaint.status === 'in_progress'} />
            </div>

            <div>
              <h4 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '6px' }}>{selectedComplaint.title}</h4>
              <p style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>{selectedComplaint.description}</p>
            </div>

            <div style={{ padding: '12px', background: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-md)', fontSize: '13px' }}>
              <div><strong>Category:</strong> {selectedComplaint.category}</div>
              <div style={{ marginTop: '4px' }}><strong>Location:</strong> {selectedComplaint.location}</div>
              <div style={{ marginTop: '4px' }}><strong>Filed On:</strong> {selectedComplaint.createdAt}</div>
            </div>

            {selectedComplaint.timeline && (
              <div>
                <h5 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px' }}>Audit Timeline</h5>
                <Timeline items={selectedComplaint.timeline} />
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Part 2 Info Modal */}
      <Modal
        isOpen={infoModalOpen}
        onClose={() => setInfoModalOpen(false)}
        title="Complaint Lodging (Part 2)"
        footer={
          <Button variant="primary" size="sm" onClick={() => setInfoModalOpen(false)}>
            Understood
          </Button>
        }
      >
        <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
          Per Part 1 specifications, the complaint submission and mutation workflows will be built in the next development phase. The current dashboard serves to test route protection and showcase all 15 reusable design system components.
        </p>
      </Modal>
    </DashboardLayout>
  );
}
