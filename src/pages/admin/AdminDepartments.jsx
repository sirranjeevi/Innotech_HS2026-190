import React from 'react';
import { Link } from 'react-router-dom';
import { Building, Users, FileText, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';
import { useComplaints } from '../../context/ComplaintContext';
import AdminLayout from '../../components/layout/AdminLayout';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

export default function AdminDepartments() {
  const { departments, complaints, workers } = useComplaints();

  const departmentData = departments.map((deptName) => {
    const deptComplaints = complaints.filter((c) => c.department === deptName);
    const deptWorkers = workers.filter((w) => w.department === deptName);
    const activeTasks = deptComplaints.filter((c) => c.status !== 'Resolved').length;
    const resolvedTasks = deptComplaints.filter((c) => c.status === 'Resolved').length;

    return {
      name: deptName,
      total: deptComplaints.length,
      active: activeTasks,
      resolved: resolvedTasks,
      workersCount: deptWorkers.length || 1,
      head: deptWorkers[0]?.name || 'Department Supervisor',
    };
  });

  return (
    <AdminLayout>
      <PageHeader
        title="Municipal Departments"
        subtitle="Operational workload, active grievance volume, and allocated field crews per municipal department."
        actions={
          <Link to="/admin/workers">
            <Button variant="outline" size="sm" iconStart={<Users size={15} />}>
              Field Workforce
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-6">
        {departmentData.map((dept, idx) => (
          <Card key={idx} style={{ padding: '24px' }}>
            <div className="flex items-start justify-between" style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-primary-100)',
                    color: 'var(--color-primary-700)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Building size={22} />
                </div>
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--color-text-main)' }}>
                    {dept.name}
                  </h4>
                  <p style={{ fontSize: '12.5px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                    Supervisor: <strong>{dept.head}</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* Task Metric Breakdown */}
            <div
              className="grid grid-cols-3 gap-3"
              style={{
                padding: '14px',
                backgroundColor: 'var(--color-bg-subtle)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '16px',
                textAlign: 'center',
              }}
            >
              <div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: '700' }}>TOTAL</div>
                <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--color-primary-900)' }}>{dept.total}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#0284C7', fontWeight: '700' }}>ACTIVE</div>
                <div style={{ fontSize: '18px', fontWeight: '800', color: '#0284C7' }}>{dept.active}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#16A34A', fontWeight: '700' }}>RESOLVED</div>
                <div style={{ fontSize: '18px', fontWeight: '800', color: '#16A34A' }}>{dept.resolved}</div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span style={{ fontSize: '12.5px', color: 'var(--color-text-muted)' }}>
                Field Crew Strength: <strong>{dept.workersCount} assigned specialists</strong>
              </span>
              <Link to={`/admin/complaints`}>
                <Button variant="ghost" size="sm" iconEnd={<ArrowRight size={13} />}>
                  View Tasks
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </AdminLayout>
  );
}
