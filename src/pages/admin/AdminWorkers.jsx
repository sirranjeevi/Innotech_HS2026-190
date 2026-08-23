import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Phone, Mail, MapPin, Wrench, CheckCircle, ShieldCheck, ArrowRight } from 'lucide-react';
import { useComplaints, MUNICIPAL_WORKERS } from '../../context/ComplaintContext';
import AdminLayout from '../../components/layout/AdminLayout';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';

export default function AdminWorkers() {
  const { workers, complaints } = useComplaints();

  const columns = [
    {
      key: 'name',
      header: 'Specialist Name',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: '700', color: 'var(--color-text-main)' }}>{val}</div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{row.specialty}</div>
        </div>
      ),
    },
    {
      key: 'department',
      header: 'Department',
      render: (val) => (
        <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-primary-800)' }}>
          {val}
        </span>
      ),
    },
    {
      key: 'zone',
      header: 'Assigned Zone',
      render: (val) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12.5px' }}>
          <MapPin size={13} color="var(--color-accent-600)" />
          <span>{val}</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Duty Status',
      render: (val) => (
        <span
          style={{
            fontSize: '11.5px',
            fontWeight: '700',
            padding: '3px 8px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: val === 'Dispatched' ? '#E0F2FE' : '#DCFCE7',
            color: val === 'Dispatched' ? '#075985' : '#166534',
          }}
        >
          {val}
        </span>
      ),
    },
    {
      key: 'contact',
      header: 'Contact Info',
      render: (_, row) => (
        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
          <div>{row.phone}</div>
          <div style={{ fontSize: '11px', color: 'var(--color-text-subtle)' }}>{row.email}</div>
        </div>
      ),
    },
    {
      key: 'activeTasks',
      header: 'Active Tasks',
      align: 'center',
      render: (_, row) => {
        const count = complaints.filter(
          (c) => c.worker === row.name && c.status !== 'Resolved'
        ).length;
        return (
          <span
            style={{
              fontSize: '13px',
              fontWeight: '800',
              color: count > 0 ? '#0284C7' : '#64748B',
            }}
          >
            {count}
          </span>
        );
      },
    },
  ];

  return (
    <AdminLayout>
      <PageHeader
        title="Field Workforce Directory"
        subtitle="Manage municipal technicians, plumbers, electricians, and civil repair units."
      />

      <Card header="Registered Field Specialists Roster">
        <Table columns={columns} data={workers} />
      </Card>
    </AdminLayout>
  );
}
