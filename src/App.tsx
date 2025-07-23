import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { OnboardingProvider } from '@/contexts/OnboardingContext';
import { Toaster } from '@/components/ui/sonner';
import Welcome from '@/pages/Welcome';
import Dashboard from '@/pages/Dashboard';
import AdminDashboard from '@/pages/AdminDashboard';
import AuthPage from '@/pages/AuthPage';
import BrandDashboard from '@/pages/BrandDashboard';
import CreateCampaign from '@/pages/CreateCampaign';
import BrandPayment from '@/pages/BrandPayment';
import Tasks from '@/pages/Tasks';
import Chat from '@/pages/Chat';
import Admin from '@/pages/Admin';
import Onboarding from '@/pages/Onboarding';
import ProtectedRoute from '@/components/ProtectedRoute';
import { RoleProtectedRoute } from '@/components/RoleProtectedRoute';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <OnboardingProvider>
            <Router>
              <div className="min-h-screen bg-background">
                <Routes>
                  <Route path="/" element={<Welcome />} />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/onboarding" element={
                    <ProtectedRoute>
                      <Onboarding />
                    </ProtectedRoute>
                  } />
                  <Route 
                    path="/dashboard" 
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/tasks" 
                    element={
                      <ProtectedRoute>
                        <Tasks />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/chat" 
                    element={
                      <ProtectedRoute>
                        <Chat />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin" 
                    element={<Admin />}
                  />
                  <Route 
                    path="/admin-dashboard" 
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
          </OnboardingProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
