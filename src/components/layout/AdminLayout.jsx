import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, Compass, Bell, ShieldCheck } from 'lucide-react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useComplaints } from '../../context/ComplaintContext';

/**
 * Admin Layout with responsive sidebar and mobile bottom navigation
 */
export default function AdminLayout({ children }) {
  const { unreadNotificationCount } = useComplaints();
  const location = useLocation();

  const adminTabs = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
    { label: 'Complaints', path: '/admin/complaints', icon: <FileText size={20} /> },
    { label: 'City Map', path: '/admin/map', icon: <Compass size={20} /> },
    { label: 'Alerts', path: '/admin/notifications', icon: <Bell size={20} />, badge: unreadNotificationCount },
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
          <div style={{ maxWidth: '1240px', margin: '0 auto' }}>{children}</div>
        </main>
      </div>

      {/* Mobile Bottom Navigation for Admin */}
      <nav className="citizen-mobile-bottom-nav">
        {adminTabs.map((item) => {
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
                      backgroundColor: '#D97706',
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
