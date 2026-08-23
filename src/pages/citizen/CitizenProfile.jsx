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

// Helper to filter complaints belonging to this citizen
function isCitizenComplaint(c, user) {
  if (!user) return false;
  if (c.citizenId && user.id && c.citizenId === user.id) return true;
  if (user.username && c.citizenName?.toLowerCase() === user.username.toLowerCase()) return true;
  if (user.name && c.citizenName?.toLowerCase() === user.name.toLowerCase()) return true;
  if (user.email && c.citizenEmail?.toLowerCase() === user.email.toLowerCase()) return true;
  if (user.phone && c.citizenPhone && c.citizenPhone === user.phone) return true;
  return false;
}

export default function CitizenProfile() {
  const { user, logout } = useAuth();
  const { complaints } = useComplaints();
  const navigate = useNavigate();

  const [phone, setPhone] = useState(user?.phone || '+91 98765 43210');
  const [address, setAddress] = useState(user?.address || '42 Blossom Enclave, Sector 12, Municipal Zone');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const citizenComplaints = complaints.filter((c) => isCitizenComplaint(c, user));
  const totalCount = citizenComplaints.length;
  const inProgressCount = citizenComplaints.filter((c) => c.status === 'IN_PROGRESS' || c.status === 'ACCEPTED' || c.status === 'ASSIGNED').length;
  const resolvedCount = citizenComplaints.filter((c) => c.status === 'RESOLVED').length;

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
        {/* Profile Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Card style={{ padding: '28px', textAlign: 'center' }}>
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-primary-100)',
                color: 'var(--color-primary-700)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: '26px',
                fontWeight: '800',
              }}
            >
              {(user?.name || user?.username || 'C').charAt(0).toUpperCase()}
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--color-text-main)' }}>
              {user?.name || user?.username || 'Citizen User'}
            </h3>
            <p style={{ fontSize: '13.5px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
              @{user?.username || 'citizen'}
            </p>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 12px',
                backgroundColor: 'var(--color-accent-50)',
                border: '1px solid var(--color-accent-200)',
                borderRadius: 'var(--radius-full)',
                color: 'var(--color-accent-700)',
                fontSize: '12px',
                fontWeight: '700',
                marginTop: '12px',
              }}
            >
              <ShieldCheck size={14} /> Verified Citizen Account
            </div>

            {/* Lifetime Stats */}
            <div
              className="grid grid-cols-3 gap-2"
              style={{
                marginTop: '24px',
                paddingTop: '20px',
                borderTop: '1px solid var(--color-border)',
                textAlign: 'center',
              }}
            >
              <div>
                <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--color-primary-900)' }}>{totalCount}</div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: '600' }}>FILED</div>
              </div>
              <div>
                <div style={{ fontSize: '18px', fontWeight: '800', color: '#0284C7' }}>{inProgressCount}</div>
                <div style={{ fontSize: '11px', color: '#0284C7', fontWeight: '600' }}>ACTIVE</div>
              </div>
              <div>
                <div style={{ fontSize: '18px', fontWeight: '800', color: '#16A34A' }}>{resolvedCount}</div>
                <div style={{ fontSize: '11px', color: '#16A34A', fontWeight: '600' }}>RESOLVED</div>
              </div>
            </div>
          </Card>

          <Card style={{ padding: '20px' }}>
            <Button
              variant="outline"
              fullWidth
              onClick={handleLogout}
              iconStart={<LogOut size={16} />}
              style={{ color: '#DC2626', borderColor: '#FECACA' }}
            >
              Sign Out of Citizen Portal
            </Button>
          </Card>
        </div>

        {/* Edit Form */}
        <div style={{ gridColumn: 'span 2' }}>
          <Card style={{ padding: '28px' }}>
            <h4 style={{ fontSize: '17px', fontWeight: '800', marginBottom: '20px', color: 'var(--color-text-main)' }}>
              Registered Citizen Details
            </h4>

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
                  gap: '6px',
                  marginBottom: '18px',
                }}
              >
                <CheckCircle2 size={16} />
                <span>Profile details updated successfully!</span>
              </div>
            )}

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <Input
                label="Full Name"
                value={user?.name || user?.username || ''}
                iconStart={<User size={18} />}
                disabled
                helperText="Name registered during account creation"
              />

              <Input
                label="Registered Email Address"
                value={user?.email || 'citizen@example.com'}
                iconStart={<Mail size={18} />}
                disabled
                helperText="Primary email for grievance notifications and status updates"
              />

              <Input
                label="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                iconStart={<Phone size={18} />}
                required
              />

              <Input
                label="Residential Zone / Street Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                iconStart={<MapPin size={18} />}
                required
                helperText="Default address used for municipal dispatch routing"
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <Button type="submit" variant="primary" iconStart={<Save size={16} />}>
                  Save Changes
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </CitizenLayout>
  );
}
