
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/sonner';
import LandingPage from '@/pages/LandingPage';
import Dashboard from '@/pages/Dashboard';
import AdminDashboard from '@/pages/AdminDashboard';
import AuthPage from '@/pages/AuthPage';
import BrandDashboard from '@/pages/BrandDashboard';
import CreateCampaign from '@/pages/CreateCampaign';
import BrandPayment from '@/pages/BrandPayment';
import ProtectedRoute from '@/components/ProtectedRoute';
import { RoleProtectedRoute } from '@/components/RoleProtectedRoute';
import { ThemeProvider } from '@/components/theme-provider';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <AuthProvider>
          <Router>
            <div className="min-h-screen bg-background">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin" 
                  element={<AdminDashboard />}
                />
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
                <Route 
                  path="/brand/payment" 
                  element={
                    <RoleProtectedRoute requiredRole="brand">
                      <BrandPayment />
                    </RoleProtectedRoute>
                  } 
                />
              </Routes>
              <Toaster />
            </div>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
