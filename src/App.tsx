import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import { OnboardingProvider } from '@/contexts/OnboardingContext';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorScreen from './ErrorScreen';
import LandingPage from './LandingPage';
import Dashboard from './Dashboard';
import TasksPage from './TasksPage';
import RewardsPage from './RewardsPage';
import CommunityPage from './CommunityPage';
import ProfilePage from './ProfilePage';
import AdminDashboard from './admin/AdminDashboard';
import { ProtectedRoute } from './ProtectedRoute';
import { AdminRoute } from './AdminRoute';
import TaskDetailsPage from './TaskDetailsPage';
import UserProfilePage from './UserProfilePage';
import ReferralSignupPage from './ReferralSignupPage';
import { PhoenixUserProvider } from '@/components/referral/PhoenixUserProvider';

function App() {
  const queryClient = new QueryClient();

  const handleError = (error: Error, info: React.ErrorInfo) => {
    console.error('Caught an error: ', error, info);
  };

  const errorFallback = (props: { error: Error; resetErrorBoundary: () => void }) => {
    return <ErrorScreen error={props.error} resetErrorBoundary={props.resetErrorBoundary} />;
  };

  return (
    <ErrorBoundary FallbackComponent={errorFallback} onError={handleError}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <OnboardingProvider>
              <PhoenixUserProvider>
                <div className="min-h-screen bg-background">
                  <Toaster />
                  <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/referral-signup" element={<ReferralSignupPage />} />
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
                          <TasksPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/tasks/:taskId"
                      element={
                        <ProtectedRoute>
                          <TaskDetailsPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/rewards"
                      element={
                        <ProtectedRoute>
                          <RewardsPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/community"
                      element={
                        <ProtectedRoute>
                          <CommunityPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/profile"
                      element={
                        <ProtectedRoute>
                          <ProfilePage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/user/:userId"
                      element={
                        <ProtectedRoute>
                          <UserProfilePage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/*"
                      element={
                        <AdminRoute>
                          <AdminDashboard />
                        </AdminRoute>
                      }
                    />
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
