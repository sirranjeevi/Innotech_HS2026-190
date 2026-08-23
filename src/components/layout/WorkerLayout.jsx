import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, Bell, User } from 'lucide-react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useComplaints } from '../../context/ComplaintContext';

/**
 * Field Worker Layout with responsive bottom navigation on mobile
 */
export default function WorkerLayout({ children }) {
  const { unreadWorkerNotificationCount } = useComplaints();
  const location = useLocation();

  const workerTabs = [
    { label: 'Workstation', path: '/worker/dashboard', icon: <LayoutDashboard size={20} /> },
    { label: 'My Tasks', path: '/worker/tasks', icon: <ClipboardList size={20} /> },
    { label: 'Alerts', path: '/worker/notifications', icon: <Bell size={20} />, badge: unreadWorkerNotificationCount },
    { label: 'Profile', path: '/worker/profile', icon: <User size={20} /> },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-bg)' }}>
      <Navbar />
      <div style={{ display: 'flex', flex: 1 }}>
        <div className="citizen-desktop-sidebar">
          <Sidebar />
        </div>
        <main
          style={{
            flex: 1,
            padding: '24px clamp(16px, 3.5vw, 36px)',
            paddingBottom: '80px',
            overflowX: 'hidden',
          }}
        >
          <div style={{ maxWidth: '1140px', margin: '0 auto' }}>{children}</div>
        </main>
      </div>

      {/* Mobile Bottom Navigation for Field Workers */}
      <nav className="citizen-mobile-bottom-nav">
        {workerTabs.map((item) => {
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
