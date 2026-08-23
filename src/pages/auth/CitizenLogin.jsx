import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Lock, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/layout/Navbar';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

export default function CitizenLogin() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }

    const res = await login(username, password, 'citizen');
    if (res.success) {
      navigate('/citizen/dashboard');
    } else {
      setError(res.error || 'Invalid credentials');
    }
  };

  const handleFillDemo = () => {
    setUsername('citizen');
    setPassword('password123');
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
          {/* Header Badge */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--color-primary-100)',
                color: 'var(--color-primary-700)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '12px',
              }}
            >
              <User size={24} />
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Citizen Portal Login</h2>
            <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
              Access your civic dashboard and track complaints
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
                label="Username or Email"
                placeholder="Enter your citizen username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                iconStart={<User size={18} />}
                required
                autoComplete="username"
              />

              <Input
                label="Password"
                type="password"
                placeholder="Enter your password"
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
              >
                Sign In to Citizen Portal
              </Button>

              {/* Demo 1-click helper */}
              <div
                style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-bg-subtle)',
                  border: '1px dashed var(--color-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                }}
              >
                <div style={{ fontSize: '12.5px', color: 'var(--color-text-muted)' }}>
                  Demo: <strong>citizen</strong> / <strong>password123</strong>
                </div>
                <button
                  type="button"
                  onClick={handleFillDemo}
                  className="btn btn-outline btn-sm"
                  style={{ fontSize: '12px', padding: '4px 10px' }}
                >
                  <Sparkles size={12} /> Auto-fill
                </button>
              </div>

              {/* Registration Link */}
              <div
                style={{
                  textAlign: 'center',
                  fontSize: '14px',
                  color: 'var(--color-text-muted)',
                  paddingTop: '8px',
                  borderTop: '1px solid var(--color-border-subtle)',
                }}
              >
                Don't have an account?{' '}
                <Link
                  to="/citizen/register"
                  style={{ fontWeight: '700', color: 'var(--color-primary-600)' }}
                >
                  Register here
                </Link>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
