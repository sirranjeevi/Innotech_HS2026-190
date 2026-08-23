import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Shield, Bell, LogOut, User, Menu, X, CheckSquare, Layers, PlusCircle, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';

/**
 * Reusable Navbar Component with Official Logo
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
  const isHomePage = location.pathname === '/';

  return (
    <nav className="civic-navbar" style={{ position: 'sticky', top: 0, zIndex: 100, backgroundColor: 'rgba(255, 255, 255, 0.98)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--color-border)' }}>
      <div className="container navbar-inner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '72px' }}>
        {/* Left: Official Attached Logo + Product Name */}
        <Link to="/" className="brand-logo" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
          <img
            src="/logo.png"
            alt="Civic Complaint Portal Official Logo"
            style={{
              height: '44px',
              width: 'auto',
              maxHeight: '44px',
              objectFit: 'contain',
              display: 'block',
            }}
          />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '18px', fontWeight: '800', color: 'var(--color-primary-950)', letterSpacing: '-0.02em', lineHeight: 1.15 }}>
              Civic Complaint Portal
            </span>
            <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Municipal Services
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link
            to="/"
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
            style={{ fontWeight: '600', fontSize: '14.5px', padding: '8px 14px' }}
          >
            Home
          </Link>

          {isHomePage && (
            <>
              <a
                href="#how-it-works"
                className="nav-link"
                style={{ fontWeight: '600', fontSize: '14.5px', padding: '8px 14px' }}
              >
                How It Works
              </a>
              <a
                href="#track-complaint"
                className="nav-link"
                style={{ fontWeight: '600', fontSize: '14.5px', padding: '8px 14px' }}
              >
                Track Complaint
              </a>
            </>
          )}

          {!isAuthenticated ? (
            <>
              <Link
                to="/citizen/login"
                className={`nav-link ${location.pathname.startsWith('/citizen') ? 'active' : ''}`}
                style={{ fontWeight: '600', fontSize: '14.5px', padding: '8px 14px' }}
              >
                Login
              </Link>
              <div style={{ marginLeft: '8px' }}>
                <Link to="/citizen/report">
                  <Button variant="accent" size="sm" iconStart={<PlusCircle size={16} />} style={{ fontWeight: '700', padding: '8px 18px' }}>
                    Report an Issue
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginLeft: '8px' }}>
              <Link
                to={getRoleDashboardLink()}
                className="nav-link active"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700' }}
              >
                <Layers size={16} />
                <span>Dashboard</span>
              </Link>

              {/* User Profile Badge */}
              <div className="user-profile-badge" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '4px 10px', backgroundColor: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-full)', border: '1px solid var(--color-border)' }}>
                <div
                  className="user-avatar"
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-primary-600)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '13px',
                    fontWeight: '800',
                  }}
                >
                  {user.name ? user.name.charAt(0).toUpperCase() : user.username?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '12.5px', fontWeight: '700', lineHeight: 1.1, color: 'var(--color-text-main)' }}>
                    {user.name || user.username}
                  </span>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: '700',
                      padding: '1px 5px',
                      borderRadius: '8px',
                      backgroundColor: roleColors.bg,
                      color: roleColors.text,
                      display: 'inline-block',
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
                iconStart={<LogOut size={15} />}
                title="Sign Out"
              >
                Sign Out
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle Button */}
        <button
          type="button"
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
          style={{
            display: 'none',
            background: 'none',
            border: '1px solid var(--color-border)',
            padding: '8px',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            color: 'var(--color-text-main)',
          }}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          style={{
            borderTop: '1px solid var(--color-border)',
            backgroundColor: '#FFFFFF',
            padding: '18px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            style={{ fontSize: '15px', fontWeight: '600', color: 'var(--color-text-main)', textDecoration: 'none', padding: '8px 0' }}
          >
            Home
          </Link>
          <a
            href="#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            style={{ fontSize: '15px', fontWeight: '600', color: 'var(--color-text-main)', textDecoration: 'none', padding: '8px 0' }}
          >
            How It Works
          </a>
          <a
            href="#track-complaint"
            onClick={() => setMobileMenuOpen(false)}
            style={{ fontSize: '15px', fontWeight: '600', color: 'var(--color-text-main)', textDecoration: 'none', padding: '8px 0' }}
          >
            Track Complaint
          </a>
          <Link
            to="/citizen/report"
            onClick={() => setMobileMenuOpen(false)}
            style={{ fontSize: '15px', fontWeight: '700', color: 'var(--color-accent-700)', textDecoration: 'none', padding: '8px 0' }}
          >
            Report an Issue
          </Link>

          {!isAuthenticated ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px', paddingTop: '12px', borderTop: '1px solid var(--color-border)' }}>
              <Link to="/citizen/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" fullWidth size="md">
                  Citizen Login
                </Button>
              </Link>
              <Link to="/admin/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" fullWidth size="sm">
                  Admin Portal
                </Button>
              </Link>
              <Link to="/worker/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" fullWidth size="sm">
                  Worker Portal
                </Button>
              </Link>
            </div>
          ) : (
            <div style={{ marginTop: '10px', paddingTop: '12px', borderTop: '1px solid var(--color-border)' }}>
              <Button variant="primary" fullWidth onClick={() => { navigate(getRoleDashboardLink()); setMobileMenuOpen(false); }}>
                Go to Dashboard
              </Button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
