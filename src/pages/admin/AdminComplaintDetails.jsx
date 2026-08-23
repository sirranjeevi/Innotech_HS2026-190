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
  AlertCircle
} from 'lucide-react';
import { useComplaints, MUNICIPAL_DEPARTMENTS, MUNICIPAL_WORKERS } from '../../context/ComplaintContext';
import AdminLayout from '../../components/layout/AdminLayout';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import MapPlaceholder from '../../components/common/MapPlaceholder';

const ALL_TIMELINE_STAGES = [
  { stage: 'Submitted', label: 'Submitted', desc: 'Complaint registered in municipal database' },
  { stage: 'Verified', label: 'Verified', desc: 'Validated and duplicate checks completed' },
  { stage: 'Assigned', label: 'Assigned', desc: 'Routed to respective municipal department' },
  { stage: 'Accepted', label: 'Accepted', desc: 'Field technician accepted the work order' },
  { stage: 'In Progress', label: 'In Progress', desc: 'Active repair / clearance underway on site' },
  { stage: 'Resolved', label: 'Resolved', desc: 'Resolution verified with ground evidence' },
];

export default function AdminComplaintDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getComplaintById, verifyComplaint, assignDepartmentAndWorker, departments, workers } = useComplaints();

  const complaint = getComplaintById(id);

  const [selectedDept, setSelectedDept] = useState(complaint?.department || MUNICIPAL_DEPARTMENTS[0]);
  const [selectedWorker, setSelectedWorker] = useState(
    complaint?.worker && complaint?.worker !== 'Unassigned' ? complaint?.worker : MUNICIPAL_WORKERS[0].name
  );
  const [actionSuccess, setActionSuccess] = useState('');

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

  const isSubmitted = complaint.status?.toLowerCase() === 'submitted';
  const isResolved = complaint.status?.toLowerCase() === 'resolved';

  const handleVerify = () => {
    verifyComplaint(complaint.id);
    setActionSuccess('Grievance marked as Verified and approved for departmental allocation.');
    setTimeout(() => setActionSuccess(''), 4000);
  };

  const handleAssign = (e) => {
    e.preventDefault();
    if (!selectedDept || !selectedWorker) return;
    assignDepartmentAndWorker(complaint.id, selectedDept, selectedWorker);
    setActionSuccess(`Work order assigned to ${selectedDept} (${selectedWorker}).`);
    setTimeout(() => setActionSuccess(''), 4000);
  };

  const getStageStatus = (stageName) => {
    const existing = complaint.timeline?.find(
      (t) => t.stage?.toLowerCase() === stageName.toLowerCase()
    );
    if (existing) return { status: 'completed', data: existing };

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
    <AdminLayout>
      <PageHeader
        title={`Grievance Audit: #${complaint.id}`}
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

      {/* Flash Success Notice */}
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
        {/* Left 2 Cols: Complaint Details, Citizen Profile, and Evidence */}
        <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Main Inspection Card */}
          <Card>
            <Card.Header className="flex items-center justify-between">
              <div>
                <span className="complaint-id">#{complaint.id}</span>
                <h3 style={{ fontSize: '18px', fontWeight: '800', marginTop: '4px' }}>
                  {complaint.title}
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
                {complaint.image && (
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
                        src={complaint.image}
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
                      <Mail size={15} color="var(--color-primary-600)" />
                      <span>Email: <strong>{complaint.citizenEmail || 'citizen@example.com'}</strong></span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={15} color="var(--color-primary-600)" />
                      <span>Filing Date: <strong>{new Date(complaint.createdAt).toLocaleDateString()}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Location Map Preview */}
                <div>
                  <h5 style={{ fontSize: '12.5px', fontWeight: '700', color: 'var(--color-text-subtle)', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Geotagged Location Coordinates
                  </h5>
                  <MapPlaceholder location={complaint.location} address={complaint.address} />
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
              {/* Action 1: Verify Complaint */}
              {isSubmitted && (
                <div style={{ padding: '14px', backgroundColor: '#FEF3C7', borderRadius: 'var(--radius-md)', border: '1px solid #FDE68A' }}>
                  <h5 style={{ fontSize: '13.5px', fontWeight: '700', color: '#92400E', marginBottom: '4px' }}>
                    1. Verification Pending
                  </h5>
                  <p style={{ fontSize: '12.5px', color: '#78350F', marginBottom: '12px' }}>
                    Validate this grievance against duplicate records before departmental allocation.
                  </p>
                  <Button
                    variant="primary"
                    size="sm"
                    fullWidth
                    onClick={handleVerify}
                    iconStart={<ShieldCheck size={16} />}
                  >
                    Verify & Approve Complaint
                  </Button>
                </div>
              )}

              {/* Action 2: Assign Department & Worker */}
              <form onSubmit={handleAssign} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h5 style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--color-text-main)' }}>
                  Work Order Allocation
                </h5>

                <Select
                  label="Assign Department"
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  options={departments.map((d) => ({ value: d, label: d }))}
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
                  iconEnd={<Send size={15} />}
                  style={{ marginTop: '4px' }}
                >
                  Update & Dispatch Work Order
                </Button>
              </form>
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

                      <p
                        style={{
                          fontSize: '12px',
                          color: isCompleted ? 'var(--color-text-muted)' : 'var(--color-text-subtle)',
                          marginTop: '2px',
                        }}
                      >
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
    </AdminLayout>
  );
}
