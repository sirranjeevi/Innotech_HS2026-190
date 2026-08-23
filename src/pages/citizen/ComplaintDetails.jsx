import React from 'react';
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
  FileText,
  Sparkles,
  Layers,
  Image as ImageIcon,
  CheckCircle
} from 'lucide-react';
import { useComplaints } from '../../context/ComplaintContext';
import CitizenLayout from '../../components/layout/CitizenLayout';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';

const ALL_TIMELINE_STAGES = [
  { stage: 'Submitted', label: 'Submitted', desc: 'Complaint registered in municipal database' },
  { stage: 'Verified', label: 'Verified', desc: 'Validated and duplicate checks completed' },
  { stage: 'Assigned', label: 'Assigned', desc: 'Routed to respective municipal department' },
  { stage: 'Accepted', label: 'Accepted', desc: 'Field technician accepted the work order' },
  { stage: 'In Progress', label: 'In Progress', desc: 'Active repair / clearance underway on site' },
  { stage: 'Resolved', label: 'Resolved', desc: 'Resolution verified with ground evidence' },
];

export default function ComplaintDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getComplaintById } = useComplaints();

  const complaint = getComplaintById(id);

  if (!complaint) {
    return (
      <CitizenLayout>
        <div style={{ padding: '60px 20px', textAlign: 'center' }}>
          <EmptyState
            title="Complaint Not Found"
            description={`No grievance found with tracking ID "${id}". It may have been deleted or the link is invalid.`}
            action={
              <Link to="/citizen/complaints">
                <Button variant="primary" iconStart={<ArrowLeft size={16} />}>
                  Back to My Complaints
                </Button>
              </Link>
            }
          />
        </div>
      </CitizenLayout>
    );
  }

  // Calculate current timeline progress index
  const isResolved = complaint.status?.toLowerCase() === 'resolved';

  const getStageStatus = (stageName) => {
    const existing = complaint.timeline?.find(
      (t) => t.stage?.toLowerCase() === stageName.toLowerCase()
    );
    if (existing) return { status: 'completed', data: existing };

    // Stage order checking
    const stageOrder = ['submitted', 'verified', 'assigned', 'accepted', 'in progress', 'resolved'];
    const currentStatusClean = complaint.status?.toLowerCase().replace('_', ' ');
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
    <CitizenLayout>
      <PageHeader
        title={`Complaint #${complaint.id}`}
        subtitle="Live audit trail and resolution monitoring for your reported issue."
        breadcrumbs={
          <Link
            to="/citizen/complaints"
            style={{ fontSize: '13px', color: 'var(--color-primary-600)', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}
          >
            <ArrowLeft size={14} /> Back to My Complaints
          </Link>
        }
        badge={<StatusBadge status={complaint.status} pulse={!isResolved} />}
        actions={
          <Link to="/citizen/report">
            <Button variant="outline" size="sm">
              Report Another Issue
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-3 gap-6">
        {/* Left 2 Cols: Complaint Information & Resolution Section */}
        <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Main Details Card */}
          <Card>
            <Card.Header className="flex items-center justify-between">
              <div>
                <span className="complaint-id">#{complaint.id}</span>
                <h3 style={{ fontSize: '19px', fontWeight: '800', marginTop: '6px', color: 'var(--color-text-main)' }}>
                  {complaint.title}
                </h3>
              </div>
              <StatusBadge status={complaint.status} pulse={!isResolved} />
            </Card.Header>

            <Card.Body>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Description */}
                <div>
                  <h5 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-text-subtle)', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Issue Description
                  </h5>
                  <p style={{ fontSize: '14.5px', color: 'var(--color-text-main)', lineHeight: 1.6 }}>
                    {complaint.description}
                  </p>
                </div>

                {/* Attached Photo Evidence */}
                {complaint.image && (
                  <div>
                    <h5 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-text-subtle)', textTransform: 'uppercase', marginBottom: '8px' }}>
                      Citizen Photo Evidence
                    </h5>
                    <div
                      style={{
                        borderRadius: 'var(--radius-md)',
                        overflow: 'hidden',
                        border: '1px solid var(--color-border)',
                        maxHeight: '320px',
                        backgroundColor: '#0F172A',
                      }}
                    >
                      <img
                        src={complaint.image}
                        alt="Citizen proof"
                        style={{ width: '100%', maxHeight: '320px', objectFit: 'cover', display: 'block' }}
                      />
                    </div>
                  </div>
                )}

                {/* Metadata Grid */}
                <div
                  className="grid grid-cols-2 gap-4"
                  style={{
                    padding: '16px',
                    backgroundColor: 'var(--color-bg-subtle)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border-subtle)',
                    fontSize: '13.5px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <Tag size={16} color="var(--color-primary-600)" style={{ marginTop: '2px' }} />
                    <div>
                      <div style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>Category</div>
                      <strong style={{ color: 'var(--color-text-main)' }}>{complaint.category}</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <Calendar size={16} color="var(--color-primary-600)" style={{ marginTop: '2px' }} />
                    <div>
                      <div style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>Filing Date</div>
                      <strong style={{ color: 'var(--color-text-main)' }}>
                        {new Date(complaint.createdAt).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <MapPin size={16} color="var(--color-accent-600)" style={{ marginTop: '2px' }} />
                    <div>
                      <div style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>Location & Address</div>
                      <strong style={{ color: 'var(--color-text-main)' }}>{complaint.address || complaint.location}</strong>
                      <div style={{ fontSize: '11.5px', color: 'var(--color-text-subtle)' }}>{complaint.location}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <Building size={16} color="var(--color-primary-700)" style={{ marginTop: '2px' }} />
                    <div>
                      <div style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>Responsible Department</div>
                      <strong style={{ color: 'var(--color-text-main)' }}>{complaint.department}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* When Resolved: Resolution Evidence Card */}
          {isResolved && (
            <Card
              style={{
                border: '2px solid #BBF7D0',
                backgroundColor: '#F0FDF4',
              }}
            >
              <Card.Header
                style={{
                  backgroundColor: '#DCFCE7',
                  borderBottom: '1px solid #BBF7D0',
                }}
                className="flex items-center justify-between"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#166534' }}>
                  <CheckCircle size={20} />
                  <h4 style={{ fontSize: '16px', fontWeight: '800' }}>Resolution Details & Ground Proof</h4>
                </div>
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: '700',
                    color: '#166534',
                    backgroundColor: '#FFFFFF',
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-full)',
                  }}
                >
                  Verified Resolved
                </span>
              </Card.Header>

              <Card.Body>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {complaint.resolvedDate && (
                    <div style={{ fontSize: '13px', color: '#166534' }}>
                      <strong>Resolved On:</strong>{' '}
                      {new Date(complaint.resolvedDate).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  )}

                  {complaint.resolutionNotes && (
                    <div
                      style={{
                        padding: '14px',
                        backgroundColor: '#FFFFFF',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid #BBF7D0',
                      }}
                    >
                      <h5 style={{ fontSize: '12.5px', fontWeight: '700', color: '#166534', textTransform: 'uppercase', marginBottom: '4px' }}>
                        Field Worker Resolution Notes
                      </h5>
                      <p style={{ fontSize: '14px', color: 'var(--color-text-main)', lineHeight: 1.5 }}>
                        {complaint.resolutionNotes}
                      </p>
                    </div>
                  )}

                  {complaint.resolutionImage && (
                    <div>
                      <h5 style={{ fontSize: '12.5px', fontWeight: '700', color: '#166534', textTransform: 'uppercase', marginBottom: '6px' }}>
                        Resolution Verification Photo
                      </h5>
                      <div
                        style={{
                          borderRadius: 'var(--radius-md)',
                          overflow: 'hidden',
                          border: '1px solid #BBF7D0',
                          maxHeight: '300px',
                        }}
                      >
                        <img
                          src={complaint.resolutionImage}
                          alt="Resolution evidence"
                          style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', display: 'block' }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>
          )}
        </div>

        {/* Right Col: 6-Stage Resolution Timeline & Assignment Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Assignment Info Card */}
          <Card header="Assignment Information" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13.5px' }}>
              <div>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>Department</span>
                <div style={{ fontWeight: '700', color: 'var(--color-primary-900)' }}>
                  {complaint.department}
                </div>
              </div>

              <div>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>Assigned Specialist</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                  <User size={15} color="var(--color-accent-600)" />
                  <span style={{ fontWeight: '600', color: 'var(--color-text-main)' }}>
                    {complaint.worker || 'Pending Assignment'}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* 6-Stage Resolution Timeline */}
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
                      paddingBottom: idx === ALL_TIMELINE_STAGES.length - 1 ? '0' : '24px',
                    }}
                  >
                    {/* Vertical Connector Line */}
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

                    {/* Step Icon Badge */}
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

                    {/* Step Info */}
                    <div style={{ flex: 1 }}>
                      <div className="flex items-center justify-between">
                        <h5
                          style={{
                            fontSize: '14px',
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

                      <p
                        style={{
                          fontSize: '12.5px',
                          color: isCompleted ? 'var(--color-text-muted)' : 'var(--color-text-subtle)',
                          marginTop: '2px',
                        }}
                      >
                        {itemData?.note || step.desc}
                      </p>

                      {itemData?.author && (
                        <div style={{ fontSize: '11.5px', color: 'var(--color-primary-700)', fontWeight: '600', marginTop: '2px' }}>
                          By: {itemData.author}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </CitizenLayout>
  );
}
