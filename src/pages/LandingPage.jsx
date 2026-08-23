import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  ShieldCheck,
  HardHat,
  ArrowRight,
  CheckCircle2,
  FileText,
  MapPin,
  Clock,
  Sparkles,
  Camera,
  Search,
  Wrench,
  Bell,
  Eye,
  CheckCircle,
  Shield,
  Layers,
  Smartphone,
  HelpCircle,
  Send,
  AlertCircle
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import StatusBadge from '../components/common/StatusBadge';
import { useComplaints } from '../context/ComplaintContext';

export default function LandingPage() {
  const navigate = useNavigate();
  const { getComplaintById } = useComplaints();

  const [trackId, setTrackId] = useState('');
  const [trackedComplaint, setTrackedComplaint] = useState(null);
  const [trackError, setTrackError] = useState('');

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    setTrackError('');
    setTrackedComplaint(null);

    const cleanId = trackId.trim();
    if (!cleanId) {
      setTrackError('Please enter a Complaint ID.');
      return;
    }

    const found = getComplaintById(cleanId);
    if (found) {
      setTrackedComplaint(found);
    } else {
      setTrackError(`No complaint found with ID "${cleanId}". Try sample IDs: CMP-2026-8941, CMP-2026-8910, or CMP-2026-8955.`);
    }
  };

  const handleQuickTrack = (id) => {
    setTrackId(id);
    const found = getComplaintById(id);
    if (found) {
      setTrackedComplaint(found);
      setTrackError('');
    }
  };

  return (
    <div className="civic-bg-gradient" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* --------------------------------------------------------------------------
          1. HERO SECTION
          -------------------------------------------------------------------------- */}
      <section style={{ padding: 'clamp(40px, 6vw, 80px) 20px clamp(30px, 5vw, 60px)' }}>
        <div className="container">
          <div className="grid grid-cols-2 gap-12 items-center">
            {/* Left Column: Headline, Description, Actions & Trust Message */}
            <div>
              {/* Trust Badge with Attached Logo */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--color-border)',
                  boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
                  marginBottom: '24px',
                }}
              >
                <img
                  src="/logo.png"
                  alt="Civic Report Shield Emblem"
                  style={{ width: '24px', height: '24px', objectFit: 'contain' }}
                />
                <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-primary-900)' }}>
                  Official Citizen Complaint Portal
                </span>
              </div>

              {/* Headline */}
              <h1
                style={{
                  fontSize: 'clamp(36px, 5vw, 58px)',
                  fontWeight: '800',
                  letterSpacing: '-0.03em',
                  color: 'var(--color-primary-950)',
                  lineHeight: 1.12,
                  marginBottom: '20px',
                }}
              >
                Report. Track. Resolve.
              </h1>

              {/* Supporting Text */}
              <p
                style={{
                  fontSize: 'clamp(16px, 2vw, 19px)',
                  color: 'var(--color-text-muted)',
                  lineHeight: 1.6,
                  marginBottom: '32px',
                  maxWidth: '540px',
                }}
              >
                Report civic issues in your area, track their progress, and stay informed until the issue is resolved.
              </p>

              {/* Primary & Secondary Buttons */}
              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '24px' }}>
                <Link to="/citizen/report">
                  <Button
                    variant="accent"
                    size="lg"
                    iconEnd={<ArrowRight size={18} />}
                    style={{ fontSize: '16px', fontWeight: '700', padding: '14px 28px' }}
                  >
                    Report an Issue
                  </Button>
                </Link>

                <a href="#track-complaint">
                  <Button
                    variant="outline"
                    size="lg"
                    iconStart={<Search size={18} />}
                    style={{ fontSize: '16px', fontWeight: '600', padding: '14px 24px' }}
                  >
                    Track a Complaint
                  </Button>
                </a>
              </div>

              {/* Trust Message */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '13.5px',
                  fontWeight: '600',
                  color: 'var(--color-text-subtle)',
                }}
              >
                <CheckCircle2 size={16} color="var(--color-accent-600)" />
                <span>Your complaint. Your location. Your community.</span>
              </div>
            </div>

            {/* Right Column: Civic-Themed Visual UI Card with Official Logo */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{ maxWidth: '460px', width: '100%', position: 'relative' }}>
                {/* Official Logo Banner Badge */}
                <div
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 'var(--radius-xl)',
                    padding: '28px',
                    border: '1px solid var(--color-border)',
                    boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <img
                      src="/logo.png"
                      alt="Civic Report Official Logo"
                      style={{
                        width: '64px',
                        height: '64px',
                        objectFit: 'contain',
                        borderRadius: 'var(--radius-md)',
                      }}
                    />
                    <div>
                      <h4 style={{ fontSize: '17px', fontWeight: '800', color: 'var(--color-primary-950)' }}>
                        Civic Complaint Portal
                      </h4>
                      <p style={{ fontSize: '12.5px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                        Empowering Communities • Solving Issues
                      </p>
                    </div>
                  </div>

                  {/* Live Grievance Progress Card Preview */}
                  <div
                    style={{
                      padding: '16px',
                      backgroundColor: 'var(--color-bg-subtle)',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--color-border)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="complaint-id" style={{ fontSize: '12.5px' }}>#CMP-2026-8941</span>
                      <StatusBadge status="IN_PROGRESS" pulse />
                    </div>

                    <div>
                      <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--color-text-main)' }}>
                        Pothole Repair on 4th Main Road
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px' }}>
                        <MapPin size={12} color="var(--color-accent-600)" />
                        <span>Indiranagar • Dispatched to Field Crew</span>
                      </div>
                    </div>

                    {/* Progress indicator */}
                    <div style={{ marginTop: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: '700', color: 'var(--color-text-subtle)', marginBottom: '4px' }}>
                        <span>RESOLUTION PROGRESS</span>
                        <span style={{ color: '#0284C7' }}>STEP 5 OF 6</span>
                      </div>
                      <div style={{ width: '100%', height: '6px', backgroundColor: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: '80%', height: '100%', backgroundColor: '#0284C7', borderRadius: '4px' }} />
                      </div>
                    </div>
                  </div>

                  {/* 2 Quick Highlights */}
                  <div className="grid grid-cols-2 gap-3" style={{ fontSize: '12px' }}>
                    <div style={{ padding: '10px', backgroundColor: '#EFF6FF', borderRadius: 'var(--radius-md)', color: '#1E40AF', fontWeight: '600' }}>
                      ⚡ 24-48h Department Dispatch
                    </div>
                    <div style={{ padding: '10px', backgroundColor: '#F0FDF4', borderRadius: 'var(--radius-md)', color: '#166534', fontWeight: '600' }}>
                      📍 GPS & OpenStreetMap Tagged
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------------
          2. HOW IT WORKS SECTION (4 Simple Steps)
          -------------------------------------------------------------------------- */}
      <section id="how-it-works" style={{ padding: '70px 20px', backgroundColor: '#FFFFFF', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 48px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-accent-600)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Simple 4-Step Process
            </span>
            <h2 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--color-primary-950)', marginTop: '6px' }}>
              How It Works
            </h2>
            <p style={{ fontSize: '15px', color: 'var(--color-text-muted)', marginTop: '8px' }}>
              Transparent, accountable civic complaint resolution from submission to completion.
            </p>
          </div>

          <div className="grid grid-cols-4 gap-6">
            {/* Step 1: Report */}
            <Card style={{ padding: '26px', borderTop: '4px solid var(--color-primary-600)', position: 'relative' }}>
              <div
                style={{
                  fontSize: '28px',
                  fontWeight: '900',
                  color: 'var(--color-primary-600)',
                  marginBottom: '14px',
                  fontFamily: 'monospace',
                }}
              >
                01
              </div>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-primary-50)',
                  color: 'var(--color-primary-600)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '14px',
                }}
              >
                <Camera size={22} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--color-text-main)', marginBottom: '8px' }}>
                Report
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                Submit a civic issue with a photo, description and location.
              </p>
            </Card>

            {/* Step 2: Track */}
            <Card style={{ padding: '26px', borderTop: '4px solid #0284C7', position: 'relative' }}>
              <div
                style={{
                  fontSize: '28px',
                  fontWeight: '900',
                  color: '#0284C7',
                  marginBottom: '14px',
                  fontFamily: 'monospace',
                }}
              >
                02
              </div>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#E0F2FE',
                  color: '#0284C7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '14px',
                }}
              >
                <Search size={22} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--color-text-main)', marginBottom: '8px' }}>
                Track
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                Get a unique complaint ID and follow its progress.
              </p>
            </Card>

            {/* Step 3: Resolve */}
            <Card style={{ padding: '26px', borderTop: '4px solid var(--color-accent-600)', position: 'relative' }}>
              <div
                style={{
                  fontSize: '28px',
                  fontWeight: '900',
                  color: 'var(--color-accent-600)',
                  marginBottom: '14px',
                  fontFamily: 'monospace',
                }}
              >
                03
              </div>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-accent-50)',
                  color: 'var(--color-accent-600)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '14px',
                }}
              >
                <Wrench size={22} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--color-text-main)', marginBottom: '8px' }}>
                Resolve
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                Authorities assign the issue to the appropriate field worker.
              </p>
            </Card>

            {/* Step 4: Stay Updated */}
            <Card style={{ padding: '26px', borderTop: '4px solid #16A34A', position: 'relative' }}>
              <div
                style={{
                  fontSize: '28px',
                  fontWeight: '900',
                  color: '#16A34A',
                  marginBottom: '14px',
                  fontFamily: 'monospace',
                }}
              >
                04
              </div>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#DCFCE7',
                  color: '#16A34A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '14px',
                }}
              >
                <CheckCircle2 size={22} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--color-text-main)', marginBottom: '8px' }}>
                Stay Updated
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                See the latest status and resolution details.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------------
          3. PORTAL ACCESS SECTION (Choose Your Portal)
          -------------------------------------------------------------------------- */}
      <section id="portals" style={{ padding: '70px 20px' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 48px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-primary-600)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Role-Based Access
            </span>
            <h2 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--color-primary-950)', marginTop: '6px' }}>
              Choose Your Portal
            </h2>
            <p style={{ fontSize: '15px', color: 'var(--color-text-muted)', marginTop: '8px' }}>
              Dedicated workstations engineered for citizens, administrators, and ground teams.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* 1. CITIZEN (Visually Primary Option) */}
            <Card
              interactive
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '32px 28px',
                border: '2px solid var(--color-primary-500)',
                boxShadow: '0 12px 30px rgba(30, 58, 138, 0.1)',
                backgroundColor: '#FFFFFF',
                position: 'relative',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '-12px',
                  left: '24px',
                  backgroundColor: 'var(--color-primary-600)',
                  color: '#FFFFFF',
                  fontSize: '11px',
                  fontWeight: '800',
                  padding: '3px 12px',
                  borderRadius: 'var(--radius-full)',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}
              >
                Primary Public Entry
              </div>

              <div>
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: 'var(--radius-lg)',
                    backgroundColor: 'var(--color-primary-50)',
                    color: 'var(--color-primary-600)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '20px',
                  }}
                >
                  <User size={30} />
                </div>
                <h3 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--color-primary-950)', marginBottom: '8px' }}>
                  Citizen Portal
                </h3>
                <p style={{ fontSize: '14.5px', color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: '24px' }}>
                  Report civic issues and track your complaints.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <Link to="/citizen/login">
                  <Button
                    variant="primary"
                    fullWidth
                    size="lg"
                    iconEnd={<ArrowRight size={18} />}
                    style={{ fontWeight: '700' }}
                  >
                    Citizen Portal
                  </Button>
                </Link>
                <Link to="/citizen/register">
                  <Button variant="ghost" fullWidth size="sm">
                    New user? Register here
                  </Button>
                </Link>
              </div>
            </Card>

            {/* 2. ADMIN */}
            <Card
              interactive
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '32px 28px',
                borderTop: '4px solid #92400E',
                backgroundColor: '#FFFFFF',
              }}
            >
              <div>
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: 'var(--radius-lg)',
                    backgroundColor: '#FEF3C7',
                    color: '#92400E',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '20px',
                  }}
                >
                  <ShieldCheck size={30} />
                </div>
                <h3 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--color-primary-950)', marginBottom: '8px' }}>
                  Admin Portal
                </h3>
                <p style={{ fontSize: '14.5px', color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: '24px' }}>
                  Manage complaints, verify reports and assign workers.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <Link to="/admin/login">
                  <Button
                    variant="outline"
                    fullWidth
                    size="lg"
                    iconEnd={<ArrowRight size={18} />}
                    style={{ fontWeight: '700', color: '#92400E', borderColor: '#FDE68A' }}
                  >
                    Admin Portal
                  </Button>
                </Link>
                <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--color-text-subtle)', padding: '6px 0' }}>
                  Provisioned administrative access
                </div>
              </div>
            </Card>

            {/* 3. FIELD WORKER */}
            <Card
              interactive
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '32px 28px',
                borderTop: '4px solid #0284C7',
                backgroundColor: '#FFFFFF',
              }}
            >
              <div>
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: 'var(--radius-lg)',
                    backgroundColor: '#E0F2FE',
                    color: '#075985',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '20px',
                  }}
                >
                  <HardHat size={30} />
                </div>
                <h3 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--color-primary-950)', marginBottom: '8px' }}>
                  Worker Portal
                </h3>
                <p style={{ fontSize: '14.5px', color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: '24px' }}>
                  View assigned complaints and update resolution progress.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <Link to="/worker/login">
                  <Button
                    variant="outline"
                    fullWidth
                    size="lg"
                    iconEnd={<ArrowRight size={18} />}
                    style={{ fontWeight: '700', color: '#075985', borderColor: '#BAE6FD' }}
                  >
                    Worker Portal
                  </Button>
                </Link>
                <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--color-text-subtle)', padding: '6px 0' }}>
                  Assigned ground technician access
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------------
          4. TRACK COMPLAINT SECTION
          -------------------------------------------------------------------------- */}
      <section id="track-complaint" style={{ padding: '70px 20px', backgroundColor: '#FFFFFF', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="container" style={{ maxWidth: '780px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#0284C7', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Public Verification
            </span>
            <h2 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--color-primary-950)', marginTop: '6px' }}>
              Track Your Complaint
            </h2>
            <p style={{ fontSize: '15px', color: 'var(--color-text-muted)', marginTop: '8px' }}>
              Enter your complaint ID to check the latest status.
            </p>
          </div>

          <Card style={{ padding: '32px' }}>
            <form onSubmit={handleTrackSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '240px' }}>
                  <Input
                    placeholder="Enter Complaint ID (e.g. CMP-2026-8941)"
                    value={trackId}
                    onChange={(e) => setTrackId(e.target.value)}
                    iconStart={<Search size={18} />}
                  />
                </div>
                <Button type="submit" variant="primary" size="lg" iconEnd={<ArrowRight size={18} />}>
                  Track Complaint
                </Button>
              </div>

              {/* Sample Quick Chips */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', fontSize: '12.5px', color: 'var(--color-text-muted)' }}>
                <span>Try sample IDs:</span>
                {['CMP-2026-8941', 'CMP-2026-8910', 'CMP-2026-8955'].map((sample) => (
                  <button
                    key={sample}
                    type="button"
                    onClick={() => handleQuickTrack(sample)}
                    style={{
                      border: '1px solid var(--color-border)',
                      backgroundColor: 'var(--color-bg-subtle)',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontFamily: 'monospace',
                      fontWeight: '600',
                      cursor: 'pointer',
                      color: 'var(--color-primary-700)',
                    }}
                  >
                    {sample}
                  </button>
                ))}
              </div>

              {/* Error Message */}
              {trackError && (
                <div
                  style={{
                    backgroundColor: '#FEE2E2',
                    border: '1px solid #FECACA',
                    color: '#991B1B',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '13.5px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <AlertCircle size={16} />
                  <span>{trackError}</span>
                </div>
              )}

              {/* Live Track Result Card */}
              {trackedComplaint && (
                <div
                  style={{
                    marginTop: '12px',
                    padding: '20px',
                    borderRadius: 'var(--radius-lg)',
                    border: '1.5px solid var(--color-primary-300)',
                    backgroundColor: '#F8FAFC',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="complaint-id">#{trackedComplaint.complaintNumber || trackedComplaint.id}</span>
                      <h4 style={{ fontSize: '17px', fontWeight: '800', marginTop: '4px', color: 'var(--color-primary-950)' }}>
                        {trackedComplaint.category} Grievance
                      </h4>
                    </div>
                    <StatusBadge status={trackedComplaint.status} pulse={trackedComplaint.status === 'IN_PROGRESS'} />
                  </div>

                  <p style={{ fontSize: '13.5px', color: 'var(--color-text-main)', lineHeight: 1.5 }}>
                    {trackedComplaint.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2" style={{ fontSize: '12.5px', color: 'var(--color-text-muted)', paddingTop: '10px', borderTop: '1px solid var(--color-border)' }}>
                    <div>📍 <strong>Location:</strong> {trackedComplaint.address}</div>
                    <div>🏢 <strong>Department:</strong> {trackedComplaint.departmentName || 'Public Works'}</div>
                    <div>👤 <strong>Citizen:</strong> {trackedComplaint.citizenName || 'Resident'}</div>
                    <div>📅 <strong>Reported:</strong> {new Date(trackedComplaint.createdAt).toLocaleDateString()}</div>
                  </div>

                  <Button
                    variant="accent"
                    fullWidth
                    size="md"
                    onClick={() => navigate(`/citizen/complaints/${trackedComplaint.complaintNumber || trackedComplaint.id}`)}
                    iconEnd={<ArrowRight size={16} />}
                  >
                    View Full Resolution Timeline
                  </Button>
                </div>
              )}
            </form>
          </Card>
        </div>
      </section>

      {/* --------------------------------------------------------------------------
          5. ACCESSIBILITY SECTION (Made for Everyone)
          -------------------------------------------------------------------------- */}
      <section id="accessibility" style={{ padding: '70px 20px' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 48px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-accent-600)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Inclusive Civic Design
            </span>
            <h2 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--color-primary-950)', marginTop: '6px' }}>
              Made for Everyone
            </h2>
            <p style={{ fontSize: '15px', color: 'var(--color-text-muted)', marginTop: '8px' }}>
              Engineered with simple language, high contrast, and accessible navigation for all residents.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <Card style={{ padding: '24px' }}>
              <div style={{ fontSize: '24px', marginBottom: '10px' }}>🗣️</div>
              <h4 style={{ fontSize: '16.5px', fontWeight: '800', color: 'var(--color-text-main)', marginBottom: '6px' }}>
                Simple Language
              </h4>
              <p style={{ fontSize: '13.5px', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                Clear explanations without complicated legal or technical jargon.
              </p>
            </Card>

            <Card style={{ padding: '24px' }}>
              <div style={{ fontSize: '24px', marginBottom: '10px' }}>🔍</div>
              <h4 style={{ fontSize: '16.5px', fontWeight: '800', color: 'var(--color-text-main)', marginBottom: '6px' }}>
                Large Readable Text
              </h4>
              <p style={{ fontSize: '13.5px', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                High-contrast typography designed for effortless reading in all lighting conditions.
              </p>
            </Card>

            <Card style={{ padding: '24px' }}>
              <div style={{ fontSize: '24px', marginBottom: '10px' }}>🔘</div>
              <h4 style={{ fontSize: '16.5px', fontWeight: '800', color: 'var(--color-text-main)', marginBottom: '6px' }}>
                Clear Action Buttons
              </h4>
              <p style={{ fontSize: '13.5px', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                Prominent touch targets and unambiguous action labels for every task.
              </p>
            </Card>

            <Card style={{ padding: '24px' }}>
              <div style={{ fontSize: '24px', marginBottom: '10px' }}>⌨️</div>
              <h4 style={{ fontSize: '16.5px', fontWeight: '800', color: 'var(--color-text-main)', marginBottom: '6px' }}>
                Keyboard-Friendly
              </h4>
              <p style={{ fontSize: '13.5px', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                Full keyboard focus indicators and semantic HTML for screen readers.
              </p>
            </Card>

            <Card style={{ padding: '24px' }}>
              <div style={{ fontSize: '24px', marginBottom: '10px' }}>📱</div>
              <h4 style={{ fontSize: '16.5px', fontWeight: '800', color: 'var(--color-text-main)', marginBottom: '6px' }}>
                Responsive on All Devices
              </h4>
              <p style={{ fontSize: '13.5px', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                Optimized layouts tailored for smartphones, tablets, and desktop computers.
              </p>
            </Card>

            <Card style={{ padding: '24px' }}>
              <div style={{ fontSize: '24px', marginBottom: '10px' }}>🟢</div>
              <h4 style={{ fontSize: '16.5px', fontWeight: '800', color: 'var(--color-text-main)', marginBottom: '6px' }}>
                Clear Status Indicators
              </h4>
              <p style={{ fontSize: '13.5px', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                Explicit text badges that don't rely only on color to communicate progress.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------------
          6. QUICK ACTION SECTION
          -------------------------------------------------------------------------- */}
      <section id="quick-actions" style={{ padding: '50px 20px 80px', backgroundColor: '#FFFFFF', borderTop: '1px solid var(--color-border)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--color-primary-950)' }}>
              Quick Access
            </h2>
            <p style={{ fontSize: '14.5px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
              Access core municipal services instantly without scrolling
            </p>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <Link to="/citizen/report" style={{ textDecoration: 'none' }}>
              <Card interactive style={{ padding: '28px', textAlign: 'center', border: '1.5px solid var(--color-accent-400)', backgroundColor: '#F0FDF4' }}>
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>📝</div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#166534', marginBottom: '4px' }}>
                  Report an Issue
                </h3>
                <p style={{ fontSize: '13px', color: '#15803D' }}>
                  Submit photo evidence & GPS geotag
                </p>
              </Card>
            </Link>

            <a href="#track-complaint" style={{ textDecoration: 'none' }}>
              <Card interactive style={{ padding: '28px', textAlign: 'center', border: '1.5px solid #BAE6FD', backgroundColor: '#F0F9FF' }}>
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>🔍</div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0369A1', marginBottom: '4px' }}>
                  Track My Complaint
                </h3>
                <p style={{ fontSize: '13px', color: '#0284C7' }}>
                  Look up live resolution status
                </p>
              </Card>
            </a>

            <Link to="/citizen/login" style={{ textDecoration: 'none' }}>
              <Card interactive style={{ padding: '28px', textAlign: 'center', border: '1.5px solid var(--color-primary-300)', backgroundColor: '#EFF6FF' }}>
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>🔐</div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--color-primary-900)', marginBottom: '4px' }}>
                  Login to Portal
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--color-primary-700)' }}>
                  Access your personal dashboard
                </p>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------------
          7. FOOTER
          -------------------------------------------------------------------------- */}
      <footer style={{ padding: '50px 20px 30px', backgroundColor: '#0F172A', color: '#94A3B8', marginTop: 'auto' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '32px', paddingBottom: '36px', borderBottom: '1px solid #334155' }}>
            {/* Left: Official Attached Logo & Product Description */}
            <div style={{ maxWidth: '380px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                <img
                  src="/logo.png"
                  alt="Civic Complaint Portal Logo"
                  style={{ width: '42px', height: '42px', objectFit: 'contain' }}
                />
                <span style={{ fontSize: '20px', fontWeight: '800', color: '#FFFFFF', letterSpacing: '-0.02em' }}>
                  Civic Complaint Portal
                </span>
              </div>
              <p style={{ fontSize: '13.5px', color: '#CBD5E1', lineHeight: 1.6 }}>
                Built to make civic issue reporting simpler, more transparent and accessible.
              </p>
            </div>

            {/* Right: Quick Links */}
            <div style={{ display: 'flex', gap: '48px', flexWrap: 'wrap' }}>
              <div>
                <h5 style={{ fontSize: '12px', fontWeight: '700', color: '#F1F5F9', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>
                  Public Access
                </h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13.5px' }}>
                  <Link to="/" style={{ color: '#94A3B8', textDecoration: 'none' }}>Home</Link>
                  <Link to="/citizen/report" style={{ color: '#94A3B8', textDecoration: 'none' }}>Report Issue</Link>
                  <a href="#track-complaint" style={{ color: '#94A3B8', textDecoration: 'none' }}>Track Complaint</a>
                </div>
              </div>

              <div>
                <h5 style={{ fontSize: '12px', fontWeight: '700', color: '#F1F5F9', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>
                  Municipal Portals
                </h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13.5px' }}>
                  <Link to="/citizen/login" style={{ color: '#94A3B8', textDecoration: 'none' }}>Citizen Login</Link>
                  <Link to="/admin/login" style={{ color: '#94A3B8', textDecoration: 'none' }}>Admin Login</Link>
                  <Link to="/worker/login" style={{ color: '#94A3B8', textDecoration: 'none' }}>Worker Login</Link>
                </div>
              </div>
            </div>
          </div>

          <div style={{ paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', fontSize: '12.5px' }}>
            <span>© 2026 Civic Complaint Portal. Municipal Citizen Services.</span>
            <span>Civic-Tech Platform • Fast • Accessible • Transparent</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
