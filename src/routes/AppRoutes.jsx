import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

// Pages
import LandingPage from '../pages/LandingPage';
import CitizenLogin from '../pages/auth/CitizenLogin';
import CitizenRegister from '../pages/auth/CitizenRegister';
import AdminLogin from '../pages/auth/AdminLogin';
import WorkerLogin from '../pages/auth/WorkerLogin';
import CitizenDashboard from '../pages/citizen/CitizenDashboard';
import AdminDashboard from '../pages/admin/AdminDashboard';
import WorkerDashboard from '../pages/worker/WorkerDashboard';
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
        path="/citizen/*"
        element={
          <ProtectedRoute allowedRoles={['citizen']}>
            <CitizenDashboard />
          </ProtectedRoute>
        }
      />

      {/* Protected Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
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

      {/* Protected Field Worker Routes */}
      <Route
        path="/worker/dashboard"
        element={
          <ProtectedRoute allowedRoles={['worker']}>
            <WorkerDashboard />
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

      {/* 404 Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
