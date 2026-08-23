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
  Wrench,
  CheckCircle,
  FileText,
  AlertCircle
} from 'lucide-react';
import { useComplaints } from '../../context/ComplaintContext';
import CitizenLayout from '../../components/layout/CitizenLayout';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import OpenStreetMapComponent from '../../components/common/OpenStreetMapComponent';

const TIMELINE_STAGES = [
  { key: 'createdAt', stage: 'SUBMITTED', title: 'Complaint Registered', desc: 'Grievance submitted with geotagged coordinates' },
  { key: 'verifiedAt', stage: 'VERIFIED', title: 'Municipal Verification', desc: 'Verified by municipal officer & approved for work dispatch' },
  { key: 'assignedAt', stage: 'ASSIGNED', title: 'Work Order Assigned', desc: 'Dispatched to specialized municipal division' },
  { key: 'acceptedAt', stage: 'ACCEPTED', title: 'Task Accepted', desc: 'Field technician acknowledged work order and mobilized equipment' },
  { key: 'startedAt', stage: 'IN_PROGRESS', title: 'Field Work In Progress', desc: 'Field crew arrived on site; active repair underway' },
  { key: 'resolvedAt', stage: 'RESOLVED', title: 'Grievance Resolved', desc: 'Repairs completed and ground verified with photo proof' },
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
            title="Grievance Not Found"
            description={`Could not find any complaint record matching #${id}.`}
            action={
              <Link to="/citizen/complaints">
                <Button variant="primary" iconStart={<ArrowLeft size={16} />}>
                  Back to Complaints
                </Button>
              </Link>
            }
          />
        </div>
      </CitizenLayout>
    );
  }

  const isResolved = complaint.status === 'RESOLVED';
  const stageOrder = ['SUBMITTED', 'VERIFIED', 'ASSIGNED', 'ACCEPTED', 'IN_PROGRESS', 'RESOLVED'];
  const currentIndex = stageOrder.indexOf(complaint.status);

  return (
    <CitizenLayout>
      <PageHeader
        title={`Grievance #${complaint.complaintNumber || complaint.id}`}
        subtitle="Real-time municipal audit trail, department assignment, and resolution verification."
        breadcrumbs={
          <Link
            to="/citizen/complaints"
            style={{ fontSize: '13px', color: 'var(--color-primary-600)', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}
          >
            <ArrowLeft size={14} /> Back to My Complaints
          </Link>
        }
        badge={<StatusBadge status={complaint.status} pulse={complaint.status === 'IN_PROGRESS'} />}
      />

      <div className="grid grid-cols-3 gap-6">
        {/* Left 2 Cols: Details, Evidence, Geotag */}
        <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Main Complaint Overview Card */}
          <Card>
            <Card.Header className="flex items-center justify-between">
              <div>
                <span className="complaint-id">#{complaint.complaintNumber || complaint.id}</span>
                <h3 style={{ fontSize: '18px', fontWeight: '800', marginTop: '4px' }}>
                  {complaint.category} Issue at {complaint.address?.split(',')[0]}
                </h3>
              </div>
              <StatusBadge status={complaint.status} />
            </Card.Header>

            <Card.Body>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <h5 style={{ fontSize: '12.5px', fontWeight: '700', color: 'var(--color-text-subtle)', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Issue Description
                  </h5>
                  <p style={{ fontSize: '14.5px', color: 'var(--color-text-main)', lineHeight: 1.6 }}>
                    {complaint.description}
                  </p>
                </div>

                {/* Citizen Photo Evidence */}
                {complaint.imageUrl && (
                  <div>
                    <h5 style={{ fontSize: '12.5px', fontWeight: '700', color: 'var(--color-text-subtle)', textTransform: 'uppercase', marginBottom: '8px' }}>
                      Citizen Uploaded Evidence Photo
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
                        src={complaint.imageUrl}
                        alt="Evidence"
                        style={{ width: '100%', maxHeight: '320px', objectFit: 'cover', display: 'block' }}
                      />
                    </div>
                  </div>
                )}

                {/* Site Geotag OpenStreetMap */}
                <div>
                  <h5 style={{ fontSize: '12.5px', fontWeight: '700', color: 'var(--color-text-subtle)', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Site Geotag OpenStreetMap
                  </h5>
                  <OpenStreetMapComponent
                    mode="single"
                    latitude={complaint.latitude}
                    longitude={complaint.longitude}
                    address={complaint.address}
                    height="200px"
                  />
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Resolution Evidence Card (When Resolved) */}
          {isResolved && (
            <Card style={{ border: '2px solid #BBF7D0', backgroundColor: '#F0FDF4' }}>
              <Card.Header style={{ backgroundColor: '#DCFCE7', borderBottom: '1px solid #BBF7D0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#166534' }}>
                  <CheckCircle size={20} />
                  <h4 style={{ fontSize: '16px', fontWeight: '800' }}>Resolution Verified & Ground Repairs Completed</h4>
                </div>
              </Card.Header>

              <Card.Body>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ fontSize: '13px', color: '#166534' }}>
                    <strong>Resolved Date:</strong> {complaint.resolvedAt ? new Date(complaint.resolvedAt).toLocaleString() : 'Recently Completed'}
                  </div>

                  {complaint.resolutionNotes && (
                    <div style={{ padding: '14px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-md)', border: '1px solid #BBF7D0' }}>
                      <h5 style={{ fontSize: '12px', fontWeight: '700', color: '#166534', textTransform: 'uppercase', marginBottom: '4px' }}>
                        Field Technician Resolution Notes
                      </h5>
                      <p style={{ fontSize: '13.5px', color: 'var(--color-text-main)' }}>{complaint.resolutionNotes}</p>
                    </div>
                  )}

                  {complaint.resolutionImageUrl && (
                    <div>
                      <h5 style={{ fontSize: '12px', fontWeight: '700', color: '#166534', textTransform: 'uppercase', marginBottom: '6px' }}>
                        Resolution Ground Photo Evidence
                      </h5>
                      <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid #BBF7D0', maxHeight: '300px' }}>
                        <img src={complaint.resolutionImageUrl} alt="Resolution proof" style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', display: 'block' }} />
                      </div>
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>
          )}
        </div>

        {/* Right Col: Timeline & Municipal Allocation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Department & Worker Card */}
          <Card header="Municipal Allocation">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
              <div>
                <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '11px', fontWeight: '700' }}>DEPARTMENT</span>
                <strong style={{ color: 'var(--color-primary-800)' }}>{complaint.departmentName || 'Public Works'}</strong>
              </div>

              <div>
                <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '11px', fontWeight: '700' }}>ASSIGNED TECHNICIAN</span>
                <span style={{ color: complaint.workerName && complaint.workerName !== 'Unassigned' ? 'var(--color-text-main)' : '#94A3B8' }}>
                  {complaint.workerName || 'Unassigned'}
                </span>
              </div>
            </div>
          </Card>

          {/* 6-Stage Timeline */}
          <Card header="Resolution Stage Tracker" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
              {TIMELINE_STAGES.map((step, idx) => {
                const stepIndex = stageOrder.indexOf(step.stage);
                const isCompleted = stepIndex <= currentIndex && currentIndex !== -1;
                const isCurrentActive = stepIndex === currentIndex;
                const timestamp = complaint[step.key];

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
    </CitizenLayout>
  );
}
