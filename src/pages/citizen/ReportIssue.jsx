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
  PlusCircle,
  AlertTriangle
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
import GoogleMapComponent from '../../components/common/GoogleMapComponent';
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
  const [latitude, setLatitude] = useState(12.9716);
  const [longitude, setLongitude] = useState(77.5946);
  const [address, setAddress] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedComplaint, setSubmittedComplaint] = useState(null);

  const handleLocationChange = (lat, lng, addr) => {
    setLatitude(lat);
    setLongitude(lng);
    if (addr && !address) {
      setAddress(addr);
    }
  };

  const validate = () => {
    const errs = {};
    if (!category) errs.category = 'Please select a complaint category';
    if (!description.trim()) errs.description = 'Please describe the issue in detail';
    else if (description.trim().length < 5) errs.description = 'Description should be at least 5 characters';
    if (!address.trim()) errs.address = 'Please provide an address or landmark';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const newEntry = await addComplaint({
        category,
        description,
        image,
        latitude,
        longitude,
        address,
        citizenName: user?.name || user?.username || 'Resident Citizen',
        citizenId: user?.id || 'user-citizen-01',
        citizenPhone: user?.phone || '+91 98765 43210',
        citizenEmail: user?.email || 'citizen@example.com',
      });

      setSubmittedComplaint(newEntry);
    } catch (err) {
      console.error('Error submitting complaint:', err);
      alert('Encountered an issue submitting complaint. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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
        title="Report a Civic Grievance"
        subtitle="Lodge a municipal issue with GPS geotagged coordinates and photo evidence for immediate departmental action."
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
                placeholder="Choose category (e.g. Garbage, Pothole, Street Light, Water Leakage)"
                placeholderDisabled={true}
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
                  placeholder="Describe the issue, surrounding landmarks, hazard nature, and exact street location..."
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

              {/* Photo Evidence Upload */}
              <ImageUpload
                value={image}
                onChange={(imgData) => setImage(imgData)}
                label="Upload Complaint Image Evidence"
                helperText="Upload ground photograph of the issue for municipal verification."
              />

              {/* Address Input */}
              <Input
                label="Street Address / Landmark"
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

              {/* Google Maps Geotagging Component */}
              <div className="form-group">
                <label className="form-label">Google Maps Geotagging & Coordinate Lock</label>
                <GoogleMapComponent
                  mode="report"
                  latitude={latitude}
                  longitude={longitude}
                  address={address}
                  onLocationChange={handleLocationChange}
                  height="220px"
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

        {/* Right Col: Guidelines */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Card header="Civic Filing Guidelines" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13.5px', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ color: 'var(--color-primary-600)', fontWeight: '700' }}>1.</div>
                <div>
                  <strong style={{ color: 'var(--color-text-main)' }}>Automatic Department Routing:</strong> Selecting the correct category instantly alerts the assigned municipal division.
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ color: 'var(--color-primary-600)', fontWeight: '700' }}>2.</div>
                <div>
                  <strong style={{ color: 'var(--color-text-main)' }}>Precise Geotag:</strong> GPS coordinates enable technicians to navigate directly to the repair point.
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ color: 'var(--color-primary-600)', fontWeight: '700' }}>3.</div>
                <div>
                  <strong style={{ color: 'var(--color-text-main)' }}>Duplicate Matching:</strong> Similar grievances nearby are automatically cross-referenced for faster batch resolution.
                </div>
              </div>
            </div>
          </Card>

          <Card style={{ padding: '20px', backgroundColor: 'var(--color-primary-50)', borderColor: 'var(--color-primary-200)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Sparkles size={18} color="var(--color-primary-700)" />
              <h5 style={{ fontSize: '14.5px', fontWeight: '700', color: 'var(--color-primary-950)' }}>
                Firebase Cloud Sync
              </h5>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
              Your complaint is recorded with citizen contact info and immediately synchronized across Admin and Field Worker workstations in real time.
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
                onClick={() => navigate(`/citizen/complaints/${submittedComplaint.complaintNumber}`)}
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
                Your complaint has been queued for municipal verification and assigned a unique tracking number.
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
                <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Complaint Number:</span>
                <span className="complaint-id" style={{ fontSize: '14px', padding: '4px 10px' }}>
                  #{submittedComplaint.complaintNumber}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Status:</span>
                <StatusBadge status="SUBMITTED" pulse />
              </div>

              <div className="flex items-center justify-between">
                <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Category:</span>
                <strong style={{ fontSize: '13px' }}>{submittedComplaint.category}</strong>
              </div>

              <div className="flex items-center justify-between">
                <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Reported By:</span>
                <strong style={{ fontSize: '13px' }}>{submittedComplaint.citizenName} ({submittedComplaint.citizenPhone})</strong>
              </div>

              {/* If Duplicate Detected */}
              {submittedComplaint.isPossibleDuplicate && (
                <div
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#FEF3C7',
                    border: '1px solid #FDE68A',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '12px',
                    color: '#92400E',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <AlertTriangle size={14} />
                  <span>
                    Note: A similar issue (#{submittedComplaint.duplicateMatchedNumber}) was previously logged nearby. Your report has been tagged to assist municipal batch resolution.
                  </span>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </CitizenLayout>
  );
}
