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
  ShieldCheck,
  UserCheck,
  Send,
  Sparkles,
  Phone,
  Mail,
  AlertCircle,
  AlertTriangle
} from 'lucide-react';
import { useComplaints } from '../../context/ComplaintContext';
import AdminLayout from '../../components/layout/AdminLayout';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import OpenStreetMapComponent from '../../components/common/OpenStreetMapComponent';

const TIMELINE_STAGES = [
  { key: 'createdAt', stage: 'SUBMITTED', title: 'Complaint Registered', desc: 'Grievance submitted with geotagged coordinates' },
  { key: 'verifiedAt', stage: 'VERIFIED', title: 'Municipal Verification', desc: 'Validated and duplicate checks completed' },
  { key: 'assignedAt', stage: 'ASSIGNED', title: 'Work Order Assigned', desc: 'Routed to respective municipal department' },
  { key: 'acceptedAt', stage: 'ACCEPTED', title: 'Task Accepted', desc: 'Field technician accepted the work order' },
  { key: 'startedAt', stage: 'IN_PROGRESS', title: 'Field Work In Progress', desc: 'Active repair / clearance underway on site' },
  { key: 'resolvedAt', stage: 'RESOLVED', title: 'Resolution Complete', desc: 'Resolution verified with ground evidence' },
];

export default function AdminComplaintDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getComplaintById, verifyComplaint, assignDepartmentAndWorker, departments, workers } = useComplaints();

  const complaint = getComplaintById(id);

  const [selectedDept, setSelectedDept] = useState(complaint?.departmentName || departments[0]?.name);
  const [selectedWorker, setSelectedWorker] = useState(
    complaint?.workerName && complaint?.workerName !== 'Unassigned'
      ? complaint?.workerName
      : workers[0]?.name
  );
  const [actionSuccess, setActionSuccess] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!complaint) {
    return (
      <AdminLayout>
        <div style={{ padding: '60px 20px', textAlign: 'center' }}>
          <EmptyState
            title="Complaint Not Found"
            description={`No grievance found with tracking ID "${id}".`}
            action={
              <Link to="/admin/complaints">
                <Button variant="primary" iconStart={<ArrowLeft size={16} />}>
                  Back to All Complaints
                </Button>
              </Link>
            }
          />
        </div>
      </AdminLayout>
    );
  }

  const isSubmitted = complaint.status === 'SUBMITTED';
  const isVerified = complaint.status === 'VERIFIED';
  const isResolved = complaint.status === 'RESOLVED';

  const stageOrder = ['SUBMITTED', 'VERIFIED', 'ASSIGNED', 'ACCEPTED', 'IN_PROGRESS', 'RESOLVED'];
  const currentIndex = stageOrder.indexOf(complaint.status);

  const handleVerify = async () => {
    setIsProcessing(true);
    try {
      await verifyComplaint(complaint.complaintNumber || complaint.id);
      setActionSuccess('Grievance marked as VERIFIED and approved for departmental allocation.');
      setTimeout(() => setActionSuccess(''), 4000);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedDept || !selectedWorker) return;
    setIsProcessing(true);
    try {
      await assignDepartmentAndWorker(
        complaint.complaintNumber || complaint.id,
        selectedDept,
        selectedWorker
      );
      setActionSuccess(`Work order assigned to ${selectedDept} (${selectedWorker}). Status: ASSIGNED.`);
      setTimeout(() => setActionSuccess(''), 4000);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AdminLayout>
      <PageHeader
        title={`Grievance Audit: #${complaint.complaintNumber || complaint.id}`}
        subtitle="Review evidence, verify validity, and assign municipal workforce resources."
        breadcrumbs={
          <Link
            to="/admin/complaints"
            style={{ fontSize: '13px', color: 'var(--color-primary-600)', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}
          >
            <ArrowLeft size={14} /> Back to Complaints List
          </Link>
        }
        badge={<StatusBadge status={complaint.status} pulse={isSubmitted} />}
      />

      {/* Prominent Duplicate Alert Banner */}
      {complaint.isPossibleDuplicate && (
        <div
          style={{
            padding: '14px 20px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: '#FEF3C7',
            border: '1.5px solid #F59E0B',
            color: '#92400E',
            fontSize: '14px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '20px',
          }}
        >
          <AlertTriangle size={20} color="#D97706" />
          <div style={{ flex: 1 }}>
            <strong>Possible Duplicate Detected:</strong> A similar grievance (<strong>#{complaint.duplicateMatchedNumber || 'Previous Record'}</strong>) was registered in this vicinity. Please cross-verify to avoid duplicate dispatch.
          </div>
        </div>
      )}

      {/* Action Flash Notice */}
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
        {/* Left 2 Cols: Details, Evidence, Citizen Info, Map */}
        <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <Card>
            <Card.Header className="flex items-center justify-between">
              <div>
                <span className="complaint-id">#{complaint.complaintNumber || complaint.id}</span>
                <h3 style={{ fontSize: '18px', fontWeight: '800', marginTop: '4px' }}>
                  {complaint.category} Grievance
                </h3>
              </div>
              <StatusBadge status={complaint.status} />
            </Card.Header>

            <Card.Body>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <h5 style={{ fontSize: '12.5px', fontWeight: '700', color: 'var(--color-text-subtle)', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Citizen Description
                  </h5>
                  <p style={{ fontSize: '14.5px', color: 'var(--color-text-main)', lineHeight: 1.6 }}>
                    {complaint.description}
                  </p>
                </div>

                {/* Citizen Photo Evidence */}
                {complaint.imageUrl && (
                  <div>
                    <h5 style={{ fontSize: '12.5px', fontWeight: '700', color: 'var(--color-text-subtle)', textTransform: 'uppercase', marginBottom: '8px' }}>
                      Citizen Uploaded Photo Evidence
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
                        src={complaint.imageUrl}
                        alt="Evidence"
                        style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', display: 'block' }}
                      />
                    </div>
                  </div>
                )}

                {/* Citizen Details Card */}
                <div
                  style={{
                    padding: '16px',
                    backgroundColor: 'var(--color-bg-subtle)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <h5 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-primary-900)', marginBottom: '10px' }}>
                    Citizen Contact Information
                  </h5>
                  <div className="grid grid-cols-2 gap-3" style={{ fontSize: '13px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <User size={15} color="var(--color-primary-600)" />
                      <span>Name: <strong>{complaint.citizenName || 'Resident'}</strong></span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Phone size={15} color="var(--color-primary-600)" />
                      <span>Phone: <strong>{complaint.citizenPhone || '+91 98765 43210'}</strong></span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={15} color="var(--color-primary-600)" />
                      <span>Location: <strong>{complaint.address}</strong></span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={15} color="var(--color-primary-600)" />
                      <span>Filing Date: <strong>{new Date(complaint.createdAt).toLocaleDateString()}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Geotagged Site Coordinates OpenStreetMap */}
                <div>
                  <h5 style={{ fontSize: '12.5px', fontWeight: '700', color: 'var(--color-text-subtle)', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Geotagged Site OpenStreetMap
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
        </div>

        {/* Right Col: Admin Action Panel & 6-Stage Timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Admin Operations Panel */}
          <Card header="Admin Action Panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Step 1: If SUBMITTED -> Verify Complaint */}
              {isSubmitted && (
                <div style={{ padding: '14px', backgroundColor: '#FEF3C7', borderRadius: 'var(--radius-md)', border: '1px solid #FDE68A' }}>
                  <h5 style={{ fontSize: '13.5px', fontWeight: '700', color: '#92400E', marginBottom: '4px' }}>
                    1. Verification Pending
                  </h5>
                  <p style={{ fontSize: '12.5px', color: '#78350F', marginBottom: '12px' }}>
                    Validate this grievance before dispatching municipal workers.
                  </p>
                  <Button
                    variant="primary"
                    size="sm"
                    fullWidth
                    loading={isProcessing}
                    onClick={handleVerify}
                    iconStart={<ShieldCheck size={16} />}
                  >
                    Verify & Approve Complaint
                  </Button>
                </div>
              )}

              {/* Step 2: Assign Department + Worker */}
              <form onSubmit={handleAssign} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h5 style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--color-text-main)' }}>
                  Work Order Allocation
                </h5>

                <Select
                  label="Assign Department"
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  options={departments.map((d) => ({ value: d.name, label: d.name }))}
                  required
                />

                <Select
                  label="Assign Field Specialist"
                  value={selectedWorker}
                  onChange={(e) => setSelectedWorker(e.target.value)}
                  options={workers.map((w) => ({ value: w.name, label: `${w.name} (${w.zone})` }))}
                  required
                />

                <Button
                  type="submit"
                  variant="accent"
                  size="sm"
                  fullWidth
                  loading={isProcessing}
                  iconEnd={<Send size={15} />}
                  style={{ marginTop: '4px' }}
                >
                  {complaint.status === 'ASSIGNED' ? 'Update Allocation' : 'Dispatch Work Order'}
                </Button>
              </form>
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
    </AdminLayout>
  );
}
