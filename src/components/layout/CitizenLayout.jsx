import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  CheckSquare
} from 'lucide-react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import { useComplaints } from '../../context/ComplaintContext';

/**
 * Complete Responsive Citizen Layout
 * Desktop: Sidebar (260px) + Navbar + Content
 * Tablet: Collapsible Sidebar + Content
 * Mobile: Top App Bar + Content + Bottom Tab Navigation
 */
export default function CitizenLayout({ children }) {
  const { user, logout } = useAuth();
  const { unreadNotificationCount } = useComplaints();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { label: 'Dashboard', path: '/citizen/dashboard', icon: <LayoutDashboard size={20} /> },
    { label: 'Report Issue', path: '/citizen/report', icon: <PlusCircle size={20} />, highlight: true },
    { label: 'Complaints', path: '/citizen/complaints', icon: <FileText size={20} /> },
    { label: 'Alerts', path: '/citizen/notifications', icon: <Bell size={20} />, badge: unreadNotificationCount },
    { label: 'Profile', path: '/citizen/profile', icon: <User size={20} /> },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-bg)' }}>
      {/* Top Navbar */}
      <Navbar />

      {/* Main Container */}
      <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
        {/* Desktop & Tablet Sidebar */}
        <div className="citizen-desktop-sidebar">
          <Sidebar />
        </div>

        {/* Mobile Slide-out Drawer Overlay */}
        {mobileDrawerOpen && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.5)',
              zIndex: 200,
              display: 'flex',
            }}
            onClick={() => setMobileDrawerOpen(false)}
          >
            <div
              style={{
                width: '280px',
                backgroundColor: 'var(--color-surface)',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: 'var(--shadow-xl)',
                animation: 'slideIn 0.25s ease-out',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  padding: '20px',
                  borderBottom: '1px solid var(--color-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800' }}>
                  <CheckSquare size={20} color="var(--color-primary-600)" />
                  <span>Citizen Portal</span>
                </div>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setMobileDrawerOpen(false)}
                  style={{ padding: '6px', borderRadius: '50%' }}
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileDrawerOpen(false)}
                    className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                    style={item.highlight ? { color: 'var(--color-accent-700)', fontWeight: '700' } : {}}
                  >
                    <span className="sidebar-icon">{item.icon}</span>
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {item.badge > 0 && (
                      <span
                        style={{
                          backgroundColor: 'var(--color-accent-600)',
                          color: '#FFFFFF',
                          fontSize: '11px',
                          fontWeight: '700',
                          padding: '1px 6px',
                          borderRadius: '10px',
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                ))}
              </div>

              <div style={{ padding: '16px', borderTop: '1px solid var(--color-border)' }}>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="btn btn-danger btn-sm"
                  fullWidth
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: '100%' }}
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        <main
          style={{
            flex: 1,
            padding: '24px clamp(16px, 4vw, 36px)',
            paddingBottom: '80px', // Extra bottom padding for mobile bar
            overflowX: 'hidden',
          }}
        >
          <div style={{ maxWidth: '1140px', margin: '0 auto' }}>
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (Visible only on <768px) */}
      <nav className="citizen-mobile-bottom-nav">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`mobile-tab-item ${isActive ? 'active' : ''}`}
            >
              <div style={{ position: 'relative' }}>
                {item.icon}
                {item.badge > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-4px',
                      right: '-6px',
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-accent-600)',
                    }}
                  />
                )}
              </div>
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
