import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

/**
 * Dashboard Layout Wrapper
 */
export default function DashboardLayout({ children }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar />
        <main
          style={{
            flex: 1,
            padding: '28px 36px',
            backgroundColor: 'var(--color-bg)',
            overflowX: 'hidden',
          }}
        >
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>{children}</div>
        </main>
      </div>
    </div>
  );
}
