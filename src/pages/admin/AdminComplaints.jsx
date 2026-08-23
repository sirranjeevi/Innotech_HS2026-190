import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search,
  Filter,
  Eye,
  Calendar,
  MapPin,
  Tag,
  Building,
  User,
  ShieldCheck,
  RotateCcw,
  Compass,
  AlertTriangle
} from 'lucide-react';
import { useComplaints } from '../../context/ComplaintContext';
import AdminLayout from '../../components/layout/AdminLayout';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import Table from '../../components/common/Table';
import EmptyState from '../../components/common/EmptyState';

const CATEGORIES = [
  'Garbage',
  'Pothole',
  'Street Light',
  'Water Leakage',
  'Drainage',
  'Public Infrastructure',
  'Other',
];

const STATUSES = [
  { value: 'SUBMITTED', label: 'Submitted' },
  { value: 'VERIFIED', label: 'Verified' },
  { value: 'ASSIGNED', label: 'Assigned' },
  { value: 'ACCEPTED', label: 'Accepted' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'RESOLVED', label: 'Resolved' },
];

export default function AdminComplaints() {
  const { complaints, departments, workers } = useComplaints();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [workerFilter, setWorkerFilter] = useState('');

  const filteredComplaints = useMemo(() => {
    return complaints.filter((item) => {
      const q = searchQuery.toLowerCase();
      const num = (item.complaintNumber || item.id || '').toLowerCase();
      const citizen = (item.citizenName || '').toLowerCase();
      const desc = (item.description || '').toLowerCase();
      const addr = (item.address || '').toLowerCase();

      const matchesSearch = !q || num.includes(q) || citizen.includes(q) || desc.includes(q) || addr.includes(q);
      if (!matchesSearch) return false;

      if (categoryFilter && item.category !== categoryFilter) return false;
      if (statusFilter && item.status !== statusFilter) return false;
      if (departmentFilter && item.departmentId !== departmentFilter && item.departmentName !== departmentFilter) return false;
      if (workerFilter && item.workerId !== workerFilter && item.workerName !== workerFilter) return false;

      return true;
    });
  }, [complaints, searchQuery, categoryFilter, statusFilter, departmentFilter, workerFilter]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setCategoryFilter('');
    setStatusFilter('');
    setDepartmentFilter('');
    setWorkerFilter('');
  };

  const columns = [
    {
      key: 'complaintNumber',
      header: 'Complaint ID',
      width: '160px',
      render: (val, row) => (
        <div>
          <span className="complaint-id">#{val || row.id}</span>
          {row.isPossibleDuplicate && (
            <div style={{ marginTop: '2px' }}>
              <span
                style={{
                  fontSize: '10.5px',
                  fontWeight: '700',
                  backgroundColor: '#FEF3C7',
                  color: '#92400E',
                  padding: '1px 5px',
                  borderRadius: '4px',
                  border: '1px solid #FDE68A',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                }}
              >
                <AlertTriangle size={10} /> Duplicate?
              </span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      width: '150px',
      render: (val) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}>
          <Tag size={14} color="var(--color-primary-600)" />
          <span>{val}</span>
        </div>
      ),
    },
    {
      key: 'address',
      header: 'Location / Citizen',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: '600', color: 'var(--color-text-main)' }}>{row.category} at {val?.split(',')[0]}</div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
            <MapPin size={12} color="var(--color-accent-600)" />
            <span>Citizen: <strong>{row.citizenName || 'Resident'}</strong> • {val}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'departmentName',
      header: 'Department',
      width: '190px',
      render: (val) => (
        <span style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--color-primary-800)' }}>
          {val || 'General Admin'}
        </span>
      ),
    },
    {
      key: 'workerName',
      header: 'Worker',
      width: '170px',
      render: (val) => (
        <div style={{ fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <User size={13} color="var(--color-text-muted)" />
          <span style={{ color: val && val !== 'Unassigned' ? 'var(--color-text-main)' : '#94A3B8' }}>
            {val || 'Unassigned'}
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: '130px',
      render: (val) => <StatusBadge status={val} pulse={val === 'SUBMITTED' || val === 'IN_PROGRESS'} />,
    },
    {
      key: 'createdAt',
      header: 'Date',
      width: '120px',
      render: (val) => (
        <span style={{ fontSize: '12.5px', color: 'var(--color-text-muted)' }}>
          {new Date(val).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </span>
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
            navigate(`/admin/complaints/${row.complaintNumber || row.id}`);
          }}
          iconStart={<Eye size={13} />}
        >
          Manage
        </Button>
      ),
    },
  ];

  return (
    <AdminLayout>
      <PageHeader
        title="Municipal Grievance Registry"
        subtitle="Manage, inspect, verify, and assign all citizen grievances across municipal departments."
        actions={
          <Link to="/admin/map">
            <Button variant="outline" size="sm" iconStart={<Compass size={15} />}>
              Open Map View
            </Button>
          </Link>
        }
      />

      {/* 5 Filter Dimensions Toolbar */}
      <Card style={{ padding: '20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Top Search & Reset Row */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div style={{ flex: 1, minWidth: '280px' }}>
              <Input
                placeholder="Search by ID, keyword, citizen name, or street..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                iconStart={<Search size={16} />}
              />
            </div>

            {(categoryFilter || statusFilter || departmentFilter || workerFilter || searchQuery) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                iconStart={<RotateCcw size={14} />}
              >
                Reset Filters
              </Button>
            )}
          </div>

          {/* 4 Multi-Select Dropdowns */}
          <div className="grid grid-cols-4 gap-3">
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              placeholder="All Categories"
              options={CATEGORIES.map((c) => ({ value: c, label: c }))}
            />

            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              placeholder="All Statuses"
              options={STATUSES}
            />

            <Select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              placeholder="All Departments"
              options={departments.map((d) => ({ value: d.name, label: d.name }))}
            />

            <Select
              value={workerFilter}
              onChange={(e) => setWorkerFilter(e.target.value)}
              placeholder="All Assigned Workers"
              options={workers.map((w) => ({ value: w.name, label: w.name }))}
            />
          </div>
        </div>
      </Card>

      {/* Complaints Table */}
      {filteredComplaints.length === 0 ? (
        <Card style={{ padding: '40px 20px' }}>
          <EmptyState
            title="No Matching Complaints Found"
            description="No municipal grievances match your selected filter criteria. Try adjusting or resetting the filters."
            action={
              <Button variant="outline" size="sm" onClick={handleResetFilters}>
                Clear All Filters
              </Button>
            }
          />
        </Card>
      ) : (
        <Table
          columns={columns}
          data={filteredComplaints}
          onRowClick={(row) => navigate(`/admin/complaints/${row.complaintNumber || row.id}`)}
        />
      )}
    </AdminLayout>
  );
}
