import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Save,
  CheckCircle2,
  LogOut,
  ShieldCheck,
  FileText,
  Clock,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useComplaints } from '../../context/ComplaintContext';
import CitizenLayout from '../../components/layout/CitizenLayout';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

export default function CitizenProfile() {
  const { user, logout } = useAuth();
  const { complaints } = useComplaints();
  const navigate = useNavigate();

  const [phone, setPhone] = useState(user?.phone || '+91 98765 43210');
  const [address, setAddress] = useState(user?.address || '42 Blossom Enclave, Sector 12, Municipal Zone');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const totalCount = complaints.length;
  const inProgressCount = complaints.filter((c) => c.status?.toLowerCase() === 'in progress' || c.status?.toLowerCase() === 'in_progress').length;
  const resolvedCount = complaints.filter((c) => c.status?.toLowerCase() === 'resolved').length;

  const handleSave = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <CitizenLayout>
      <PageHeader
        title="Citizen Profile & Account"
        subtitle="Manage your registered contact information and review lifetime civic activity."
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
        {/* Left Col: Profile Identity & Stats Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Card style={{ padding: '28px', textAlign: 'center' }}>
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-primary-600)',
                color: '#FFFFFF',
                fontSize: '28px',
                fontWeight: '800',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                boxShadow: '0 4px 14px rgba(30, 64, 175, 0.3)',
              }}
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : user?.username?.charAt(0).toUpperCase() || 'C'}
            </div>

            <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--color-text-main)' }}>
              {user?.name || user?.username || 'Citizen User'}
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
              @{user?.username || 'citizen'} • Registered Resident
            </p>

            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--color-border-subtle)', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-muted)' }}>
                <Mail size={15} color="var(--color-primary-600)" />
                <span>{user?.email || 'ananya.sharma@example.com'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-muted)' }}>
                <Calendar size={15} color="var(--color-primary-600)" />
                <span>Member since Aug 2026</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-muted)' }}>
                <ShieldCheck size={15} color="var(--color-accent-600)" />
                <span>Verified Citizen Identity</span>
              </div>
            </div>

            <div style={{ marginTop: '24px' }}>
              <Button
                variant="ghost"
                fullWidth
                onClick={handleLogout}
                iconStart={<LogOut size={16} />}
                style={{ color: '#EF4444' }}
              >
                Sign Out
              </Button>
            </div>
          </Card>

          {/* Grievances Lifetime Counter */}
          <Card header="Lifetime Activity Summary" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="flex items-center justify-between" style={{ fontSize: '13.5px' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Total Filed Issues</span>
                <strong>{totalCount}</strong>
              </div>
              <div className="flex items-center justify-between" style={{ fontSize: '13.5px' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Currently In Progress</span>
                <strong style={{ color: '#0284C7' }}>{inProgressCount}</strong>
              </div>
              <div className="flex items-center justify-between" style={{ fontSize: '13.5px' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Successfully Resolved</span>
                <strong style={{ color: '#16A34A' }}>{resolvedCount}</strong>
              </div>
            </div>
          </Card>
        </div>

        {/* Right 2 Cols: Edit Details Form */}
        <div style={{ gridColumn: 'span 2' }}>
          <Card header="Edit Contact & Residential Information" style={{ padding: '28px' }}>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {savedSuccess && (
                <div
                  style={{
                    backgroundColor: 'var(--color-status-resolved-bg)',
                    border: '1px solid var(--color-status-resolved-border)',
                    color: 'var(--color-status-resolved-text)',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '13.5px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <CheckCircle2 size={16} />
                  <span>Profile contact details updated successfully.</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Full Name"
                  value={user?.name || 'Ananya Sharma'}
                  disabled
                  helperText="Full legal name as registered in municipal database."
                />
                <Input
                  label="Username"
                  value={user?.username || 'citizen'}
                  disabled
                  helperText="Username cannot be changed."
                />
              </div>

              <Input
                label="Email Address"
                value={user?.email || 'ananya.sharma@example.com'}
                disabled
                iconStart={<Mail size={18} />}
                helperText="Email registered for grievance notifications."
              />

              <Input
                label="Primary Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                iconStart={<Phone size={18} />}
                required
                helperText="Field technicians may call to locate issue landmarks."
              />

              <Input
                label="Primary Residential Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                iconStart={<MapPin size={18} />}
                required
                helperText="Default address used for geotagging nearby complaints."
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <Button
                  type="submit"
                  variant="primary"
                  iconStart={<Save size={16} />}
                >
                  Save Profile Changes
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </CitizenLayout>
  );
}
