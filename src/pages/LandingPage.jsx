import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  ShieldCheck,
  HardHat,
  ArrowRight,
  CheckCircle,
  FileCheck2,
  Activity,
  Layers,
  MapPin,
  Clock,
  Sparkles,
  Smartphone,
  ChevronRight,
  ShieldAlert,
  Send
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import StatusBadge from '../components/common/StatusBadge';
import ComplaintCard from '../components/common/ComplaintCard';
import Timeline from '../components/common/Timeline';
import Modal from '../components/common/Modal';

export default function LandingPage() {
  const [demoModalOpen, setDemoModalOpen] = useState(false);

  const sampleTimelineItems = [
    {
      title: 'Complaint Registered',
      time: '10:15 AM - Today',
      author: 'Ananya Sharma (Citizen)',
      description: 'Reported broken street lamp fixture near Blossom Enclave gate.',
      status: 'submitted',
    },
    {
      title: 'Under Municipal Review',
      time: '11:30 AM - Today',
      author: 'Admin Officer',
      description: 'Assigned to North District Electrical Field Squad.',
      status: 'under_review',
    },
    {
      title: 'Field Team Dispatched',
      time: '01:45 PM - Today',
      author: 'Rajesh Kumar (Field Tech)',
      description: 'On-site bulb and circuit replacement in progress.',
      status: 'in_progress',
    },
  ];

  return (
    <div className="civic-bg-gradient" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* Hero Section */}
      <section style={{ padding: '60px 20px 40px', textAlign: 'center' }}>
        <div className="container">
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 16px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-primary-50)',
              border: '1px solid var(--color-primary-200)',
              color: 'var(--color-primary-800)',
              fontSize: '13px',
              fontWeight: '700',
              marginBottom: '20px',
            }}
          >
            <Sparkles size={15} color="var(--color-primary-600)" />
            <span>Civic Tech Platform & Flutter-Parity Design</span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(32px, 5vw, 56px)',
              fontWeight: '800',
              letterSpacing: '-0.03em',
              color: 'var(--color-primary-950)',
              marginBottom: '16px',
              lineHeight: 1.15,
            }}
          >
            Report. Track. Resolve.
          </h1>

          <p
            style={{
              fontSize: 'clamp(16px, 2vw, 19px)',
              color: 'var(--color-text-muted)',
              maxWidth: '680px',
              margin: '0 auto 36px',
              lineHeight: 1.6,
            }}
          >
            A unified municipal complaint resolution network connecting citizens, administrative teams, and field workers in real-time.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <Link to="/citizen/register">
              <Button variant="accent" size="lg" iconEnd={<ArrowRight size={18} />}>
                Register as Citizen
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              onClick={() => setDemoModalOpen(true)}
              iconStart={<Layers size={18} />}
            >
              Component Suite Preview
            </Button>
          </div>
        </div>
      </section>

      {/* 3 Portal Cards Section */}
      <section style={{ padding: '30px 20px 60px' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--color-text-main)' }}>
              Choose Your Dedicated Portal
            </h2>
            <p style={{ fontSize: '14.5px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
              Tailored workflows engineered for every role in the municipal ecosystem
            </p>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* Citizen Portal Card */}
            <Card
              interactive
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '28px',
                borderTop: '4px solid var(--color-primary-600)',
              }}
            >
              <div>
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: 'var(--radius-lg)',
                    backgroundColor: 'var(--color-primary-50)',
                    color: 'var(--color-primary-600)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '20px',
                  }}
                >
                  <Users size={28} />
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '10px' }}>
                  Citizen Portal
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: '20px' }}>
                  Submit civic grievances, upload ground details, monitor resolution lifecycle with live audit tracking, and receive status notifications.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--color-text-main)' }}>
                    <CheckCircle size={15} color="var(--color-accent-600)" />
                    <span>Lodge complaints in under 2 minutes</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--color-text-main)' }}>
                    <CheckCircle size={15} color="var(--color-accent-600)" />
                    <span>Real-time timeline & status badges</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <Link to="/citizen/login">
                  <Button variant="primary" fullWidth iconEnd={<ArrowRight size={16} />}>
                    Citizen Login
                  </Button>
                </Link>
                <Link to="/citizen/register">
                  <Button variant="ghost" fullWidth size="sm">
                    Create New Account
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Admin Portal Card */}
            <Card
              interactive
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '28px',
                borderTop: '4px solid var(--color-primary-800)',
              }}
            >
              <div>
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: 'var(--radius-lg)',
                    backgroundColor: '#FEF3C7',
                    color: '#92400E',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '20px',
                  }}
                >
                  <ShieldCheck size={28} />
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '10px' }}>
                  Admin Portal
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: '20px' }}>
                  Centralized municipal dashboard for reviewing incoming grievances, delegating work orders to field departments, and auditing SLA completion.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--color-text-main)' }}>
                    <CheckCircle size={15} color="#D97706" />
                    <span>Cross-department work delegation</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--color-text-main)' }}>
                    <CheckCircle size={15} color="#D97706" />
                    <span>Prebuilt municipal authority access</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <Link to="/admin/login">
                  <Button variant="primary" fullWidth iconEnd={<ArrowRight size={16} />} style={{ backgroundColor: 'var(--color-primary-800)' }}>
                    Admin Sign In
                  </Button>
                </Link>
                <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--color-text-subtle)', padding: '6px 0' }}>
                  Provisioned accounts only
                </div>
              </div>
            </Card>

            {/* Field Worker Portal Card */}
            <Card
              interactive
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '28px',
                borderTop: '4px solid var(--color-accent-600)',
              }}
            >
              <div>
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: 'var(--radius-lg)',
                    backgroundColor: 'var(--color-accent-50)',
                    color: 'var(--color-accent-600)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '20px',
                  }}
                >
                  <HardHat size={28} />
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '10px' }}>
                  Field Worker Portal
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: '20px' }}>
                  On-the-ground interface for technicians and repair crews to receive tasks, inspect sites, record field notes, and submit resolutions.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--color-text-main)' }}>
                    <CheckCircle size={15} color="var(--color-accent-600)" />
                    <span>Real-time work order queue</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--color-accent-600)' }}>
                    <CheckCircle size={15} color="var(--color-accent-600)" />
                    <span>Direct ground status reporting</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <Link to="/worker/login">
                  <Button variant="accent" fullWidth iconEnd={<ArrowRight size={16} />}>
                    Field Worker Sign In
                  </Button>
                </Link>
                <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--color-text-subtle)', padding: '6px 0' }}>
                  Department assigned credentials
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Component & Design System Interactive Showcase */}
      <section style={{ padding: '40px 20px 80px', backgroundColor: '#FFFFFF', borderTop: '1px solid var(--color-border)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-accent-600)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Design System Showcase
            </span>
            <h2 style={{ fontSize: '26px', fontWeight: '800', marginTop: '6px' }}>
              Consistent, Accessible & Flutter-Aligned Components
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-8 items-start">
            {/* Live Complaint Card Preview */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--color-primary-900)' }}>
                Reusable Complaint Cards & Status Badges
              </h4>

              <ComplaintCard
                id="CMP-2026-8941"
                title="Pothole repair required on 4th Main Crossroad"
                description="Large road crater causing severe traffic slowdown and vehicle hazard near the community hospital entrance."
                category="Roads & Infrastructure"
                status="in_progress"
                location="Sector 7, North Ward"
                createdAt="Aug 22, 2026"
              />

              <ComplaintCard
                id="CMP-2026-8910"
                title="Water pipeline leakage causing street overflow"
                description="Underground main supply pipe ruptured causing continuous potable water wastage."
                category="Water & Sanitation"
                status="resolved"
                location="Rosewood Colony, Block B"
                createdAt="Aug 20, 2026"
              />

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                <StatusBadge status="submitted" pulse />
                <StatusBadge status="under_review" />
                <StatusBadge status="in_progress" pulse />
                <StatusBadge status="resolved" />
                <StatusBadge status="rejected" />
              </div>
            </div>

            {/* Live Timeline Audit Trail */}
            <Card style={{ padding: '24px' }}>
              <div style={{ marginBottom: '18px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: '700' }}>Live Resolution Timeline Component</h4>
                <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                  Demonstrating the transparent step-by-step municipal resolution audit trail
                </p>
              </div>

              <Timeline items={sampleTimelineItems} />
            </Card>
          </div>
        </div>
      </section>

      {/* Reusable Component Preview Modal */}
      <Modal
        isOpen={demoModalOpen}
        onClose={() => setDemoModalOpen(false)}
        title="CivicConnect Reusable UI Component Suite"
        footer={
          <Button variant="primary" size="sm" onClick={() => setDemoModalOpen(false)}>
            Close Preview
          </Button>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ fontSize: '13.5px', color: 'var(--color-text-muted)' }}>
            All 15 required reusable components have been built with complete Flutter-parity tokens, responsive breakpoints, and role-based security:
          </p>

          <div className="grid grid-cols-2 gap-2" style={{ fontSize: '13px' }}>
            <div style={{ padding: '8px 12px', background: 'var(--color-bg-subtle)', borderRadius: '6px' }}>
              ✅ <strong>Navbar & Sidebar</strong>
            </div>
            <div style={{ padding: '8px 12px', background: 'var(--color-bg-subtle)', borderRadius: '6px' }}>
              ✅ <strong>Button (6 Variants)</strong>
            </div>
            <div style={{ padding: '8px 12px', background: 'var(--color-bg-subtle)', borderRadius: '6px' }}>
              ✅ <strong>Input & Select</strong>
            </div>
            <div style={{ padding: '8px 12px', background: 'var(--color-bg-subtle)', borderRadius: '6px' }}>
              ✅ <strong>Card & Modal</strong>
            </div>
            <div style={{ padding: '8px 12px', background: 'var(--color-bg-subtle)', borderRadius: '6px' }}>
              ✅ <strong>Table & StatusBadge</strong>
            </div>
            <div style={{ padding: '8px 12px', background: 'var(--color-bg-subtle)', borderRadius: '6px' }}>
              ✅ <strong>Timeline & ComplaintCard</strong>
            </div>
            <div style={{ padding: '8px 12px', background: 'var(--color-bg-subtle)', borderRadius: '6px' }}>
              ✅ <strong>PageHeader & LoadingState</strong>
            </div>
            <div style={{ padding: '8px 12px', background: 'var(--color-bg-subtle)', borderRadius: '6px' }}>
              ✅ <strong>EmptyState & NotificationItem</strong>
            </div>
          </div>
        </div>
      </Modal>

      {/* Footer */}
      <footer style={{ padding: '32px 20px', backgroundColor: '#0F172A', color: '#94A3B8', marginTop: 'auto' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#FFFFFF', fontWeight: '700' }}>
            <FileCheck2 size={18} color="var(--color-accent-400)" />
            <span>CivicConnect Portal - Part 1</span>
          </div>
          <div style={{ fontSize: '13px' }}>
            Built with React 19 + Vite • Firebase Ready Architecture
          </div>
        </div>
      </footer>
    </div>
  );
}
