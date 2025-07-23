
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { OnboardingProvider } from '@/contexts/OnboardingContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

// Import pages
import Index from '@/pages/Index';
import AuthPage from '@/pages/AuthPage';
import Dashboard from '@/pages/Dashboard';
import BrandDashboard from '@/pages/BrandDashboard';
import CreateCampaign from '@/pages/CreateCampaign';
import BrandPayment from '@/pages/BrandPayment';
import AdminDashboard from '@/pages/AdminDashboard';
import WithdrawalPage from '@/pages/WithdrawalPage';

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
      <ThemeProvider>
        <Router>
          <AuthProvider>
            <OnboardingProvider>
              <div className="min-h-screen bg-background">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/signup" element={<Navigate to="/auth" replace />} />
                  <Route path="/login" element={<Navigate to="/auth?mode=signin" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/brand-dashboard" element={<BrandDashboard />} />
                  <Route path="/campaigns/create" element={<CreateCampaign />} />
                  <Route path="/brand/payment" element={<BrandPayment />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/withdrawal" element={<WithdrawalPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
                <Toaster position="top-right" />
              </div>
            </OnboardingProvider>
          </AuthProvider>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
