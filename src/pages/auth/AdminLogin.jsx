import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, User, ArrowRight, Sparkles, KeyRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/layout/Navbar';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

export default function AdminLogin() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please enter both admin username and password.');
      return;
    }

    const res = await login(username, password, 'admin');
    if (res.success) {
      navigate('/admin/dashboard');
    } else {
      setError(res.error || 'Invalid admin credentials');
    }
  };

  const handleFillDemo = () => {
    setUsername('admin');
    setPassword('admin123');
    setError('');
  };

  return (
    <div className="civic-bg-gradient" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
        }}
      >
        <div style={{ width: '100%', maxWidth: '440px' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: '#FEF3C7',
                color: '#92400E',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '12px',
                border: '1px solid #FDE68A',
              }}
            >
              <ShieldCheck size={26} />
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Admin Portal Access</h2>
            <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
              Municipal administration and complaint oversight
            </p>
          </div>

          <Card style={{ padding: '28px' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {error && (
                <div
                  style={{
                    backgroundColor: '#FEE2E2',
                    border: '1px solid #FECACA',
                    color: '#991B1B',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '13.5px',
                  }}
                >
                  {error}
                </div>
              )}

              <Input
                label="Admin Username"
                placeholder="Enter admin username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                iconStart={<User size={18} />}
                required
                autoComplete="username"
              />

              <Input
                label="Password"
                type="password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                iconStart={<Lock size={18} />}
                required
                autoComplete="current-password"
              />

              <Button
                type="submit"
                variant="primary"
                fullWidth
                size="lg"
                loading={loading}
                iconEnd={<ArrowRight size={18} />}
                style={{ backgroundColor: 'var(--color-primary-800)' }}
              >
                Authenticate as Admin
              </Button>

              {/* Prebuilt Demo Account Info */}
              <div
                style={{
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#FEF3C7',
                  border: '1px solid #FDE68A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                }}
              >
                <div>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#92400E' }}>
                    PREBUILT ADMIN ACCOUNT
                  </div>
                  <div style={{ fontSize: '12.5px', color: '#78350F', marginTop: '2px' }}>
                    Username: <strong>admin</strong> | Pass: <strong>admin123</strong>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleFillDemo}
                  className="btn btn-sm"
                  style={{
                    backgroundColor: '#92400E',
                    color: '#FFFFFF',
                    fontSize: '11.5px',
                    padding: '4px 10px',
                  }}
                >
                  <Sparkles size={12} /> Fill
                </button>
              </div>

              {/* Notice: No public registration */}
              <div
                style={{
                  textAlign: 'center',
                  fontSize: '12.5px',
                  color: 'var(--color-text-subtle)',
                  paddingTop: '8px',
                  borderTop: '1px solid var(--color-border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <KeyRound size={14} />
                <span>Admin accounts are provisioned internally by the municipality.</span>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
