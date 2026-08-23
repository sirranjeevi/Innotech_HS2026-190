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
  Building,
  MapPin,
  ClipboardList,
  Compass
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useComplaints } from '../../context/ComplaintContext';

/**
 * Responsive Multi-Role Sidebar Component
 */
export default function Sidebar({ className = '', collapsed = false }) {
  const { user, logout } = useAuth();
  const { unreadNotificationCount, unreadWorkerNotificationCount } = useComplaints();
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
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/admin/complaints"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <FileText size={18} className="sidebar-icon" />
            <span>All Complaints</span>
          </NavLink>

          <NavLink
            to="/admin/map"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <Compass size={18} className="sidebar-icon" />
            <span>City Map View</span>
          </NavLink>

          <NavLink
            to="/admin/departments"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <Building size={18} className="sidebar-icon" />
            <span>Departments</span>
          </NavLink>

          <NavLink
            to="/admin/workers"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <Users size={18} className="sidebar-icon" />
            <span>Field Workforce</span>
          </NavLink>

          <NavLink
            to="/admin/notifications"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <Bell size={18} className="sidebar-icon" />
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flex: 1 }}>
              <span>Alerts & Logs</span>
              {unreadNotificationCount > 0 && (
                <span
                  style={{
                    backgroundColor: '#D97706',
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
            to="/admin/profile"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <ShieldCheck size={18} className="sidebar-icon" />
            <span>Admin Profile</span>
          </NavLink>
        </>
      );
    }

    if (user?.role === 'worker') {
      return (
        <>
          <span className="sidebar-heading">Field Technician</span>
          <NavLink
            to="/worker/dashboard"
            end
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <LayoutDashboard size={18} className="sidebar-icon" />
            <span>Workstation</span>
          </NavLink>

          <NavLink
            to="/worker/tasks"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <ClipboardList size={18} className="sidebar-icon" />
            <span>My Tasks</span>
          </NavLink>

          <NavLink
            to="/worker/notifications"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <Bell size={18} className="sidebar-icon" />
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flex: 1 }}>
              <span>Dispatch Alerts</span>
              {unreadWorkerNotificationCount > 0 && (
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
                  {unreadWorkerNotificationCount}
                </span>
              )}
            </span>
          </NavLink>

          <NavLink
            to="/worker/profile"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <User size={18} className="sidebar-icon" />
            <span>Worker Profile</span>
          </NavLink>
        </>
      );
    }

    // Default: Citizen Role Navigation
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
