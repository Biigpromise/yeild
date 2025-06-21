
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import { OnboardingProvider } from '@/contexts/OnboardingContext';
import ErrorBoundary from '@/components/ErrorBoundary';
import Index from '@/pages/Index';
import Dashboard from '@/pages/Dashboard';
import Tasks from '@/pages/Tasks';
import Profile from '@/pages/Profile';
import Admin from '@/pages/Admin';
import Login from '@/pages/Login';
import SignUp from '@/pages/SignUp';
import ForgotPassword from '@/pages/ForgotPassword';
import BrandDashboard from '@/pages/BrandDashboard';
import BrandSignup from '@/pages/BrandSignup';
import NotFound from '@/pages/NotFound';
import ProtectedRoute from '@/components/ProtectedRoute';
import { RoleProtectedRoute } from '@/components/RoleProtectedRoute';
import { PhoenixUserProvider } from '@/components/referral/PhoenixUserProvider';

function App() {
  const queryClient = new QueryClient();

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <OnboardingProvider>
              <PhoenixUserProvider>
                <div className="min-h-screen bg-background">
                  <Toaster />
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<SignUp />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/brand-signup" element={<BrandSignup />} />
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
                      path="/profile"
                      element={
                        <ProtectedRoute>
                          <Profile />
                        </ProtectedRoute>
                      }
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
                      path="/admin"
                      element={
                        <RoleProtectedRoute requiredRole="admin">
                          <Admin />
                        </RoleProtectedRoute>
                      }
                    />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </div>
              </PhoenixUserProvider>
            </OnboardingProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
