import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Lock, CheckCircle2, ArrowRight, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/layout/Navbar';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

export default function CitizenRegister() {
  const { registerCitizen, loading } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full Name is required';
    }
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validate()) return;

    const res = await registerCitizen({
      fullName: formData.fullName,
      username: formData.username,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
    });

    if (res.success) {
      navigate('/citizen/dashboard');
    } else {
      setServerError(res.error || 'Registration failed');
    }
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
        <div style={{ width: '100%', maxWidth: '520px' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--color-accent-100)',
                color: 'var(--color-accent-700)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '12px',
              }}
            >
              <UserPlus size={24} />
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Citizen Registration</h2>
            <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
              Create your citizen profile to lodge and track municipal complaints
            </p>
          </div>

          <Card style={{ padding: '28px' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {serverError && (
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
                  {serverError}
                </div>
              )}

              <Input
                label="Full Name"
                placeholder="e.g. Rahul Verma"
                value={formData.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                iconStart={<User size={18} />}
                error={errors.fullName}
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Username"
                  placeholder="e.g. rahul_v"
                  value={formData.username}
                  onChange={(e) => handleChange('username', e.target.value)}
                  iconStart={<User size={18} />}
                  error={errors.username}
                  required
                />

                <Input
                  label="Phone Number"
                  placeholder="e.g. +91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  iconStart={<Phone size={18} />}
                  error={errors.phone}
                  required
                />
              </div>

              <Input
                label="Email Address"
                type="email"
                placeholder="e.g. rahul.verma@example.com"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                iconStart={<Mail size={18} />}
                error={errors.email}
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Password"
                  type="password"
                  placeholder="Minimum 6 chars"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  iconStart={<Lock size={18} />}
                  error={errors.password}
                  required
                />

                <Input
                  label="Confirm Password"
                  type="password"
                  placeholder="Re-enter password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  iconStart={<Lock size={18} />}
                  error={errors.confirmPassword}
                  required
                />
              </div>

              <Button
                type="submit"
                variant="accent"
                fullWidth
                size="lg"
                loading={loading}
                iconEnd={<ArrowRight size={18} />}
                style={{ marginTop: '8px' }}
              >
                Complete Registration
              </Button>

              {/* Login Link */}
              <div
                style={{
                  textAlign: 'center',
                  fontSize: '14px',
                  color: 'var(--color-text-muted)',
                  paddingTop: '8px',
                  borderTop: '1px solid var(--color-border-subtle)',
                }}
              >
                Already have an account?{' '}
                <Link
                  to="/citizen/login"
                  style={{ fontWeight: '700', color: 'var(--color-primary-600)' }}
                >
                  Sign in here
                </Link>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
