import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowRight } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

/**
 * Role-based Protected Route Guard
 * Prevents unauthorized or cross-role access.
 */
export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return null; // Or a subtle spinner
  }

  // Not logged in -> Redirect to appropriate login page based on target route
  if (!isAuthenticated || !user) {
    if (allowedRoles.includes('admin')) {
      return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }
    if (allowedRoles.includes('worker')) {
      return <Navigate to="/worker/login" state={{ from: location }} replace />;
    }
    return <Navigate to="/citizen/login" state={{ from: location }} replace />;
  }

  // Cross-Role Access Violation: Logged in, but wrong role
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    const getOwnDashboard = () => {
      if (user.role === 'admin') return '/admin/dashboard';
      if (user.role === 'worker') return '/worker/dashboard';
      return '/citizen/dashboard';
    };

    return (
      <div
        style={{
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
        }}
      >
        <Card style={{ maxWidth: '480px', width: '100%', textAlign: 'center', padding: '32px 24px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#FEE2E2',
              color: '#DC2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 18px',
            }}
          >
            <ShieldAlert size={36} />
          </div>

          <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px', color: '#991B1B' }}>
            Access Restricted
          </h2>

          <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: '24px' }}>
            You are logged in as a <strong>{user.role.toUpperCase()}</strong>. You do not have permissions to access this area.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Link to={getOwnDashboard()}>
              <Button variant="primary" fullWidth iconEnd={<ArrowRight size={16} />}>
                Go to My {user.role.charAt(0).toUpperCase() + user.role.slice(1)} Dashboard
              </Button>
            </Link>

            <Link to="/">
              <Button variant="ghost" fullWidth>
                Return to Home
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return children;
}
