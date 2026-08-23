import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Mail, Phone, Building, KeyRound, LogOut, Database, CheckCircle2, Sparkles, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useComplaints } from '../../context/ComplaintContext';
import AdminLayout from '../../components/layout/AdminLayout';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { isLiveFirebaseConfigured } from '../../firebase/firebase';
import { seedFirestoreDatabase } from '../../firebase/seedFirestore';

export default function AdminProfile() {
  const { user, logout } = useAuth();
  const { complaints } = useComplaints();
  const navigate = useNavigate();

  const [seeding, setSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState('');
  const isConnected = isLiveFirebaseConfigured();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSeedDatabase = async () => {
    setSeeding(true);
    setSeedResult('');
    try {
      const res = await seedFirestoreDatabase();
      if (res.success) {
        setSeedResult(res.message);
      } else {
        setSeedResult(res.message || res.error || 'Failed to seed database.');
      }
    } finally {
      setSeeding(false);
    }
  };

  return (
    <AdminLayout>
      <PageHeader
        title="Municipal Officer Profile"
        subtitle="Credentials, municipal division privileges, and Firebase Cloud database integration."
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

        {/* Right Info Form & Firebase Integration Card */}
        <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
                Municipal administrative accounts are managed through internal directory protocols. Real-time updates are synchronized across Firestore and all mobile and web clients.
              </div>
            </div>
          </Card>

          {/* Firebase Database Connection Card */}
          <Card header="Firebase Cloud Firestore Integration" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: isConnected ? '#DCFCE7' : 'var(--color-primary-50)',
                  border: `1px solid ${isConnected ? '#BBF7D0' : 'var(--color-primary-200)'}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Database size={20} color={isConnected ? '#166534' : 'var(--color-primary-700)'} />
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '14px', color: isConnected ? '#166534' : 'var(--color-primary-950)' }}>
                      {isConnected ? 'Firebase Firestore: Connected (Live Mode)' : 'Firebase Firestore: Ready (Local Reactive State Mode)'}
                    </div>
                    <div style={{ fontSize: '12px', color: isConnected ? '#15803D' : 'var(--color-text-muted)', marginTop: '2px' }}>
                      {isConnected
                        ? 'Connected to shared Firestore collections: `users`, `complaints`, `departments`, `notifications`.'
                        : 'To connect to your live Firebase project, add your keys in `.env` or `.env.local`.'}
                    </div>
                  </div>
                </div>

                <span
                  style={{
                    fontSize: '11.5px',
                    fontWeight: '700',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: isConnected ? '#16A34A' : 'var(--color-primary-600)',
                    color: '#FFFFFF',
                  }}
                >
                  {isConnected ? 'LIVE' : 'ACTIVE'}
                </span>
              </div>

              {seedResult && (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: '#F0FDF4',
                    border: '1px solid #BBF7D0',
                    color: '#166534',
                    fontSize: '13px',
                    fontWeight: '600',
                  }}
                >
                  {seedResult}
                </div>
              )}

              <div className="flex items-center justify-between">
                <span style={{ fontSize: '12.5px', color: 'var(--color-text-muted)' }}>
                  Collections Schema: <strong>users • complaints • departments • notifications</strong>
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  loading={seeding}
                  onClick={handleSeedDatabase}
                  iconStart={<RefreshCw size={14} />}
                >
                  Seed Firestore Schema
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
