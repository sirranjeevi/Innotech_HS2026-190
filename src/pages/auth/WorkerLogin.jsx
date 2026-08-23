import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench, Lock, User, ArrowRight, Sparkles, HardHat } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/layout/Navbar';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

export default function WorkerLogin() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please enter both field worker username and password.');
      return;
    }

    const res = await login(username, password, 'worker');
    if (res.success) {
      navigate('/worker/dashboard');
    } else {
      setError(res.error || 'Invalid worker credentials');
    }
  };

  const handleFillDemo = () => {
    setUsername('worker');
    setPassword('worker123');
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
                backgroundColor: '#E0F2FE',
                color: '#075985',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '12px',
                border: '1px solid #BAE6FD',
              }}
            >
              <HardHat size={26} />
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Field Worker Portal</h2>
            <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
              Access ground work orders and log field resolutions
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
                label="Worker ID / Username"
                placeholder="Enter field worker username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                iconStart={<User size={18} />}
                required
                autoComplete="username"
              />

              <Input
                label="Password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                iconStart={<Lock size={18} />}
                required
                autoComplete="current-password"
              />

              <Button
                type="submit"
                variant="accent"
                fullWidth
                size="lg"
                loading={loading}
                iconEnd={<ArrowRight size={18} />}
              >
                Sign In to Field Portal
              </Button>

              {/* Prebuilt Demo Account Info */}
              <div
                style={{
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#E0F2FE',
                  border: '1px solid #BAE6FD',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                }}
              >
                <div>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#075985' }}>
                    PREBUILT FIELD WORKER ACCOUNT
                  </div>
                  <div style={{ fontSize: '12.5px', color: '#0C4A6E', marginTop: '2px' }}>
                    Username: <strong>worker</strong> | Pass: <strong>worker123</strong>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleFillDemo}
                  className="btn btn-sm"
                  style={{
                    backgroundColor: '#0284C7',
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
                <Wrench size={14} />
                <span>Field worker credentials are assigned by district supervisors.</span>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
