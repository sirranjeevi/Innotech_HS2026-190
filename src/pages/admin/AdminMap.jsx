import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Compass,
  MapPin,
  Layers,
  ArrowRight,
  Filter,
  Eye,
  Building,
  User,
  Calendar,
  X
} from 'lucide-react';
import { useComplaints } from '../../context/ComplaintContext';
import AdminLayout from '../../components/layout/AdminLayout';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';

export default function AdminMap() {
  const { complaints } = useComplaints();
  const navigate = useNavigate();

  const [selectedMarker, setSelectedMarker] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Assign simulated map x, y coordinates for visual distribution
  const markerPositions = [
    { x: '24%', y: '32%' },
    { x: '68%', y: '28%' },
    { x: '45%', y: '62%' },
    { x: '78%', y: '70%' },
    { x: '18%', y: '75%' },
    { x: '52%', y: '38%' },
    { x: '35%', y: '82%' },
  ];

  const filteredComplaints = complaints.filter((c) => {
    if (categoryFilter === 'ALL') return true;
    return c.category === categoryFilter;
  });

  const categories = ['ALL', ...new Set(complaints.map((c) => c.category))];

  return (
    <AdminLayout>
      <PageHeader
        title="Municipal GIS Geospatial Map"
        subtitle="Visual map overview of all registered citizen complaints with interactive marker inspection."
        actions={
          <Link to="/admin/complaints">
            <Button variant="outline" size="sm">
              Table View
            </Button>
          </Link>
        }
      />

      {/* Map Category Filter Pills */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '18px' }}>
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`btn btn-sm ${categoryFilter === cat ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: 'var(--radius-full)', padding: '5px 14px', fontSize: '12.5px' }}
            onClick={() => setCategoryFilter(cat)}
          >
            {cat === 'ALL' ? 'All Categories' : cat}
          </button>
        ))}
      </div>

      {/* Main Interactive Map Canvas */}
      <Card style={{ overflow: 'hidden', padding: 0 }}>
        <div
          style={{
            position: 'relative',
            height: '620px',
            width: '100%',
            backgroundColor: '#E2E8F0',
            backgroundImage: `
              linear-gradient(rgba(203, 213, 225, 0.7) 1.5px, transparent 1.5px),
              linear-gradient(90deg, rgba(203, 213, 225, 0.7) 1.5px, transparent 1.5px),
              radial-gradient(circle at 40% 40%, #EFF6FF 0%, #DBEAFE 100%)
            `,
            backgroundSize: '40px 40px, 40px 40px, 100% 100%',
            overflow: 'hidden',
          }}
        >
          {/* Simulated Road Arteries */}
          <div
            style={{
              position: 'absolute',
              top: '40%',
              left: 0,
              right: 0,
              height: '18px',
              backgroundColor: '#CBD5E1',
              transform: 'rotate(-4deg)',
              opacity: 0.8,
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '65%',
              left: 0,
              right: 0,
              height: '14px',
              backgroundColor: '#CBD5E1',
              transform: 'rotate(8deg)',
              opacity: 0.8,
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: '38%',
              width: '18px',
              backgroundColor: '#CBD5E1',
              transform: 'rotate(6deg)',
              opacity: 0.8,
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: '72%',
              width: '14px',
              backgroundColor: '#CBD5E1',
              transform: 'rotate(-8deg)',
              opacity: 0.8,
            }}
          />

          {/* District Labels */}
          <div style={{ position: 'absolute', top: '15%', left: '15%', color: '#94A3B8', fontWeight: '800', fontSize: '13px', letterSpacing: '0.08em' }}>
            NORTH DISTRICT ZONE 4
          </div>
          <div style={{ position: 'absolute', top: '20%', right: '15%', color: '#94A3B8', fontWeight: '800', fontSize: '13px', letterSpacing: '0.08em' }}>
            EAST DISTRICT ZONE 2
          </div>
          <div style={{ position: 'absolute', bottom: '15%', left: '20%', color: '#94A3B8', fontWeight: '800', fontSize: '13px', letterSpacing: '0.08em' }}>
            CENTRAL DISTRICT ZONE 1
          </div>
          <div style={{ position: 'absolute', bottom: '20%', right: '20%', color: '#94A3B8', fontWeight: '800', fontSize: '13px', letterSpacing: '0.08em' }}>
            WEST DISTRICT ZONE 3
          </div>

          {/* Interactive Complaint Markers */}
          {filteredComplaints.map((item, idx) => {
            const pos = markerPositions[idx % markerPositions.length];
            const isResolved = item.status?.toLowerCase() === 'resolved';
            const isInProgress = item.status?.toLowerCase() === 'in progress' || item.status?.toLowerCase() === 'in_progress';
            const markerColor = isResolved ? '#16A34A' : isInProgress ? '#0284C7' : '#D97706';

            return (
              <div
                key={item.id}
                style={{
                  position: 'absolute',
                  left: pos.x,
                  top: pos.y,
                  transform: 'translate(-50%, -100%)',
                  cursor: 'pointer',
                  zIndex: selectedMarker?.id === item.id ? 20 : 10,
                  transition: 'transform var(--transition-fast)',
                }}
                onClick={() => setSelectedMarker(item)}
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  {/* Marker Pin */}
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      backgroundColor: markerColor,
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
                      border: '2.5px solid #FFFFFF',
                      transition: 'transform 0.15s ease',
                      transform: selectedMarker?.id === item.id ? 'scale(1.25)' : 'scale(1)',
                    }}
                  >
                    <MapPin size={20} />
                  </div>

                  {/* Marker Label Badge */}
                  <div
                    style={{
                      backgroundColor: 'rgba(15, 23, 42, 0.85)',
                      color: '#FFFFFF',
                      fontSize: '10.5px',
                      fontWeight: '700',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-sm)',
                      marginTop: '3px',
                      whiteSpace: 'nowrap',
                      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
                    }}
                  >
                    #{item.id.split('-').pop()} • {item.category}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Top Left Floating Legend */}
          <div
            style={{
              position: 'absolute',
              top: '16px',
              left: '16px',
              backgroundColor: 'rgba(255, 255, 255, 0.94)',
              backdropFilter: 'blur(8px)',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
              fontSize: '12px',
              zIndex: 15,
            }}
          >
            <div style={{ fontWeight: '700', marginBottom: '6px' }}>Marker Status Legend</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#D97706' }} />
                <span>Submitted / Verified ({complaints.filter((c) => c.status === 'Submitted' || c.status === 'Verified').length})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#0284C7' }} />
                <span>In Field Progress ({complaints.filter((c) => c.status === 'In Progress' || c.status === 'Assigned').length})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#16A34A' }} />
                <span>Resolved ({complaints.filter((c) => c.status === 'Resolved').length})</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Marker Detail Popup Modal */}
      {selectedMarker && (
        <Modal
          isOpen={!!selectedMarker}
          onClose={() => setSelectedMarker(null)}
          title={`Grievance #${selectedMarker.id}`}
          maxWidth="480px"
          footer={
            <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
              <Button
                variant="primary"
                fullWidth
                iconEnd={<ArrowRight size={16} />}
                onClick={() => navigate(`/admin/complaints/${selectedMarker.id}`)}
              >
                View Complaint Details
              </Button>
              <Button variant="secondary" onClick={() => setSelectedMarker(null)}>
                Close
              </Button>
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="flex items-center justify-between">
              <span className="complaint-id">#{selectedMarker.id}</span>
              <StatusBadge status={selectedMarker.status} />
            </div>

            <div>
              <h4 style={{ fontSize: '16px', fontWeight: '800' }}>{selectedMarker.title}</h4>
              <p style={{ fontSize: '13.5px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                {selectedMarker.description}
              </p>
            </div>

            <div
              style={{
                padding: '12px',
                backgroundColor: 'var(--color-bg-subtle)',
                borderRadius: 'var(--radius-md)',
                fontSize: '13px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
            >
              <div><strong>Category:</strong> {selectedMarker.category}</div>
              <div><strong>Location:</strong> {selectedMarker.address || selectedMarker.location}</div>
              <div><strong>Department:</strong> {selectedMarker.department}</div>
              <div><strong>Assigned Specialist:</strong> {selectedMarker.worker || 'Unassigned'}</div>
            </div>
          </div>
        </Modal>
      )}
    </AdminLayout>
  );
}
