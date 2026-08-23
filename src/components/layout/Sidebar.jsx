import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  Bell,
  User,
  LogOut,
  ArrowLeftRight,
  ShieldCheck,
  Wrench,
  Users,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useComplaints } from '../../context/ComplaintContext';

/**
 * Responsive Sidebar Component
 */
export default function Sidebar({ className = '', collapsed = false, onToggleCollapse }) {
  const { user, logout } = useAuth();
  const { unreadNotificationCount } = useComplaints();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const renderNavItems = () => {
    if (user?.role === 'admin') {
      return (
        <>
          <span className="sidebar-heading">Admin Operations</span>
          <NavLink
            to="/admin/dashboard"
            end
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <LayoutDashboard size={18} className="sidebar-icon" />
            <span>Overview</span>
          </NavLink>
          <div className="sidebar-link" style={{ opacity: 0.6, cursor: 'default' }}>
            <FileText size={18} className="sidebar-icon" />
            <span>Complaints Queue</span>
          </div>
          <div className="sidebar-link" style={{ opacity: 0.6, cursor: 'default' }}>
            <Users size={18} className="sidebar-icon" />
            <span>Field Teams</span>
          </div>
          <div className="sidebar-link" style={{ opacity: 0.6, cursor: 'default' }}>
            <Bell size={18} className="sidebar-icon" />
            <span>Alerts & Logs</span>
          </div>
        </>
      );
    }

    if (user?.role === 'worker') {
      return (
        <>
          <span className="sidebar-heading">Field Operations</span>
          <NavLink
            to="/worker/dashboard"
            end
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <LayoutDashboard size={18} className="sidebar-icon" />
            <span>Work Orders</span>
          </NavLink>
          <div className="sidebar-link" style={{ opacity: 0.6, cursor: 'default' }}>
            <Wrench size={18} className="sidebar-icon" />
            <span>Assigned Tasks</span>
          </div>
          <div className="sidebar-link" style={{ opacity: 0.6, cursor: 'default' }}>
            <CheckCircle size={18} className="sidebar-icon" />
            <span>Completed Jobs</span>
          </div>
          <div className="sidebar-link" style={{ opacity: 0.6, cursor: 'default' }}>
            <Bell size={18} className="sidebar-icon" />
            <span>Dispatch Notices</span>
          </div>
        </>
      );
    }

    // Citizen Role Navigation (Part 2)
    return (
      <>
        <span className="sidebar-heading">Citizen Portal</span>
        <NavLink
          to="/citizen/dashboard"
          end
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <LayoutDashboard size={18} className="sidebar-icon" />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/citizen/report"
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          style={{ color: 'var(--color-accent-700)' }}
        >
          <PlusCircle size={18} className="sidebar-icon" color="var(--color-accent-600)" />
          <span>Report Issue</span>
        </NavLink>

        <NavLink
          to="/citizen/complaints"
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <FileText size={18} className="sidebar-icon" />
          <span>My Complaints</span>
        </NavLink>

        <NavLink
          to="/citizen/notifications"
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <Bell size={18} className="sidebar-icon" />
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flex: 1 }}>
            <span>Notifications</span>
            {unreadNotificationCount > 0 && (
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
                {unreadNotificationCount}
              </span>
            )}
          </span>
        </NavLink>

        <NavLink
          to="/citizen/profile"
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <User size={18} className="sidebar-icon" />
          <span>Profile</span>
        </NavLink>
      </>
    );
  };

  return (
    <aside
      className={`sidebar ${className}`.trim()}
      style={{
        width: collapsed ? '72px' : '260px',
        transition: 'width var(--transition-normal)',
      }}
    >
      <div className="sidebar-nav">{renderNavItems()}</div>

      <div
        style={{
          borderTop: '1px solid var(--color-border)',
          paddingTop: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        <button
          type="button"
          onClick={() => navigate('/')}
          className="sidebar-link"
          style={{ width: '100%', border: 'none', background: 'none', textAlign: 'left' }}
        >
          <ArrowLeftRight size={18} className="sidebar-icon" />
          {!collapsed && <span>Switch Portal</span>}
        </button>

        <button
          type="button"
          onClick={handleLogout}
          className="sidebar-link"
          style={{ width: '100%', border: 'none', background: 'none', color: '#EF4444', textAlign: 'left' }}
        >
          <LogOut size={18} className="sidebar-icon" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
