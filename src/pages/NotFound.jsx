import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, ArrowLeft } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

export default function NotFound() {
  return (
    <div className="civic-bg-gradient" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
        }}
      >
        <Card style={{ maxWidth: '460px', width: '100%', textAlign: 'center', padding: '36px 24px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-primary-50)',
              color: 'var(--color-primary-600)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <HelpCircle size={36} />
          </div>

          <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px' }}>
            Page Not Found (404)
          </h2>

          <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: '24px' }}>
            The requested civic portal route or page does not exist.
          </p>

          <Link to="/">
            <Button variant="primary" fullWidth iconStart={<ArrowLeft size={16} />}>
              Return to Home
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}
