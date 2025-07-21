
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import CreateCampaign from '@/pages/CreateCampaign';
import BrandDashboard from '@/pages/BrandDashboard';
import { RoleProtectedRoute } from '@/components/RoleProtectedRoute';

export const ProtectedRoutes = () => {
  return (
    <Routes>
      <Route 
        path="/brand-dashboard" 
        element={
          <RoleProtectedRoute requiredRole="brand">
            <BrandDashboard />
          </RoleProtectedRoute>
        } 
      />
      <Route 
        path="/campaigns/create" 
        element={
          <RoleProtectedRoute requiredRole="brand">
            <CreateCampaign />
          </RoleProtectedRoute>
        } 
      />
      <Route path="/campaigns/:id/payment-success" element={<PaymentSuccessPage />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

const PaymentSuccessPage = () => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-black mb-4">Payment Successful!</h1>
        <p className="text-gray-600 mb-6">Your campaign has been funded and submitted for admin approval.</p>
        <button 
          onClick={() => window.location.href = '/brand-dashboard'}
          className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800"
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
};
