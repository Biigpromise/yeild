
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import { OnboardingProvider } from '@/contexts/OnboardingContext';
import ErrorBoundary from '@/components/ErrorBoundary';
import Welcome from '@/pages/Welcome';
import UserTypeSelection from '@/pages/UserTypeSelection';
import ProgressiveAuth from '@/pages/ProgressiveAuth';
import NewUserOnboarding from '@/components/onboarding/NewUserOnboarding';
import AuthCallback from '@/pages/AuthCallback';
import Dashboard from '@/pages/Dashboard';
import Tasks from '@/pages/Tasks';
import Profile from '@/pages/Profile';
import Admin from '@/pages/Admin';
import ForgotPassword from '@/pages/ForgotPassword';
import BrandDashboard from '@/pages/BrandDashboard';
import BrandPortal from '@/pages/BrandPortal';
import BrandSignup from '@/pages/BrandSignup';
import NotFound from '@/pages/NotFound';
import ProtectedRoute from '@/components/ProtectedRoute';
import { RoleProtectedRoute } from '@/components/RoleProtectedRoute';
import { PhoenixUserProvider } from '@/components/referral/PhoenixUserProvider';
import { ThemeProvider } from '@/contexts/ThemeContext';

function App() {
  const queryClient = new QueryClient();

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <AuthProvider>
              <OnboardingProvider>
                <PhoenixUserProvider>
                <div className="min-h-screen bg-background">
                  <Toaster />
                  <Routes>
                    <Route path="/" element={<Welcome />} />
                    <Route path="/user-type" element={<UserTypeSelection />} />
                    <Route path="/auth" element={<ProgressiveAuth />} />
                    <Route path="/auth/progressive" element={<ProgressiveAuth />} />
                    <Route path="/auth/callback" element={<AuthCallback />} />
                    <Route path="/onboarding" element={<NewUserOnboarding />} />
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
                      path="/brand-portal"
                      element={
                        <RoleProtectedRoute requiredRole="brand">
                          <BrandPortal />
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
                    {/* Legacy routes for backward compatibility */}
                    <Route path="/login" element={<ProgressiveAuth />} />
                    <Route path="/signup" element={<ProgressiveAuth />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </div>
              </PhoenixUserProvider>
            </OnboardingProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
