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
import MapPlaceholder from '../../components/common/MapPlaceholder';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';

const ALL_TIMELINE_STAGES = [
  { stage: 'Submitted', label: 'Submitted', desc: 'Complaint registered in municipal database' },
  { stage: 'Verified', label: 'Verified', desc: 'Validated and duplicate checks completed' },
  { stage: 'Assigned', label: 'Assigned', desc: 'Routed to respective municipal department' },
  { stage: 'Accepted', label: 'Accepted', desc: 'Field technician accepted the work order' },
  { stage: 'In Progress', label: 'In Progress', desc: 'Active repair / clearance underway on site' },
  { stage: 'Resolved', label: 'Resolved', desc: 'Resolution verified with ground evidence' },
];

export default function WorkerTaskDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getComplaintById, acceptTask, startWork, updateTaskProgress, resolveComplaint } = useComplaints();

  const task = getComplaintById(id);

  const [progressModalOpen, setProgressModalOpen] = useState(false);
  const [progressNote, setProgressNote] = useState('');
  const [resolutionModalOpen, setResolutionModalOpen] = useState(false);
  const [resolutionImage, setResolutionImage] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

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

  const isAssigned = task.status?.toLowerCase() === 'assigned';
  const isAccepted = task.status?.toLowerCase() === 'accepted';
  const isInProgress = task.status?.toLowerCase() === 'in progress' || task.status?.toLowerCase() === 'in_progress';
  const isResolved = task.status?.toLowerCase() === 'resolved';

  const handleAccept = () => {
    acceptTask(task.id, 'Rajesh Kumar (Field Tech #4)');
    setActionSuccess('Task Accepted. Please proceed to the site.');
    setTimeout(() => setActionSuccess(''), 4000);
  };

  const handleStartWork = () => {
    startWork(task.id, 'Rajesh Kumar (Field Tech #4)');
    setActionSuccess('Work Started. Status is now In Progress.');
    setTimeout(() => setActionSuccess(''), 4000);
  };

  const handleProgressSubmit = (e) => {
    e.preventDefault();
    if (!progressNote.trim()) return;
    updateTaskProgress(task.id, progressNote, 'Rajesh Kumar (Field Tech #4)');
    setProgressModalOpen(false);
    setProgressNote('');
    setActionSuccess('Progress note recorded to task timeline.');
    setTimeout(() => setActionSuccess(''), 4000);
  };

  const handleResolutionSubmit = (e) => {
    e.preventDefault();
    if (!resolutionNotes.trim()) {
      alert('Please enter resolution notes describing the repair work.');
      return;
    }

    resolveComplaint(
      task.id,
      {
        resolutionImage: resolutionImage || 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=800&q=80',
        resolutionNotes,
      },
      'Rajesh Kumar (Field Tech #4)'
    );

    setResolutionModalOpen(false);
    setActionSuccess('Work Order Resolved Successfully! Evidence logged.');
    setTimeout(() => setActionSuccess(''), 4000);
  };

  const getStageStatus = (stageName) => {
    const existing = task.timeline?.find(
      (t) => t.stage?.toLowerCase() === stageName.toLowerCase()
    );
    if (existing) return { status: 'completed', data: existing };

    const stageOrder = ['submitted', 'verified', 'assigned', 'accepted', 'in progress', 'resolved'];
    const currentStatusClean = task.status?.toLowerCase().replace('_', ' ');
    const currentIndex = stageOrder.indexOf(currentStatusClean);
    const thisIndex = stageOrder.indexOf(stageName.toLowerCase());

    if (thisIndex <= currentIndex && currentIndex !== -1) {
      return { status: 'completed', data: null };
    }
    if (thisIndex === currentIndex + 1) {
      return { status: 'active', data: null };
    }
    return { status: 'pending', data: null };
  };

  return (
    <WorkerLayout>
      <PageHeader
        title={`Work Order #${task.id}`}
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
        {/* Left 2 Cols: Task Details, Citizen Photos, Location */}
        <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Main Work Order Card */}
          <Card>
            <Card.Header className="flex items-center justify-between">
              <div>
                <span className="complaint-id">#{task.id}</span>
                <h3 style={{ fontSize: '18px', fontWeight: '800', marginTop: '4px' }}>
                  {task.title}
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
                {task.image && (
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
                        src={task.image}
                        alt="Citizen proof"
                        style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', display: 'block' }}
                      />
                    </div>
                  </div>
                )}

                {/* Location Map Preview */}
                <div>
                  <h5 style={{ fontSize: '12.5px', fontWeight: '700', color: 'var(--color-text-subtle)', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Site Location & GPS Navigation
                  </h5>
                  <MapPlaceholder location={task.location} address={task.address} />
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
                    <strong>Resolved Date:</strong> {task.resolvedDate ? new Date(task.resolvedDate).toLocaleString() : 'Recently'}
                  </div>

                  {task.resolutionNotes && (
                    <div style={{ padding: '14px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-md)', border: '1px solid #BBF7D0' }}>
                      <h5 style={{ fontSize: '12px', fontWeight: '700', color: '#166534', textTransform: 'uppercase', marginBottom: '4px' }}>
                        Your Resolution Notes
                      </h5>
                      <p style={{ fontSize: '13.5px', color: 'var(--color-text-main)' }}>{task.resolutionNotes}</p>
                    </div>
                  )}

                  {task.resolutionImage && (
                    <div>
                      <h5 style={{ fontSize: '12px', fontWeight: '700', color: '#166534', textTransform: 'uppercase', marginBottom: '6px' }}>
                        Resolution Verification Photo
                      </h5>
                      <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid #BBF7D0', maxHeight: '280px' }}>
                        <img src={task.resolutionImage} alt="Resolution" style={{ width: '100%', maxHeight: '280px', objectFit: 'cover', display: 'block' }} />
                      </div>
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>
          )}
        </div>

        {/* Right Col: Dynamic Worker Actions & 6-Stage Timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Dynamic Workflow Actions Card */}
          <Card header="Field Action Controls" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Step 1: If Assigned -> Accept Task */}
              {isAssigned && (
                <div style={{ padding: '14px', backgroundColor: 'var(--color-primary-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-primary-200)' }}>
                  <h5 style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--color-primary-900)', marginBottom: '4px' }}>
                    1. Acknowledge Order
                  </h5>
                  <p style={{ fontSize: '12.5px', color: 'var(--color-text-muted)', marginBottom: '12px' }}>
                    Accept this work order to notify dispatch that you are preparing equipment.
                  </p>
                  <Button variant="primary" fullWidth size="md" onClick={handleAccept} iconStart={<CheckCircle2 size={16} />}>
                    Accept Task
                  </Button>
                </div>
              )}

              {/* Step 2: If Accepted -> Start Work */}
              {isAccepted && (
                <div style={{ padding: '14px', backgroundColor: '#E0E7FF', borderRadius: 'var(--radius-md)', border: '1px solid #C7D2FE' }}>
                  <h5 style={{ fontSize: '13.5px', fontWeight: '700', color: '#3730A3', marginBottom: '4px' }}>
                    2. Arrived on Site?
                  </h5>
                  <p style={{ fontSize: '12.5px', color: '#4338CA', marginBottom: '12px' }}>
                    Confirm site arrival to transition status to "In Progress".
                  </p>
                  <Button variant="accent" fullWidth size="md" onClick={handleStartWork} iconStart={<HardHat size={16} />}>
                    Start Work (On-Site)
                  </Button>
                </div>
              )}

              {/* Step 3: If In Progress -> Update Progress or Mark Resolved */}
              {isInProgress && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={() => setProgressModalOpen(true)}
                    iconStart={<FileText size={16} />}
                  >
                    Update Progress Note
                  </Button>

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

              {/* If Resolved */}
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
              {ALL_TIMELINE_STAGES.map((step, idx) => {
                const stageCheck = getStageStatus(step.stage);
                const isCompleted = stageCheck.status === 'completed';
                const isCurrentActive = stageCheck.status === 'active';
                const itemData = stageCheck.data;

                return (
                  <div
                    key={step.stage}
                    style={{
                      display: 'flex',
                      gap: '14px',
                      position: 'relative',
                      paddingBottom: idx === ALL_TIMELINE_STAGES.length - 1 ? '0' : '20px',
                    }}
                  >
                    {idx < ALL_TIMELINE_STAGES.length - 1 && (
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
                          {step.label}
                        </h5>
                        {itemData?.time && (
                          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                            {itemData.time.split('•')[0]}
                          </span>
                        )}
                      </div>

                      <p style={{ fontSize: '12px', color: isCompleted ? 'var(--color-text-muted)' : 'var(--color-text-subtle)', marginTop: '2px' }}>
                        {itemData?.note || step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>

      {/* Modal 1: Progress Note Modal */}
      <Modal
        isOpen={progressModalOpen}
        onClose={() => setProgressModalOpen(false)}
        title="Record Field Progress Update"
        footer={
          <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
            <Button variant="primary" fullWidth onClick={handleProgressSubmit}>
              Log Progress Note
            </Button>
            <Button variant="secondary" onClick={() => setProgressModalOpen(false)}>
              Cancel
            </Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <p style={{ fontSize: '13.5px', color: 'var(--color-text-muted)' }}>
            Enter ground observations or intermediate repair status for this task.
          </p>
          <textarea
            className="form-control"
            rows={4}
            placeholder="e.g. Cleared 10m silt; waiting for replacement gasket delivery..."
            value={progressNote}
            onChange={(e) => setProgressNote(e.target.value)}
          />
        </div>
      </Modal>

      {/* Modal 2: Resolution Form Modal */}
      <Modal
        isOpen={resolutionModalOpen}
        onClose={() => setResolutionModalOpen(false)}
        title="Submit Resolution & Complete Order"
        maxWidth="540px"
        footer={
          <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
            <Button variant="accent" fullWidth size="lg" onClick={handleResolutionSubmit} iconStart={<CheckCircle size={18} />}>
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
