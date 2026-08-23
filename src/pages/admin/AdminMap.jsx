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
  X,
  AlertTriangle
} from 'lucide-react';
import { useComplaints } from '../../context/ComplaintContext';
import AdminLayout from '../../components/layout/AdminLayout';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import GoogleMapComponent from '../../components/common/GoogleMapComponent';

export default function AdminMap() {
  const { complaints } = useComplaints();
  const navigate = useNavigate();

  const [selectedMarker, setSelectedMarker] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const filteredComplaints = complaints.filter((c) => {
    if (categoryFilter === 'ALL') return true;
    return c.category === categoryFilter;
  });

  const categories = ['ALL', ...new Set(complaints.map((c) => c.category))];

  return (
    <AdminLayout>
      <PageHeader
        title="Municipal Google Maps GIS View"
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

      {/* Google Maps Multi-Marker GIS Map Component */}
      <GoogleMapComponent
        mode="admin"
        markers={filteredComplaints}
        onMarkerClick={(complaint) => setSelectedMarker(complaint)}
        height="560px"
      />

      {/* Marker Detail Popup Modal */}
      {selectedMarker && (
        <Modal
          isOpen={!!selectedMarker}
          onClose={() => setSelectedMarker(null)}
          title={`Grievance #${selectedMarker.complaintNumber || selectedMarker.id}`}
          maxWidth="480px"
          footer={
            <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
              <Button
                variant="primary"
                fullWidth
                iconEnd={<ArrowRight size={16} />}
                onClick={() => navigate(`/admin/complaints/${selectedMarker.complaintNumber || selectedMarker.id}`)}
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
              <span className="complaint-id">#{selectedMarker.complaintNumber || selectedMarker.id}</span>
              <StatusBadge status={selectedMarker.status} />
            </div>

            {selectedMarker.isPossibleDuplicate && (
              <div
                style={{
                  padding: '6px 10px',
                  backgroundColor: '#FEF3C7',
                  borderRadius: '4px',
                  fontSize: '12px',
                  color: '#92400E',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <AlertTriangle size={13} />
                <span>Possible Duplicate of #{selectedMarker.duplicateMatchedNumber}</span>
              </div>
            )}

            <div>
              <h4 style={{ fontSize: '16px', fontWeight: '800' }}>
                {selectedMarker.category} Grievance
              </h4>
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
              <div><strong>Location:</strong> {selectedMarker.address}</div>
              <div><strong>Department:</strong> {selectedMarker.departmentName || 'Public Works'}</div>
              <div><strong>Assigned Specialist:</strong> {selectedMarker.workerName || 'Unassigned'}</div>
            </div>
          </div>
        </Modal>
      )}
    </AdminLayout>
  );
}
