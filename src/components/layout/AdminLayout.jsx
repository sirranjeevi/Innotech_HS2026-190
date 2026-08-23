import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

/**
 * Admin Layout with responsive sidebar and top bar
 */
export default function AdminLayout({ children }) {
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
            overflowX: 'hidden',
          }}
        >
          <div style={{ maxWidth: '1240px', margin: '0 auto' }}>{children}</div>
        </main>
      </div>
    </div>
  );
}
