
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from '@/components/ui/sonner';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import AnalyticsSetup from './pages/AnalyticsSetup';
import AnalyticsDashboard from './components/analytics/AnalyticsDashboard';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { SEOHead } from './components/seo/SEOHead';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-background">
            <SEOHead />
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/analytics-setup" 
                element={<AnalyticsSetup />}
              />
              <Route 
                path="/analytics-dashboard" 
                element={
                  <ProtectedRoute>
                    <AnalyticsDashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
            <Toaster />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
