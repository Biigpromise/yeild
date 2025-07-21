import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

// Import pages
import BrandDashboard from '@/pages/BrandDashboard';
import CreateCampaign from '@/pages/CreateCampaign';
import BrandPayment from '@/pages/BrandPayment';

export const ProtectedRoutes: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-yeild-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yeild-yellow mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <Routes>
      <Route path="/brand-dashboard" element={<BrandDashboard />} />
      <Route path="/campaigns/create" element={<CreateCampaign />} />
      <Route path="/brand/payment" element={<BrandPayment />} />
      {/* Add more protected routes here */}
    </Routes>
  );
};
