import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Tag,
  Building,
  User,
  CheckCircle2,
  Clock,
  Wrench,
  CheckCircle,
  UploadCloud,
  FileText,
  AlertCircle,
  HardHat,
  Send
} from 'lucide-react';
import { useComplaints } from '../../context/ComplaintContext';
import WorkerLayout from '../../components/layout/WorkerLayout';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import ImageUpload from '../../components/common/ImageUpload';
import GoogleMapComponent from '../../components/common/GoogleMapComponent';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';

const TIMELINE_STAGES = [
  { key: 'createdAt', stage: 'SUBMITTED', title: 'Complaint Registered', desc: 'Grievance submitted with geotagged coordinates' },
  { key: 'verifiedAt', stage: 'VERIFIED', title: 'Municipal Verification', desc: 'Validated and duplicate checks completed' },
  { key: 'assignedAt', stage: 'ASSIGNED', title: 'Work Order Assigned', desc: 'Routed to respective municipal department' },
  { key: 'acceptedAt', stage: 'ACCEPTED', title: 'Task Accepted', desc: 'Field technician accepted the work order' },
  { key: 'startedAt', stage: 'IN_PROGRESS', title: 'Field Work In Progress', desc: 'Active repair / clearance underway on site' },
  { key: 'resolvedAt', stage: 'RESOLVED', title: 'Resolution Complete', desc: 'Resolution verified with ground evidence' },
];

export default function WorkerTaskDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getComplaintById, acceptTask, startWork, resolveComplaint } = useComplaints();

  const task = getComplaintById(id);

  const [resolutionModalOpen, setResolutionModalOpen] = useState(false);
  const [resolutionImage, setResolutionImage] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!task) {
    return (
      <WorkerLayout>
        <div style={{ padding: '60px 20px', textAlign: 'center' }}>
          <EmptyState
            title="Task Not Found"
            description={`No work order found with ID "${id}".`}
            action={
              <Link to="/worker/tasks">
                <Button variant="primary" iconStart={<ArrowLeft size={16} />}>
                  Back to Tasks
                </Button>
              </Link>
            }
          />
        </div>
      </WorkerLayout>
    );
  }

  const isAssigned = task.status === 'ASSIGNED';
  const isAccepted = task.status === 'ACCEPTED';
  const isInProgress = task.status === 'IN_PROGRESS';
  const isResolved = task.status === 'RESOLVED';

  const stageOrder = ['SUBMITTED', 'VERIFIED', 'ASSIGNED', 'ACCEPTED', 'IN_PROGRESS', 'RESOLVED'];
  const currentIndex = stageOrder.indexOf(task.status);

  const handleAccept = async () => {
    setIsProcessing(true);
    try {
      await acceptTask(task.complaintNumber || task.id, 'Rajesh Kumar (Field Tech #4)');
      setActionSuccess('Task Accepted. Please mobilize and proceed to the site.');
      setTimeout(() => setActionSuccess(''), 4000);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStartWork = async () => {
    setIsProcessing(true);
    try {
      await startWork(task.complaintNumber || task.id, 'Rajesh Kumar (Field Tech #4)');
      setActionSuccess('Work Started. Status is now IN_PROGRESS.');
      setTimeout(() => setActionSuccess(''), 4000);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResolutionSubmit = async (e) => {
    e.preventDefault();
    if (!resolutionNotes.trim()) {
      alert('Please enter resolution notes describing the repair work.');
      return;
    }

    setIsProcessing(true);
    try {
      await resolveComplaint(
        task.complaintNumber || task.id,
        {
          resolutionImage: resolutionImage || 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=800&q=80',
          resolutionNotes,
        },
        'Rajesh Kumar (Field Tech #4)'
      );

      setResolutionModalOpen(false);
      setActionSuccess('Work Order RESOLVED Successfully! Evidence synchronized with Firebase.');
      setTimeout(() => setActionSuccess(''), 4000);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <WorkerLayout>
      <PageHeader
        title={`Work Order #${task.complaintNumber || task.id}`}
        subtitle="Review site coordinates, accept work order, and submit ground resolution evidence."
        breadcrumbs={
          <Link
            to="/worker/tasks"
            style={{ fontSize: '13px', color: 'var(--color-primary-600)', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}
          >
            <ArrowLeft size={14} /> Back to My Tasks
          </Link>
        }
        badge={<StatusBadge status={task.status} pulse={isInProgress} />}
      />

      {/* Action Flash Alert */}
      {actionSuccess && (
        <div
          style={{
            padding: '12px 18px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-status-resolved-bg)',
            border: '1px solid var(--color-status-resolved-border)',
            color: 'var(--color-status-resolved-text)',
            fontSize: '13.5px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '20px',
          }}
        >
          <CheckCircle2 size={16} />
          <span>{actionSuccess}</span>
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        {/* Left 2 Cols: Details, Evidence, GPS Navigation */}
        <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <Card>
            <Card.Header className="flex items-center justify-between">
              <div>
                <span className="complaint-id">#{task.complaintNumber || task.id}</span>
                <h3 style={{ fontSize: '18px', fontWeight: '800', marginTop: '4px' }}>
                  {task.category} Task at {task.address?.split(',')[0]}
                </h3>
              </div>
              <StatusBadge status={task.status} />
            </Card.Header>

            <Card.Body>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <h5 style={{ fontSize: '12.5px', fontWeight: '700', color: 'var(--color-text-subtle)', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Citizen Grievance Description
                  </h5>
                  <p style={{ fontSize: '14.5px', color: 'var(--color-text-main)', lineHeight: 1.6 }}>
                    {task.description}
                  </p>
                </div>

                {/* Citizen Before Photo */}
                {task.imageUrl && (
                  <div>
                    <h5 style={{ fontSize: '12.5px', fontWeight: '700', color: 'var(--color-text-subtle)', textTransform: 'uppercase', marginBottom: '8px' }}>
                      Citizen Ground Proof (Before)
                    </h5>
                    <div
                      style={{
                        borderRadius: 'var(--radius-md)',
                        overflow: 'hidden',
                        border: '1px solid var(--color-border)',
                        maxHeight: '300px',
                        backgroundColor: '#0F172A',
                      }}
                    >
                      <img
                        src={task.imageUrl}
                        alt="Citizen proof"
                        style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', display: 'block' }}
                      />
                    </div>
                  </div>
                )}

                {/* Site GPS Coordinates Map */}
                <div>
                  <h5 style={{ fontSize: '12.5px', fontWeight: '700', color: 'var(--color-text-subtle)', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Site Location & GPS Navigation
                  </h5>
                  <GoogleMapComponent
                    mode="task"
                    latitude={task.latitude}
                    longitude={task.longitude}
                    address={task.address}
                    height="200px"
                  />
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* When Resolved: Resolution Evidence Section */}
          {isResolved && (
            <Card style={{ border: '2px solid #BBF7D0', backgroundColor: '#F0FDF4' }}>
              <Card.Header style={{ backgroundColor: '#DCFCE7', borderBottom: '1px solid #BBF7D0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#166534' }}>
                  <CheckCircle size={20} />
                  <h4 style={{ fontSize: '16px', fontWeight: '800' }}>Task Successfully Resolved</h4>
                </div>
              </Card.Header>

              <Card.Body>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ fontSize: '13px', color: '#166534' }}>
                    <strong>Resolved Date:</strong> {task.resolvedAt ? new Date(task.resolvedAt).toLocaleString() : 'Recently'}
                  </div>

                  {task.resolutionNotes && (
                    <div style={{ padding: '14px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-md)', border: '1px solid #BBF7D0' }}>
                      <h5 style={{ fontSize: '12px', fontWeight: '700', color: '#166534', textTransform: 'uppercase', marginBottom: '4px' }}>
                        Your Resolution Notes
                      </h5>
                      <p style={{ fontSize: '13.5px', color: 'var(--color-text-main)' }}>{task.resolutionNotes}</p>
                    </div>
                  )}

                  {task.resolutionImageUrl && (
                    <div>
                      <h5 style={{ fontSize: '12px', fontWeight: '700', color: '#166534', textTransform: 'uppercase', marginBottom: '6px' }}>
                        Resolution Verification Photo
                      </h5>
                      <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid #BBF7D0', maxHeight: '280px' }}>
                        <img src={task.resolutionImageUrl} alt="Resolution" style={{ width: '100%', maxHeight: '280px', objectFit: 'cover', display: 'block' }} />
                      </div>
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>
          )}
        </div>

        {/* Right Col: Dynamic Workflow Controls & 6-Stage Timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Dynamic Workflow Actions Card */}
          <Card header="Field Action Controls" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Step 1: If ASSIGNED -> Accept Task */}
              {isAssigned && (
                <div style={{ padding: '14px', backgroundColor: 'var(--color-primary-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-primary-200)' }}>
                  <h5 style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--color-primary-900)', marginBottom: '4px' }}>
                    1. Acknowledge Order
                  </h5>
                  <p style={{ fontSize: '12.5px', color: 'var(--color-text-muted)', marginBottom: '12px' }}>
                    Accept this work order to notify dispatch that you are preparing equipment.
                  </p>
                  <Button
                    variant="primary"
                    fullWidth
                    size="md"
                    loading={isProcessing}
                    onClick={handleAccept}
                    iconStart={<CheckCircle2 size={16} />}
                  >
                    Accept Task
                  </Button>
                </div>
              )}

              {/* Step 2: If ACCEPTED -> Start Work */}
              {isAccepted && (
                <div style={{ padding: '14px', backgroundColor: '#E0E7FF', borderRadius: 'var(--radius-md)', border: '1px solid #C7D2FE' }}>
                  <h5 style={{ fontSize: '13.5px', fontWeight: '700', color: '#3730A3', marginBottom: '4px' }}>
                    2. Arrived on Site?
                  </h5>
                  <p style={{ fontSize: '12.5px', color: '#4338CA', marginBottom: '12px' }}>
                    Confirm site arrival to transition status to "IN_PROGRESS".
                  </p>
                  <Button
                    variant="accent"
                    fullWidth
                    size="md"
                    loading={isProcessing}
                    onClick={handleStartWork}
                    iconStart={<HardHat size={16} />}
                  >
                    Start Work (On-Site)
                  </Button>
                </div>
              )}

              {/* Step 3: If IN_PROGRESS -> Upload Resolution & Mark Resolved */}
              {isInProgress && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <Button
                    variant="accent"
                    fullWidth
                    size="lg"
                    onClick={() => setResolutionModalOpen(true)}
                    iconStart={<CheckCircle size={18} />}
                  >
                    Upload Resolution & Mark Resolved
                  </Button>
                </div>
              )}

              {/* If RESOLVED */}
              {isResolved && (
                <div style={{ padding: '14px', backgroundColor: 'var(--color-status-resolved-bg)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                  <CheckCircle size={28} color="#16A34A" style={{ margin: '0 auto 6px' }} />
                  <div style={{ fontWeight: '700', color: '#166534' }}>Work Order Completed</div>
                </div>
              )}
            </div>
          </Card>

          {/* 6-Stage Timeline */}
          <Card header="Resolution Stage Tracker" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
              {TIMELINE_STAGES.map((step, idx) => {
                const stepIndex = stageOrder.indexOf(step.stage);
                const isCompleted = stepIndex <= currentIndex && currentIndex !== -1;
                const isCurrentActive = stepIndex === currentIndex;
                const timestamp = task[step.key];

                return (
                  <div
                    key={step.stage}
                    style={{
                      display: 'flex',
                      gap: '14px',
                      position: 'relative',
                      paddingBottom: idx === TIMELINE_STAGES.length - 1 ? '0' : '20px',
                    }}
                  >
                    {idx < TIMELINE_STAGES.length - 1 && (
                      <div
                        style={{
                          position: 'absolute',
                          left: '15px',
                          top: '32px',
                          bottom: '0',
                          width: '2px',
                          backgroundColor: isCompleted ? 'var(--color-primary-600)' : 'var(--color-border)',
                        }}
                      />
                    )}

                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: isCompleted
                          ? 'var(--color-primary-600)'
                          : isCurrentActive
                          ? 'var(--color-primary-100)'
                          : '#F1F5F9',
                        color: isCompleted ? '#FFFFFF' : isCurrentActive ? 'var(--color-primary-700)' : '#94A3B8',
                        border: '2px solid #FFFFFF',
                        boxShadow: isCompleted || isCurrentActive ? '0 0 0 2px var(--color-primary-200)' : 'none',
                        zIndex: 1,
                        flexShrink: 0,
                        fontSize: '12px',
                        fontWeight: '700',
                      }}
                    >
                      {isCompleted ? <CheckCircle2 size={16} /> : idx + 1}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div className="flex items-center justify-between">
                        <h5
                          style={{
                            fontSize: '13.5px',
                            fontWeight: '700',
                            color: isCompleted
                              ? 'var(--color-text-main)'
                              : isCurrentActive
                              ? 'var(--color-primary-700)'
                              : 'var(--color-text-subtle)',
                          }}
                        >
                          {step.title}
                        </h5>
                        {timestamp && (
                          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                            {new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                      </div>

                      <p style={{ fontSize: '12px', color: isCompleted ? 'var(--color-text-muted)' : 'var(--color-text-subtle)', marginTop: '2px' }}>
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>

      {/* Resolution Modal */}
      <Modal
        isOpen={resolutionModalOpen}
        onClose={() => setResolutionModalOpen(false)}
        title="Submit Resolution & Complete Order"
        maxWidth="540px"
        footer={
          <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
            <Button
              variant="accent"
              fullWidth
              size="lg"
              loading={isProcessing}
              onClick={handleResolutionSubmit}
              iconStart={<CheckCircle size={18} />}
            >
              Confirm Resolution Complete
            </Button>
            <Button variant="secondary" onClick={() => setResolutionModalOpen(false)}>
              Cancel
            </Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <p style={{ fontSize: '13.5px', color: 'var(--color-text-muted)' }}>
            Attach resolution photo proof and describe the repairs performed on ground.
          </p>

          <ImageUpload
            value={resolutionImage}
            onChange={(img) => setResolutionImage(img)}
            label="Upload Resolution Evidence Photo"
            helperText="Photo of repaired street, fixed leak, or cleared garbage"
          />

          <div className="form-group">
            <label className="form-label">
              <span>Resolution Notes <span className="required-mark">*</span></span>
            </label>
            <textarea
              className="form-control"
              rows={4}
              placeholder="Describe repairs, replacement parts used, and final testing results..."
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              required
            />
          </div>
        </div>
      </Modal>
    </WorkerLayout>
  );
}
