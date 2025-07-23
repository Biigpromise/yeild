
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { AdminDashboard as AdminDashboardComponent } from '@/components/admin/AdminDashboard';

const AdminDashboard = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check if user is admin
  if (!user || user.email !== 'yeildsocials@gmail.com') {
    return <Navigate to="/dashboard" replace />;
  }

  return <AdminDashboardComponent />;
};

export default AdminDashboard;
