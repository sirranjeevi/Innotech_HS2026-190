import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HardHat, Phone, Mail, MapPin, Wrench, CheckCircle, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useComplaints } from '../../context/ComplaintContext';
import WorkerLayout from '../../components/layout/WorkerLayout';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

export default function WorkerProfile() {
  const { user, logout } = useAuth();
  const { complaints } = useComplaints();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const resolvedCount = complaints.filter(
    (c) => (c.worker === user?.name || c.worker?.includes('Rajesh')) && c.status === 'Resolved'
  ).length;

  const activeCount = complaints.filter(
    (c) => (c.worker === user?.name || c.worker?.includes('Rajesh')) && c.status !== 'Resolved'
  ).length;

  return (
    <WorkerLayout>
      <PageHeader
        title="Field Technician Credentials"
        subtitle="Field specialization, assigned municipal zone, and duty status."
      />

      <div className="grid grid-cols-3 gap-6">
        {/* Left Col: Worker Badge */}
        <Card style={{ padding: '28px', textAlign: 'center' }}>
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              backgroundColor: '#0284C7',
              color: '#FFFFFF',
              fontSize: '28px',
              fontWeight: '800',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: '0 4px 14px rgba(2, 132, 199, 0.3)',
            }}
          >
            W
          </div>

          <h3 style={{ fontSize: '19px', fontWeight: '800', color: 'var(--color-text-main)' }}>
            {user?.name || 'Rajesh Kumar (Field Specialist)'}
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
            {user?.zone || 'North District Zone 4'} • Roads & Civil Repairs
          </p>

          <div
            style={{
              marginTop: '20px',
              paddingTop: '16px',
              borderTop: '1px solid var(--color-border-subtle)',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              fontSize: '13px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={15} color="var(--color-primary-600)" />
              <span>{user?.email || 'rajesh.worker@civic.gov'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Phone size={15} color="var(--color-primary-600)" />
              <span>{user?.phone || '+91 98765 00002'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={15} color="var(--color-accent-600)" />
              <span>Depot #4, North Ward</span>
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

        {/* Right Info Form & Lifetime Metrics */}
        <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Card header="Field Duty & Equipment Allocation" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Technician Name"
                  value={user?.name || 'Rajesh Kumar'}
                  disabled
                />
                <Input
                  label="Specialist ID"
                  value={user?.username || 'worker'}
                  disabled
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Assigned Department"
                  value="Roads & Infrastructure Maintenance"
                  disabled
                />
                <Input
                  label="Primary Zone"
                  value={user?.zone || 'North District Zone 4'}
                  disabled
                />
              </div>

              <div
                style={{
                  padding: '16px',
                  backgroundColor: 'var(--color-primary-50)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-primary-200)',
                  fontSize: '13px',
                }}
              >
                <div style={{ fontWeight: '700', color: 'var(--color-primary-950)', marginBottom: '4px' }}>
                  Field Specialization: Bitumen Patching, Road Leveling & Culverts
                </div>
                Mobile equipment unit #04 with heavy compactor and rapid asphalt mixer assigned.
              </div>
            </div>
          </Card>

          {/* Jobs Metric */}
          <div className="grid grid-cols-2 gap-4">
            <Card style={{ padding: '20px', textAlign: 'center' }}>
              <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: '700' }}>ACTIVE TASKS</p>
              <h3 style={{ fontSize: '26px', fontWeight: '800', color: '#0284C7', marginTop: '4px' }}>{activeCount}</h3>
            </Card>

            <Card style={{ padding: '20px', textAlign: 'center' }}>
              <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: '700' }}>JOBS RESOLVED</p>
              <h3 style={{ fontSize: '26px', fontWeight: '800', color: '#16A34A', marginTop: '4px' }}>{resolvedCount}</h3>
            </Card>
          </div>
        </div>
      </div>
    </WorkerLayout>
  );
}
