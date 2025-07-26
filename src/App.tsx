
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { OnboardingProvider } from '@/contexts/OnboardingContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { OnboardingTutorial } from '@/components/OnboardingTutorial';
import Dashboard from '@/pages/Dashboard';
import Auth from '@/pages/Auth';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import AuthCallback from '@/pages/AuthCallback';

import AdminDashboard from '@/pages/AdminDashboard';
import BrandDashboard from '@/pages/BrandDashboard';
import LandingPage from '@/pages/LandingPage';
import Welcome from '@/pages/Welcome';
import Onboarding from '@/pages/Onboarding';
import Leaderboard from '@/pages/Leaderboard';
import Rewards from '@/pages/Rewards';
import Tasks from '@/pages/Tasks';
import Chat from '@/pages/Chat';
import Profile from '@/pages/Profile';
import Referrals from '@/pages/Referrals';
import Notifications from '@/pages/Notifications';
import Settings from '@/pages/Settings';
import SupportPage from '@/pages/SupportPage';
import TaskSubmissionPage from '@/pages/TaskSubmissionPage';
import BrandOnboarding from '@/pages/BrandOnboarding';
import BrandPortal from '@/pages/BrandPortal';
import Walkthrough from '@/pages/Walkthrough';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import TermsOfService from '@/pages/TermsOfService';
import FAQ from '@/pages/FAQ';
import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <OnboardingProvider>
            <Router>
              <Routes>
                <Route path="/" element={<Welcome />} />
                <Route path="/landing" element={<LandingPage />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/auth/reset-password" element={<ResetPassword />} />
                
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/brand-dashboard/*" element={<BrandDashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/rewards" element={<Rewards />} />
                <Route path="/tasks" element={<Tasks />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/referrals" element={<Referrals />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/support" element={<SupportPage />} />
                <Route path="/task-submission/:taskId" element={<TaskSubmissionPage />} />
                <Route path="/brand-onboarding" element={<BrandOnboarding />} />
                <Route path="/brand-portal" element={<BrandPortal />} />
                <Route path="/walkthrough" element={<Walkthrough />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-of-service" element={<TermsOfService />} />
                <Route path="/faq" element={<FAQ />} />
              </Routes>
              <OnboardingTutorial />
            </Router>
            <Toaster richColors />
          </OnboardingProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
