import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Mail, Phone, Building, KeyRound, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useComplaints } from '../../context/ComplaintContext';
import AdminLayout from '../../components/layout/AdminLayout';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

export default function AdminProfile() {
  const { user, logout } = useAuth();
  const { complaints } = useComplaints();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <AdminLayout>
      <PageHeader
        title="Municipal Officer Profile"
        subtitle="Credentials, municipal division privileges, and administrative security profile."
      />

      <div className="grid grid-cols-3 gap-6">
        {/* Left Identity Card */}
        <Card style={{ padding: '28px', textAlign: 'center' }}>
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              backgroundColor: '#92400E',
              color: '#FFFFFF',
              fontSize: '28px',
              fontWeight: '800',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: '0 4px 14px rgba(146, 64, 14, 0.3)',
            }}
          >
            A
          </div>

          <h3 style={{ fontSize: '19px', fontWeight: '800', color: 'var(--color-text-main)' }}>
            {user?.name || 'Municipal Admin Officer'}
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
            Municipal Operations Authority • Central Ward
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
              <span>{user?.email || 'admin@civic.gov'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Phone size={15} color="var(--color-primary-600)" />
              <span>{user?.phone || '+91 98765 00001'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building size={15} color="var(--color-primary-600)" />
              <span>Municipal Operations Directorate</span>
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

        {/* Right Info Form */}
        <div style={{ gridColumn: 'span 2' }}>
          <Card header="Administrative Credentials & System Authority" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Official Name"
                  value={user?.name || 'Municipal Admin Officer'}
                  disabled
                />
                <Input
                  label="Admin Username"
                  value={user?.username || 'admin'}
                  disabled
                />
              </div>

              <Input
                label="Municipal Work Email"
                value={user?.email || 'admin@civic.gov'}
                disabled
                iconStart={<Mail size={18} />}
              />

              <div
                style={{
                  padding: '16px',
                  backgroundColor: '#FEF3C7',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid #FDE68A',
                  fontSize: '13px',
                  color: '#92400E',
                }}
              >
                <div style={{ fontWeight: '700', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={16} />
                  <span>Security Notice</span>
                </div>
                Municipal administrative accounts are managed through encrypted internal directory protocols. To update root authority keys, contact the municipal IT security office.
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
