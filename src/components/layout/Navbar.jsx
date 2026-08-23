import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Shield, Bell, LogOut, User, Menu, X, CheckSquare, Layers } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';

/**
 * Reusable Navbar Component
 */
export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getRoleDashboardLink = () => {
    if (!user) return '/';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'worker') return '/worker/dashboard';
    return '/citizen/dashboard';
  };

  const getRoleLabel = () => {
    if (!user) return '';
    if (user.role === 'admin') return 'Municipal Admin';
    if (user.role === 'worker') return 'Field Worker';
    return 'Citizen';
  };

  const getRoleBadgeColor = () => {
    if (user?.role === 'admin') return { bg: '#FEF3C7', text: '#92400E' };
    if (user?.role === 'worker') return { bg: '#E0F2FE', text: '#075985' };
    return { bg: '#DCFCE7', text: '#166534' };
  };

  const roleColors = getRoleBadgeColor();

  return (
    <nav className="civic-navbar">
      <div className="container navbar-inner">
        {/* Brand */}
        <Link to="/" className="brand-logo">
          <div className="brand-icon">
            <CheckSquare size={20} strokeWidth={2.5} />
          </div>
          <span>CivicConnect</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="nav-links" style={{ display: 'flex', alignItems: 'center' }}>
          <Link
            to="/"
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            Home
          </Link>

          {!isAuthenticated ? (
            <>
              <Link
                to="/citizen/login"
                className={`nav-link ${location.pathname.startsWith('/citizen') ? 'active' : ''}`}
              >
                Citizen Portal
              </Link>
              <Link
                to="/worker/login"
                className={`nav-link ${location.pathname.startsWith('/worker') ? 'active' : ''}`}
              >
                Field Worker
              </Link>
              <Link
                to="/admin/login"
                className={`nav-link ${location.pathname.startsWith('/admin') ? 'active' : ''}`}
              >
                Admin
              </Link>
              <div style={{ marginLeft: '12px' }}>
                <Link to="/citizen/register">
                  <Button variant="primary" size="sm">
                    Register Citizen
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Link
                to={getRoleDashboardLink()}
                className="nav-link active"
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Layers size={16} />
                <span>Dashboard</span>
              </Link>

              {/* User Profile Badge */}
              <div className="user-profile-badge">
                <div className="user-avatar">
                  {user.name ? user.name.charAt(0).toUpperCase() : user.username?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '13px', fontWeight: '700', lineHeight: 1.2 }}>
                    {user.name || user.username}
                  </span>
                  <span
                    style={{
                      fontSize: '10.5px',
                      fontWeight: '600',
                      padding: '1px 6px',
                      borderRadius: '10px',
                      backgroundColor: roleColors.bg,
                      color: roleColors.text,
                      display: 'inline-block',
                      marginTop: '2px',
                    }}
                  >
                    {getRoleLabel()}
                  </span>
                </div>
              </div>

              {/* Logout Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                iconStart={<LogOut size={16} />}
                title="Sign Out"
              >
                Sign Out
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
