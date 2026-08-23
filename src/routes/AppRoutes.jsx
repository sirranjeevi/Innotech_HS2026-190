import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

// Public & Auth Pages
import LandingPage from '../pages/LandingPage';
import CitizenLogin from '../pages/auth/CitizenLogin';
import CitizenRegister from '../pages/auth/CitizenRegister';
import AdminLogin from '../pages/auth/AdminLogin';
import WorkerLogin from '../pages/auth/WorkerLogin';

// Citizen Pages (Part 2)
import CitizenDashboard from '../pages/citizen/CitizenDashboard';
import ReportIssue from '../pages/citizen/ReportIssue';
import MyComplaints from '../pages/citizen/MyComplaints';
import ComplaintDetails from '../pages/citizen/ComplaintDetails';
import CitizenNotifications from '../pages/citizen/CitizenNotifications';
import CitizenProfile from '../pages/citizen/CitizenProfile';

// Admin Pages (Part 3)
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminComplaints from '../pages/admin/AdminComplaints';
import AdminComplaintDetails from '../pages/admin/AdminComplaintDetails';
import AdminMap from '../pages/admin/AdminMap';
import AdminDepartments from '../pages/admin/AdminDepartments';
import AdminWorkers from '../pages/admin/AdminWorkers';
import AdminNotifications from '../pages/admin/AdminNotifications';
import AdminProfile from '../pages/admin/AdminProfile';

// Worker Pages (Part 3)
import WorkerDashboard from '../pages/worker/WorkerDashboard';
import WorkerTasks from '../pages/worker/WorkerTasks';
import WorkerTaskDetails from '../pages/worker/WorkerTaskDetails';
import WorkerNotifications from '../pages/worker/WorkerNotifications';
import WorkerProfile from '../pages/worker/WorkerProfile';

// Fallback
import NotFound from '../pages/NotFound';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Landing Page */}
      <Route path="/" element={<LandingPage />} />

      {/* Authentication Pages */}
      <Route path="/citizen/login" element={<CitizenLogin />} />
      <Route path="/citizen/register" element={<CitizenRegister />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/worker/login" element={<WorkerLogin />} />

      {/* Protected Citizen Routes */}
      <Route
        path="/citizen/dashboard"
        element={
          <ProtectedRoute allowedRoles={['citizen']}>
            <CitizenDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/citizen/report"
        element={
          <ProtectedRoute allowedRoles={['citizen']}>
            <ReportIssue />
          </ProtectedRoute>
        }
      />
      <Route
        path="/citizen/complaints"
        element={
          <ProtectedRoute allowedRoles={['citizen']}>
            <MyComplaints />
          </ProtectedRoute>
        }
      />
      <Route
        path="/citizen/complaints/:id"
        element={
          <ProtectedRoute allowedRoles={['citizen']}>
            <ComplaintDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/citizen/notifications"
        element={
          <ProtectedRoute allowedRoles={['citizen']}>
            <CitizenNotifications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/citizen/profile"
        element={
          <ProtectedRoute allowedRoles={['citizen']}>
            <CitizenProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/citizen/*"
        element={
          <ProtectedRoute allowedRoles={['citizen']}>
            <CitizenDashboard />
          </ProtectedRoute>
        }
      />

      {/* Protected Admin Routes (Part 3) */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/complaints"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminComplaints />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/complaints/:id"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminComplaintDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/map"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminMap />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/departments"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDepartments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/workers"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminWorkers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/notifications"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminNotifications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/profile"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Protected Field Worker Routes (Part 3) */}
      <Route
        path="/worker/dashboard"
        element={
          <ProtectedRoute allowedRoles={['worker']}>
            <WorkerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/worker/tasks"
        element={
          <ProtectedRoute allowedRoles={['worker']}>
            <WorkerTasks />
          </ProtectedRoute>
        }
      />
      <Route
        path="/worker/tasks/:id"
        element={
          <ProtectedRoute allowedRoles={['worker']}>
            <WorkerTaskDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/worker/notifications"
        element={
          <ProtectedRoute allowedRoles={['worker']}>
            <WorkerNotifications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/worker/profile"
        element={
          <ProtectedRoute allowedRoles={['worker']}>
            <WorkerProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/worker/*"
        element={
          <ProtectedRoute allowedRoles={['worker']}>
            <WorkerDashboard />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
