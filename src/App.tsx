
import React from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import TaskDetail from "./components/tasks/TaskDetail";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import Login from "./pages/Login";
import EmailConfirmation from "./pages/EmailConfirmation";
import BrandAuth from "./pages/BrandAuth";
import BrandDashboard from "./pages/BrandDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AdminTaskCreate from "./pages/AdminTaskCreate";
import CreateCampaign from "./pages/CreateCampaign";
import { CreateQuickCampaign } from "@/components/campaign/CreateQuickCampaign";
import { SimplifiedCampaignCreator } from "@/components/campaign/SimplifiedCampaignCreator";
import ResetPassword from "./pages/ResetPassword";
import CustomResetPassword from "./pages/CustomResetPassword";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyResetCode from "./pages/VerifyResetCode";
import VerifySignupCode from "./pages/VerifySignupCode";
import CreateNewPassword from "./pages/CreateNewPassword";
import Tasks from "./pages/Tasks";
import EarnPage from "./components/EarnPage";
import Chat from "./pages/Chat";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Onboarding from "./pages/Onboarding";
import BrandOnboarding from "./pages/BrandOnboarding";
import FAQ from "./pages/FAQ";
import Support from "./pages/Support";
import { SupportChatWidget } from "@/components/support/SupportChatWidget";

import Referrals from "./pages/Referrals";
import Birds from "./pages/Birds";
import OperatorRanks from "./pages/OperatorRanks";
import ExecutionOrders from "./pages/ExecutionOrders";
import WithdrawalPage from "./pages/WithdrawalPage";
import { EnhancedCampaignCreation } from "@/components/campaign/EnhancedCampaignCreation";
import { AppLayout } from "./components/AppLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { RoleBasedRoute } from "@/components/RoleBasedRoute";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { OnboardingProvider } from "@/contexts/OnboardingContext";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { useMaintenanceMode } from "@/hooks/useMaintenanceMode";
import MaintenanceMode from "@/components/maintenance/MaintenanceMode";
import { useAuth } from "@/contexts/AuthContext";
import { ErrorBoundaryWrapper } from "@/components/ErrorBoundaryWrapper";
import "./App.css";

const AppContent = () => {
  const { showOnboarding, userType, completeOnboarding } = useOnboarding();
  const { isMaintenanceMode, loading: maintenanceLoading } = useMaintenanceMode();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Check if user is admin to bypass maintenance mode (use role-based check)
  const isAdmin = false; // Remove hardcoded email check for maintenance bypass
  
  // Show maintenance mode for non-admin users when enabled
  if (!maintenanceLoading && isMaintenanceMode && !isAdmin) {
    return <MaintenanceMode />;
  }

  const handleOnboardingComplete = () => {
    completeOnboarding();
    // Navigate based on user type after completing onboarding
    if (userType === 'brand') {
      navigate('/brand-dashboard');
    } else {
      navigate('/dashboard');
    }
  };
  
  return (
    <>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/email-confirmation" element={<EmailConfirmation />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/brand-auth" element={<BrandAuth />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-reset-code" element={<VerifyResetCode />} />
        <Route path="/verify-signup-code" element={<VerifySignupCode />} />
        <Route path="/create-new-password" element={<CreateNewPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/custom-reset-password" element={<CustomResetPassword />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/support" element={<Support />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/brand-onboarding" element={<BrandOnboarding />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <ErrorBoundaryWrapper>
                <Dashboard />
              </ErrorBoundaryWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/brand-dashboard/*"
          element={
            <RoleBasedRoute requiredRole="brand">
              <ErrorBoundaryWrapper>
                <BrandDashboard />
              </ErrorBoundaryWrapper>
            </RoleBasedRoute>
          }
        />
        <Route
          path="/tasks/:id"
          element={
            <ProtectedRoute>
              <ErrorBoundaryWrapper>
                <TaskDetail />
              </ErrorBoundaryWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <EarnPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/withdrawal"
          element={
            <ProtectedRoute>
              <ErrorBoundaryWrapper>
                <WithdrawalPage />
              </ErrorBoundaryWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <RoleBasedRoute requiredRole="admin">
              <AdminDashboard />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/admin/tasks/create"
          element={
            <RoleBasedRoute requiredRole="admin">
              <AdminTaskCreate />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/create-campaign"
          element={
            <RoleBasedRoute requiredRole="brand">
              <EnhancedCampaignCreation />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/brand-dashboard/campaigns/create"
          element={
            <RoleBasedRoute requiredRole="brand">
              <SimplifiedCampaignCreator />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/brand-dashboard/campaigns/create-quick"
          element={
            <RoleBasedRoute requiredRole="brand">
              <CreateQuickCampaign />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/brand-dashboard/campaigns/create-enhanced"
          element={
            <RoleBasedRoute requiredRole="brand">
              <EnhancedCampaignCreation />
            </RoleBasedRoute>
          }
        />
        
        {/* Legacy Routes - redirect to dashboard */}
        <Route path="/social" element={<Navigate to="/dashboard" replace />} />
        <Route path="/chat" element={<Navigate to="/dashboard" replace />} />
        <Route path="/wallet" element={<Navigate to="/dashboard" replace />} />
        <Route path="/referrals" element={<Navigate to="/dashboard" replace />} />
        
        {/* Operator Ranks Route */}
        <Route
          path="/operator-ranks"
          element={
            <ProtectedRoute>
              <ErrorBoundaryWrapper>
                <OperatorRanks />
              </ErrorBoundaryWrapper>
            </ProtectedRoute>
          }
        />
        
        {/* Execution Orders Route */}
        <Route
          path="/execution-orders"
          element={
            <ProtectedRoute>
              <ErrorBoundaryWrapper>
                <ExecutionOrders />
              </ErrorBoundaryWrapper>
            </ProtectedRoute>
          }
        />
        
        {/* Legacy Birds Route - redirect to operator ranks */}
        <Route path="/birds" element={<Navigate to="/operator-ranks" replace />} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      {/* Global Onboarding Flow */}
      {showOnboarding && (
        <div className="fixed inset-0 z-50 bg-background">
          <OnboardingFlow userType={userType} onComplete={handleOnboardingComplete} />
        </div>
      )}
    </>
  );
};

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <AuthProvider>
            <OnboardingProvider>
              <TooltipProvider>
                <Toaster />
                <SupportChatWidget />
                <AppContent />
              </TooltipProvider>
            </OnboardingProvider>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
