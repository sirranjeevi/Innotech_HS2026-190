import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search,
  PlusCircle,
  Eye,
  Calendar,
  MapPin,
  Tag,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useComplaints } from '../../context/ComplaintContext';
import CitizenLayout from '../../components/layout/CitizenLayout';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import Table from '../../components/common/Table';
import EmptyState from '../../components/common/EmptyState';

export default function MyComplaints() {
  const { user } = useAuth();
  const { complaints } = useComplaints();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredComplaints = useMemo(() => {
    return complaints.filter((item) => {
      const q = searchQuery.toLowerCase();
      const num = (item.complaintNumber || item.id || '').toLowerCase();
      const cat = (item.category || '').toLowerCase();
      const desc = (item.description || '').toLowerCase();
      const addr = (item.address || '').toLowerCase();

      const matchesSearch = !q || num.includes(q) || cat.includes(q) || desc.includes(q) || addr.includes(q);
      if (!matchesSearch) return false;

      if (statusFilter === 'ALL') return true;
      if (statusFilter === 'SUBMITTED') return item.status === 'SUBMITTED';
      if (statusFilter === 'IN_PROGRESS') return item.status === 'IN_PROGRESS' || item.status === 'ACCEPTED' || item.status === 'ASSIGNED';
      if (statusFilter === 'RESOLVED') return item.status === 'RESOLVED';

      return true;
    });
  }, [complaints, searchQuery, statusFilter]);

  const columns = [
    {
      key: 'complaintNumber',
      header: 'Complaint ID',
      width: '160px',
      render: (val, row) => <span className="complaint-id">#{val || row.id}</span>,
    },
    {
      key: 'category',
      header: 'Category',
      width: '160px',
      render: (val) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}>
          <Tag size={14} color="var(--color-primary-600)" />
          <span>{val}</span>
        </div>
      ),
    },
    {
      key: 'address',
      header: 'Location / Landmark',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: '600', color: 'var(--color-text-main)' }}>{row.category} at {val?.split(',')[0]}</div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
            <MapPin size={12} color="var(--color-accent-600)" />
            <span>{val || `(${row.latitude}, ${row.longitude})`}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: '140px',
      render: (val) => <StatusBadge status={val} pulse={val === 'IN_PROGRESS'} />,
    },
    {
      key: 'createdAt',
      header: 'Date',
      width: '130px',
      render: (val) => (
        <div style={{ fontSize: '12.5px', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Calendar size={13} />
          <span>
            {new Date(val).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Action',
      width: '100px',
      align: 'right',
      render: (_, row) => (
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/citizen/complaints/${row.complaintNumber || row.id}`);
          }}
          iconStart={<Eye size={13} />}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <CitizenLayout>
      <PageHeader
        title="My Registered Complaints"
        subtitle="Review, search, and monitor all your filed municipal grievances in real-time."
        actions={
          <Link to="/citizen/report">
            <Button variant="accent" iconStart={<PlusCircle size={17} />}>
              Report Issue
            </Button>
          </Link>
        }
      />

      {/* Filter & Search Toolbar */}
      <Card style={{ padding: '16px 20px', marginBottom: '24px' }}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          {/* Status Filter Tabs */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { id: 'ALL', label: 'All Complaints', count: complaints.length },
              {
                id: 'SUBMITTED',
                label: 'Submitted',
                count: complaints.filter((c) => c.status === 'SUBMITTED').length,
              },
              {
                id: 'IN_PROGRESS',
                label: 'In Progress',
                count: complaints.filter((c) => c.status === 'IN_PROGRESS' || c.status === 'ACCEPTED' || c.status === 'ASSIGNED').length,
              },
              {
                id: 'RESOLVED',
                label: 'Resolved',
                count: complaints.filter((c) => c.status === 'RESOLVED').length,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`btn btn-sm ${statusFilter === tab.id ? 'btn-primary' : 'btn-secondary'}`}
                style={{ borderRadius: 'var(--radius-full)', padding: '6px 14px' }}
                onClick={() => setStatusFilter(tab.id)}
              >
                <span>{tab.label}</span>
                <span
                  style={{
                    fontSize: '11px',
                    padding: '1px 6px',
                    borderRadius: '10px',
                    backgroundColor: statusFilter === tab.id ? 'rgba(255,255,255,0.25)' : 'var(--color-border)',
                  }}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div style={{ width: '100%', maxWidth: '300px' }}>
            <Input
              placeholder="Search by ID, keyword, or street..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              iconStart={<Search size={16} />}
            />
          </div>
        </div>
      </Card>

      {/* Complaints Table */}
      {filteredComplaints.length === 0 ? (
        <Card style={{ padding: '40px 20px' }}>
          <EmptyState
            title="No Matching Grievances"
            description={
              searchQuery
                ? `No grievances matched "${searchQuery}".`
                : 'No complaints under this status category.'
            }
            action={
              <Link to="/citizen/report">
                <Button variant="accent" size="sm" iconStart={<PlusCircle size={15} />}>
                  Lodge New Grievance
                </Button>
              </Link>
            }
          />
        </Card>
      ) : (
        <Table
          columns={columns}
          data={filteredComplaints}
          onRowClick={(row) => navigate(`/citizen/complaints/${row.complaintNumber || row.id}`)}
        />
      )}
    </CitizenLayout>
  );
}
