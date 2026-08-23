import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShieldCheck,
  Bell,
  LogOut,
  User,
  Menu,
  X,
  Layers,
  PlusCircle,
  Search,
  HardHat,
  ChevronDown,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';
import Modal from '../common/Modal';

/**
 * Reusable Navbar Component with Role-Selection Login Dropdown & Modal
 */
export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginDropdownOpen, setLoginDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setLoginDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const handleRoleSelect = (path) => {
    setLoginDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate(path);
  };

  return (
    <nav
      className="civic-navbar"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      <div
        className="container navbar-inner"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '72px' }}
      >
        {/* Left: Official Attached Logo + Product Name */}
        <Link
          to="/"
          className="brand-logo"
          style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}
        >
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
            <span
              style={{
                fontSize: '18px',
                fontWeight: '800',
                color: 'var(--color-primary-950)',
                letterSpacing: '-0.02em',
                lineHeight: 1.15,
              }}
            >
              Civic Complaint Portal
            </span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: '600',
                color: 'var(--color-text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
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
              {/* Login Selector Button with Dropdown Popover */}
              <div ref={dropdownRef} style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setLoginDropdownOpen(!loginDropdownOpen)}
                  className={`btn btn-ghost ${location.pathname.includes('/login') ? 'active' : ''}`}
                  style={{
                    fontWeight: '700',
                    fontSize: '14.5px',
                    padding: '8px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: 'var(--color-primary-900)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: loginDropdownOpen ? 'var(--color-primary-50)' : 'transparent',
                  }}
                  aria-expanded={loginDropdownOpen}
                  aria-haspopup="true"
                >
                  <span>Login</span>
                  <ChevronDown
                    size={16}
                    style={{
                      transform: loginDropdownOpen ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.2s ease',
                    }}
                  />
                </button>

                {/* Dropdown Menu */}
                {loginDropdownOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 8px)',
                      right: 0,
                      width: '320px',
                      backgroundColor: '#FFFFFF',
                      borderRadius: 'var(--radius-xl)',
                      boxShadow: '0 18px 40px -10px rgba(15, 23, 42, 0.2), 0 0 0 1px var(--color-border)',
                      padding: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      zIndex: 1000,
                      animation: 'fadeIn 0.15s ease-out',
                    }}
                  >
                    <div
                      style={{
                        padding: '6px 12px 4px',
                        fontSize: '11px',
                        fontWeight: '800',
                        color: 'var(--color-text-subtle)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                      }}
                    >
                      Select Your Portal
                    </div>

                    {/* 1. Citizen Login Option */}
                    <button
                      type="button"
                      onClick={() => handleRoleSelect('/citizen/login')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: '#F8FAFC',
                        border: '1px solid var(--color-border)',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-primary-50)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                    >
                      <div
                        style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: 'var(--color-primary-100)',
                          color: 'var(--color-primary-700)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <User size={20} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--color-primary-950)' }}>
                          Citizen Login
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                          Lodge & track civic complaints
                        </div>
                      </div>
                      <ArrowRight size={14} color="var(--color-primary-600)" />
                    </button>

                    {/* 2. Worker Login Option */}
                    <button
                      type="button"
                      onClick={() => handleRoleSelect('/worker/login')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: '#F8FAFC',
                        border: '1px solid var(--color-border)',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#E0F2FE')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                    >
                      <div
                        style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: '#E0F2FE',
                          color: '#0369A1',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <HardHat size={20} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', fontWeight: '800', color: '#0369A1' }}>
                          Field Worker Login
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                          Ground work orders & repairs
                        </div>
                      </div>
                      <ArrowRight size={14} color="#0369A1" />
                    </button>

                    {/* 3. Admin Login Option */}
                    <button
                      type="button"
                      onClick={() => handleRoleSelect('/admin/login')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: '#F8FAFC',
                        border: '1px solid var(--color-border)',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FEF3C7')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                    >
                      <div
                        style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: '#FEF3C7',
                          color: '#92400E',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <ShieldCheck size={20} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', fontWeight: '800', color: '#92400E' }}>
                          Admin Portal Login
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                          Municipal dispatch & verification
                        </div>
                      </div>
                      <ArrowRight size={14} color="#92400E" />
                    </button>
                  </div>
                )}
              </div>

              {/* Primary Report Button */}
              <div style={{ marginLeft: '8px' }}>
                <Link to="/citizen/report">
                  <Button
                    variant="accent"
                    size="sm"
                    iconStart={<PlusCircle size={16} />}
                    style={{ fontWeight: '700', padding: '8px 18px', borderRadius: 'var(--radius-full)' }}
                  >
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
              <div
                className="user-profile-badge"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '4px 10px',
                  backgroundColor: 'var(--color-bg-subtle)',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--color-border)',
                }}
              >
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
              <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-text-subtle)', textTransform: 'uppercase' }}>
                Select Portal to Login:
              </div>
              <Link to="/citizen/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="primary" fullWidth size="md" iconStart={<User size={16} />}>
                  Citizen Login
                </Button>
              </Link>
              <Link to="/worker/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" fullWidth size="md" iconStart={<HardHat size={16} />}>
                  Field Worker Login
                </Button>
              </Link>
              <Link to="/admin/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" fullWidth size="md" iconStart={<ShieldCheck size={16} />}>
                  Admin Login
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
