import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Send,
  CheckCircle2,
  MapPin,
  FileText,
  Tag,
  ArrowRight,
  Sparkles,
  ArrowLeft,
  AlertCircle,
  PlusCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useComplaints } from '../../context/ComplaintContext';
import CitizenLayout from '../../components/layout/CitizenLayout';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import ImageUpload from '../../components/common/ImageUpload';
import MapPlaceholder from '../../components/common/MapPlaceholder';
import Modal from '../../components/common/Modal';

const CATEGORIES = [
  'Garbage',
  'Pothole',
  'Street Light',
  'Water Leakage',
  'Drainage',
  'Public Infrastructure',
  'Other',
];

export default function ReportIssue() {
  const { user } = useAuth();
  const { addComplaint } = useComplaints();
  const navigate = useNavigate();

  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [location, setLocation] = useState('12.9716° N, 77.5946° E');
  const [address, setAddress] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedComplaint, setSubmittedComplaint] = useState(null);

  const handleLocationChange = (coords, placeName) => {
    setLocation(coords);
    if (placeName && !address) {
      setAddress(placeName);
    }
  };

  const validate = () => {
    const errs = {};
    if (!category) errs.category = 'Please select a complaint category';
    if (!description.trim()) errs.description = 'Please describe the issue in detail';
    else if (description.trim().length < 10) errs.description = 'Description should be at least 10 characters';
    if (!address.trim()) errs.address = 'Please provide an address or landmark';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const newEntry = addComplaint({
        category,
        description,
        image,
        location,
        address,
        citizenName: user?.name || user?.username || 'Citizen',
        citizenId: user?.id,
      });

      setIsSubmitting(false);
      setSubmittedComplaint(newEntry);
    }, 500);
  };

  const handleResetForm = () => {
    setCategory('');
    setDescription('');
    setImage(null);
    setAddress('');
    setErrors({});
    setSubmittedComplaint(null);
  };

  return (
    <CitizenLayout>
      <PageHeader
        title="Report a Civic Issue"
        subtitle="Lodge a municipal grievance with geotagged location and photo evidence for immediate departmental action."
        breadcrumbs={
          <Link
            to="/citizen/dashboard"
            style={{ fontSize: '13px', color: 'var(--color-primary-600)', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </Link>
        }
      />

      <div className="grid grid-cols-3 gap-6">
        {/* Left 2 Cols: Form */}
        <div style={{ gridColumn: 'span 2' }}>
          <Card style={{ padding: '30px' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              {/* Category */}
              <Select
                label="Complaint Category"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  if (errors.category) setErrors((prev) => ({ ...prev, category: '' }));
                }}
                options={CATEGORIES.map((c) => ({ value: c, label: c }))}
                placeholder="Choose category (e.g. Pothole, Street Light, Garbage)"
                error={errors.category}
                required
              />

              {/* Description */}
              <div className="form-group">
                <label className="form-label">
                  <span>
                    Issue Description <span className="required-mark">*</span>
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-subtle)', fontWeight: 'normal' }}>
                    {description.length}/500
                  </span>
                </label>
                <textarea
                  className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                  rows={4}
                  placeholder="Describe the issue, landmarks, hazard level, and exact surroundings..."
                  value={description}
                  maxLength={500}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    if (errors.description) setErrors((prev) => ({ ...prev, description: '' }));
                  }}
                  required
                />
                {errors.description && (
                  <div className="form-error">
                    <AlertCircle size={14} />
                    <span>{errors.description}</span>
                  </div>
                )}
              </div>

              {/* Image Upload */}
              <ImageUpload
                value={image}
                onChange={(imgData) => setImage(imgData)}
                label="Attach Photo Evidence"
                helperText="Upload clear ground photo of the problem for municipal verification."
              />

              {/* Address Input */}
              <Input
                label="Location Landmark / Address"
                placeholder="e.g. Near Blossom Enclave Gate 2, Sector 12"
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  if (errors.address) setErrors((prev) => ({ ...prev, address: '' }));
                }}
                iconStart={<MapPin size={18} />}
                error={errors.address}
                required
              />

              {/* Map Geotagging Placeholder */}
              <div className="form-group">
                <label className="form-label">GPS Geotagging & Map Verification</label>
                <MapPlaceholder
                  location={location}
                  address={address}
                  onLocationChange={handleLocationChange}
                />
              </div>

              {/* Submit Button */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <Button
                  type="submit"
                  variant="accent"
                  size="lg"
                  loading={isSubmitting}
                  iconEnd={<Send size={18} />}
                  style={{ flex: 1 }}
                >
                  Submit Complaint
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="lg"
                  onClick={() => navigate('/citizen/dashboard')}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Right Col: Guidelines & Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Card header="Submission Guidelines" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13.5px', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ color: 'var(--color-primary-600)', fontWeight: '700' }}>1.</div>
                <div>
                  <strong style={{ color: 'var(--color-text-main)' }}>Select Accurate Category:</strong> Routes the complaint directly to the responsible municipal department.
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ color: 'var(--color-primary-600)', fontWeight: '700' }}>2.</div>
                <div>
                  <strong style={{ color: 'var(--color-text-main)' }}>Include Landmark:</strong> Mention street corners, shop names, or pole numbers for field crew identification.
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ color: 'var(--color-primary-600)', fontWeight: '700' }}>3.</div>
                <div>
                  <strong style={{ color: 'var(--color-text-main)' }}>Photo Verification:</strong> Photos allow municipal supervisors to dispatch the right repair tools immediately.
                </div>
              </div>
            </div>
          </Card>

          <Card style={{ padding: '20px', backgroundColor: 'var(--color-primary-50)', borderColor: 'var(--color-primary-200)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Sparkles size={18} color="var(--color-primary-700)" />
              <h5 style={{ fontSize: '14.5px', fontWeight: '700', color: 'var(--color-primary-950)' }}>
                Real-Time Tracking
              </h5>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
              Once submitted, you will receive a unique tracking ID to monitor every stage from verification to resolution.
            </p>
          </Card>
        </div>
      </div>

      {/* Submission Success Modal */}
      {submittedComplaint && (
        <Modal
          isOpen={!!submittedComplaint}
          onClose={() => setSubmittedComplaint(null)}
          title="Complaint Submitted Successfully"
          maxWidth="500px"
          footer={
            <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
              <Button
                variant="accent"
                fullWidth
                iconEnd={<ArrowRight size={16} />}
                onClick={() => navigate(`/citizen/complaints/${submittedComplaint.id}`)}
              >
                Track Complaint
              </Button>
              <Button
                variant="secondary"
                onClick={handleResetForm}
                iconStart={<PlusCircle size={16} />}
              >
                Report Another
              </Button>
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '16px', padding: '10px 0' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-status-resolved-bg)',
                color: '#16A34A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(22, 163, 74, 0.25)',
              }}
            >
              <CheckCircle2 size={36} />
            </div>

            <div>
              <h4 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--color-text-main)' }}>
                Grievance Registered
              </h4>
              <p style={{ fontSize: '13.5px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                Your complaint has been queued for municipal verification and assigned a tracking ID.
              </p>
            </div>

            <div
              style={{
                width: '100%',
                padding: '16px',
                backgroundColor: 'var(--color-bg-subtle)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                textAlign: 'left',
              }}
            >
              <div className="flex items-center justify-between">
                <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Complaint ID:</span>
                <span className="complaint-id" style={{ fontSize: '14px', padding: '4px 10px' }}>
                  #{submittedComplaint.id}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Current Status:</span>
                <StatusBadge status="Submitted" pulse />
              </div>

              <div className="flex items-center justify-between">
                <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Category:</span>
                <strong style={{ fontSize: '13px' }}>{submittedComplaint.category}</strong>
              </div>

              <div className="flex items-center justify-between">
                <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Department:</span>
                <span style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--color-primary-700)' }}>
                  {submittedComplaint.department}
                </span>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </CitizenLayout>
  );
}
