import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Bell,
  User,
  ShieldCheck,
  Wrench,
  Users,
  CheckCircle,
  LogOut,
  ArrowLeftRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/**
 * Reusable Sidebar Component
 */
export default function Sidebar({ className = '' }) {
  const { user, logout } = useAuth();
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

    // Default: Citizen
    return (
      <>
        <span className="sidebar-heading">Citizen Menu</span>
        <NavLink
          to="/citizen/dashboard"
          end
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <LayoutDashboard size={18} className="sidebar-icon" />
          <span>My Overview</span>
        </NavLink>
        <div className="sidebar-link" style={{ opacity: 0.6, cursor: 'default' }}>
          <FileText size={18} className="sidebar-icon" />
          <span>My Complaints</span>
        </div>
        <div className="sidebar-link" style={{ opacity: 0.6, cursor: 'default' }}>
          <Bell size={18} className="sidebar-icon" />
          <span>Status Updates</span>
        </div>
        <div className="sidebar-link" style={{ opacity: 0.6, cursor: 'default' }}>
          <User size={18} className="sidebar-icon" />
          <span>Profile Info</span>
        </div>
      </>
    );
  };

  return (
    <aside className={`sidebar ${className}`.trim()}>
      <div className="sidebar-nav">
        {renderNavItems()}
      </div>

      <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="sidebar-link"
          style={{ width: '100%', border: 'none', background: 'none', textAlign: 'left' }}
        >
          <ArrowLeftRight size={18} className="sidebar-icon" />
          <span>Switch Portal</span>
        </button>

        <button
          type="button"
          onClick={handleLogout}
          className="sidebar-link"
          style={{ width: '100%', border: 'none', background: 'none', color: '#EF4444', textAlign: 'left' }}
        >
          <LogOut size={18} className="sidebar-icon" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
