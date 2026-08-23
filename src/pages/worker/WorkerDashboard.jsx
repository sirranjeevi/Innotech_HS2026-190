import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Wrench,
  CheckCircle,
  Clock,
  HardHat,
  ArrowRight,
  MapPin,
  Tag,
  ClipboardList,
  AlertCircle,
  Sparkles,
  Inbox
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useComplaints } from '../../context/ComplaintContext';
import WorkerLayout from '../../components/layout/WorkerLayout';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import ComplaintCard from '../../components/common/ComplaintCard';
import EmptyState from '../../components/common/EmptyState';

export default function WorkerDashboard() {
  const { user } = useAuth();
  const { complaints } = useComplaints();
  const navigate = useNavigate();

  // Filter tasks assigned to this worker or all field tasks
  const workerTasks = complaints.filter(
    (c) =>
      c.worker === user?.name ||
      c.worker?.toLowerCase().includes('rajesh') ||
      c.worker?.toLowerCase().includes('field') ||
      user?.role === 'worker'
  );

  // 4 Required Worker Metrics
  const assignedCount = workerTasks.filter((t) => t.status?.toLowerCase() === 'assigned').length;
  const acceptedCount = workerTasks.filter((t) => t.status?.toLowerCase() === 'accepted').length;
  const inProgressCount = workerTasks.filter((t) => t.status?.toLowerCase() === 'in progress' || t.status?.toLowerCase() === 'in_progress').length;
  const resolvedCount = workerTasks.filter((t) => t.status?.toLowerCase() === 'resolved').length;

  const activeWorkOrders = workerTasks.filter((t) => t.status?.toLowerCase() !== 'resolved');

  return (
    <WorkerLayout>
      <PageHeader
        title="Field Operations Workstation"
        subtitle={`Welcome, ${user?.name || 'Field Specialist'} • Manage your assigned municipal jobs and submit resolution evidence.`}
        badge={
          <span
            style={{
              fontSize: '12px',
              fontWeight: '700',
              padding: '4px 12px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: '#E0F2FE',
              color: '#075985',
              border: '1px solid #BAE6FD',
            }}
          >
            Field Specialist On Duty
          </span>
        }
        actions={
          <Link to="/worker/tasks">
            <Button variant="accent" size="sm" iconStart={<ClipboardList size={16} />}>
              View All Tasks
            </Button>
          </Link>
        }
      />

      {/* 4 Required Metric Cards */}
      <div className="grid grid-cols-4 gap-4" style={{ marginBottom: '28px' }}>
        <Card style={{ padding: '20px' }}>
          <div className="flex items-center justify-between">
            <div>
              <p style={{ fontSize: '13px', color: 'var(--color-primary-800)', fontWeight: '700' }}>
                Assigned
              </p>
              <h3 style={{ fontSize: '28px', fontWeight: '800', marginTop: '4px', color: 'var(--color-primary-900)' }}>
                {assignedCount}
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
              <ClipboardList size={22} />
            </div>
          </div>
        </Card>

        <Card style={{ padding: '20px' }}>
          <div className="flex items-center justify-between">
            <div>
              <p style={{ fontSize: '13px', color: '#4F46E5', fontWeight: '700' }}>
                Accepted
              </p>
              <h3 style={{ fontSize: '28px', fontWeight: '800', marginTop: '4px', color: '#4F46E5' }}>
                {acceptedCount}
              </h3>
            </div>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#E0E7FF',
                color: '#4F46E5',
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
              <p style={{ fontSize: '13px', color: '#0284C7', fontWeight: '700' }}>
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
              <Wrench size={22} />
            </div>
          </div>
        </Card>

        <Card style={{ padding: '20px' }}>
          <div className="flex items-center justify-between">
            <div>
              <p style={{ fontSize: '13px', color: '#16A34A', fontWeight: '700' }}>
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
              <CheckCircle size={22} />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Grid: Active Work Orders */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Work Orders Queue */}
        <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="flex items-center justify-between">
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--color-text-main)' }}>
              Active Ground Work Orders
            </h3>
            <Link
              to="/worker/tasks"
              style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-primary-600)', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              View Task List <ArrowRight size={14} />
            </Link>
          </div>

          {activeWorkOrders.length === 0 ? (
            <Card style={{ padding: '40px 20px' }}>
              <EmptyState
                title="All Assigned Work Orders Completed"
                description="Great job! You have no pending work orders. Check back when dispatch assigns new jobs."
                icon={<CheckCircle size={32} color="#16A34A" />}
              />
            </Card>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {activeWorkOrders.map((task) => (
                <Card key={task.id} interactive onClick={() => navigate(`/worker/tasks/${task.id}`)}>
                  <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="complaint-id">#{task.id}</span>
                        <h4 style={{ fontSize: '16.5px', fontWeight: '800', marginTop: '4px' }}>
                          {task.title}
                        </h4>
                      </div>
                      <StatusBadge status={task.status} pulse={task.status === 'In Progress'} />
                    </div>

                    <p style={{ fontSize: '13.5px', color: 'var(--color-text-muted)', lineClamp: 2 }}>
                      {task.description}
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
                        <span>{task.address || task.location}</span>
                      </div>

                      <span style={{ fontWeight: '700', color: 'var(--color-primary-600)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        Open Work Order <ArrowRight size={13} />
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Right Col: Field Tech Toolkit & Safety Notice */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Card
            style={{
              padding: '22px',
              backgroundColor: 'var(--color-primary-50)',
              borderColor: 'var(--color-primary-200)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <HardHat size={20} color="var(--color-primary-700)" />
              <h4 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--color-primary-950)' }}>
                Field Resolution Workflow
              </h4>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: 1.5, marginBottom: '14px' }}>
              1. <strong>Accept Task</strong> to confirm tool availability.<br />
              2. <strong>Start Work</strong> upon site arrival.<br />
              3. <strong>Upload Resolution Photo</strong> to mark job complete.
            </p>
            <Link to="/worker/tasks">
              <Button variant="primary" fullWidth size="sm">
                Open Active Tasks
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </WorkerLayout>
  );
}
