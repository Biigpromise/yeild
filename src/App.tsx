
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { OnboardingProvider } from '@/contexts/OnboardingContext';

// Import pages
import Index from '@/pages/Index';
import AuthPage from '@/pages/AuthPage';
import Dashboard from '@/pages/Dashboard';
import BrandDashboard from '@/pages/BrandDashboard';
import CreateCampaign from '@/pages/CreateCampaign';
import BrandPayment from '@/pages/BrandPayment';
import AdminDashboard from '@/pages/AdminDashboard';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <OnboardingProvider>
            <div className="min-h-screen bg-background">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/brand-dashboard" element={<BrandDashboard />} />
                <Route path="/campaigns/create" element={<CreateCampaign />} />
                <Route path="/brand/payment" element={<BrandPayment />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              <Toaster position="top-right" />
            </div>
          </OnboardingProvider>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
