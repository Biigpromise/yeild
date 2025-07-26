
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const BrandAuth: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/brand-dashboard" replace />;
  }

  return <Navigate to="/auth" replace />;
};

export default BrandAuth;
