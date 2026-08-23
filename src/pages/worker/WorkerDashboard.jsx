import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import ComplaintCard from '../../components/common/ComplaintCard';
import Timeline from '../../components/common/Timeline';
import Modal from '../../components/common/Modal';
import {
  HardHat,
  Wrench,
  CheckCircle,
  Clock,
  MapPin,
  FileText,
  Info,
  Navigation
} from 'lucide-react';

export default function WorkerDashboard() {
  const { user } = useAuth();
  const [selectedTask, setSelectedTask] = useState(null);

  // Field tasks for testing (strictly NO priority/severity)
  const workerTasks = [
    {
      id: 'CMP-2026-8941',
      title: 'Pothole repair required on 4th Main Crossroad',
      category: 'Roads & Infrastructure',
      location: 'Sector 7, North Ward (Opp. City Hospital)',
      status: 'in_progress',
      assignedDate: 'Today, 10:30 AM',
      description: 'Asphalt patching and surface leveling required for 2.5m road crater.',
      timeline: [
        {
          title: 'Work Order Dispatched',
          time: '10:30 AM',
          author: 'Municipal Admin',
          description: 'Task routed to Field Tech unit #04.',
          status: 'in_progress',
        },
      ],
    },
    {
      id: 'CMP-2026-8879',
      title: 'Damaged water valve replacement',
      category: 'Water Works',
      location: 'Greenfield Avenue, Pillar 19',
      status: 'resolved',
      assignedDate: 'Aug 20, 2026',
      description: 'Replaced brass pressure valve and conducted water leakage pressure test.',
      timeline: [
        {
          title: 'Work Order Dispatched',
          time: 'Aug 20, 09:00 AM',
          author: 'Municipal Admin',
          description: 'Routed to plumbing squad.',
          status: 'in_progress',
        },
        {
          title: 'Ground Repair Completed',
          time: 'Aug 20, 02:40 PM',
          author: 'Rajesh Kumar (Field Tech)',
          description: 'Valve replaced, zero leakage confirmed.',
          status: 'resolved',
        },
      ],
    },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title="Field Worker Workstation"
        subtitle={`Logged in as ${user?.name || user?.username} (${user?.zone || 'North Zone'}).`}
        badge={
          <span
            style={{
              fontSize: '12px',
              fontWeight: '700',
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: '#E0F2FE',
              color: '#075985',
              border: '1px solid #BAE6FD',
            }}
          >
            Field Worker Active
          </span>
        }
      />

      {/* Part 1 Info Banner */}
      <div
        style={{
          padding: '14px 18px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: '#F0FDFA',
          border: '1px solid #CCFBF1',
          color: '#115E59',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '24px',
          fontSize: '13.5px',
        }}
      >
        <Info size={20} color="#0D9488" />
        <div>
          <strong>Worker Protected Route Verified:</strong> Cross-role authorization check passed. Prebuilt field worker credentials authenticate ground staff seamlessly.
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-5" style={{ marginBottom: '28px' }}>
        <Card style={{ padding: '20px' }}>
          <div className="flex items-center justify-between">
            <div>
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: '600' }}>Active Tasks</p>
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
              <Wrench size={22} />
            </div>
          </div>
        </Card>

        <Card style={{ padding: '20px' }}>
          <div className="flex items-center justify-between">
            <div>
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: '600' }}>Completed Today</p>
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
              <CheckCircle size={22} />
            </div>
          </div>
        </Card>

        <Card style={{ padding: '20px' }}>
          <div className="flex items-center justify-between">
            <div>
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: '600' }}>Total Assigned</p>
              <h3 style={{ fontSize: '28px', fontWeight: '800', marginTop: '4px', color: 'var(--color-primary-900)' }}>
                {workerTasks.length}
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
              <HardHat size={22} />
            </div>
          </div>
        </Card>
      </div>

      {/* Work Orders List */}
      <Card header="Assigned Work Orders Queue">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {workerTasks.map((task) => (
            <ComplaintCard
              key={task.id}
              id={task.id}
              title={task.title}
              description={task.description}
              category={task.category}
              status={task.status}
              location={task.location}
              createdAt={`Assigned: ${task.assignedDate}`}
              onClick={() => setSelectedTask(task)}
            />
          ))}
        </div>
      </Card>

      {/* Task Details Modal */}
      {selectedTask && (
        <Modal
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          title={`Work Order #${selectedTask.id}`}
          footer={
            <Button variant="primary" size="sm" onClick={() => setSelectedTask(null)}>
              Close Order
            </Button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="flex items-center justify-between">
              <span className="complaint-id">#{selectedTask.id}</span>
              <StatusBadge status={selectedTask.status} pulse={selectedTask.status === 'in_progress'} />
            </div>

            <div>
              <h4 style={{ fontSize: '16px', fontWeight: '700' }}>{selectedTask.title}</h4>
              <p style={{ fontSize: '13.5px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                {selectedTask.description}
              </p>
            </div>

            <div style={{ padding: '12px', background: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-md)', fontSize: '13px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={14} color="var(--color-accent-600)" />
                <span><strong>Location:</strong> {selectedTask.location}</span>
              </div>
              <div style={{ marginTop: '4px' }}><strong>Category:</strong> {selectedTask.category}</div>
            </div>

            {selectedTask.timeline && (
              <div>
                <h5 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '10px' }}>Task Timeline</h5>
                <Timeline items={selectedTask.timeline} />
              </div>
            )}
          </div>
        </Modal>
      )}
    </DashboardLayout>
  );
}
