import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Wrench,
  Eye,
  Calendar,
  MapPin,
  Tag,
  CheckCircle,
  Clock,
  ClipboardList
} from 'lucide-react';
import { useComplaints } from '../../context/ComplaintContext';
import WorkerLayout from '../../components/layout/WorkerLayout';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import Table from '../../components/common/Table';
import EmptyState from '../../components/common/EmptyState';

export default function WorkerTasks() {
  const { complaints } = useComplaints();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredTasks = useMemo(() => {
    return complaints.filter((item) => {
      const matchesSearch =
        item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.address && item.address.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      if (statusFilter === 'ALL') return true;
      if (statusFilter === 'ASSIGNED') return item.status?.toLowerCase() === 'assigned';
      if (statusFilter === 'ACCEPTED') return item.status?.toLowerCase() === 'accepted';
      if (statusFilter === 'IN_PROGRESS') return item.status?.toLowerCase() === 'in progress' || item.status?.toLowerCase() === 'in_progress';
      if (statusFilter === 'RESOLVED') return item.status?.toLowerCase() === 'resolved';

      return true;
    });
  }, [complaints, searchQuery, statusFilter]);

  const columns = [
    {
      key: 'id',
      header: 'Complaint ID',
      width: '150px',
      render: (val) => <span className="complaint-id">#{val}</span>,
    },
    {
      key: 'category',
      header: 'Category',
      width: '160px',
      render: (val) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}>
          <Tag size={14} color="var(--color-accent-600)" />
          <span>{val}</span>
        </div>
      ),
    },
    {
      key: 'location',
      header: 'Location / Title',
      render: (_, row) => (
        <div>
          <div style={{ fontWeight: '600', color: 'var(--color-text-main)' }}>{row.title}</div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
            <MapPin size={12} color="var(--color-accent-600)" />
            <span>{row.address || row.location}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: '140px',
      render: (val) => <StatusBadge status={val} pulse={val?.toLowerCase() === 'in progress'} />,
    },
    {
      key: 'createdAt',
      header: 'Date',
      width: '130px',
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
      width: '110px',
      align: 'right',
      render: (_, row) => (
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/worker/tasks/${row.id}`);
          }}
          iconStart={<Eye size={13} />}
        >
          View Task
        </Button>
      ),
    },
  ];

  return (
    <WorkerLayout>
      <PageHeader
        title="Field Task Work Orders"
        subtitle="Manage, accept, start work on, and resolve your allocated ground tasks."
      />

      {/* Filter Tabs & Search Bar */}
      <Card style={{ padding: '16px 20px', marginBottom: '24px' }}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          {/* Status Filter Tabs */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { id: 'ALL', label: 'All Orders', count: complaints.length },
              {
                id: 'ASSIGNED',
                label: 'Assigned',
                count: complaints.filter((c) => c.status?.toLowerCase() === 'assigned').length,
              },
              {
                id: 'ACCEPTED',
                label: 'Accepted',
                count: complaints.filter((c) => c.status?.toLowerCase() === 'accepted').length,
              },
              {
                id: 'IN_PROGRESS',
                label: 'In Progress',
                count: complaints.filter((c) => c.status?.toLowerCase() === 'in progress' || c.status?.toLowerCase() === 'in_progress').length,
              },
              {
                id: 'RESOLVED',
                label: 'Resolved',
                count: complaints.filter((c) => c.status?.toLowerCase() === 'resolved').length,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`btn btn-sm ${statusFilter === tab.id ? 'btn-primary' : 'btn-secondary'}`}
                style={{ borderRadius: 'var(--radius-full)', padding: '6px 14px', fontSize: '12.5px' }}
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
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              iconStart={<Search size={16} />}
            />
          </div>
        </div>
      </Card>

      {/* Task Table */}
      {filteredTasks.length === 0 ? (
        <Card style={{ padding: '40px 20px' }}>
          <EmptyState
            title="No Matching Tasks Found"
            description={
              searchQuery
                ? `No work orders matched "${searchQuery}".`
                : 'No tasks found under this status filter.'
            }
          />
        </Card>
      ) : (
        <Table
          columns={columns}
          data={filteredTasks}
          onRowClick={(row) => navigate(`/worker/tasks/${row.id}`)}
        />
      )}
    </WorkerLayout>
  );
}
