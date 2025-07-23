
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { OnboardingProvider } from '@/contexts/OnboardingContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import Welcome from '@/pages/Welcome';
import About from '@/pages/About';
import Login from '@/pages/Login';
import SignUp from '@/pages/SignUp';
import Dashboard from '@/pages/Dashboard';
import Profile from '@/pages/Profile';
import Tasks from '@/pages/Tasks';
import TaskDetail from '@/pages/TaskDetail';
import Leaderboard from '@/pages/Leaderboard';
import Rewards from '@/pages/Rewards';
import Withdrawal from '@/pages/Withdrawal';
import Chat from '@/pages/Chat';
import AdminDashboard from '@/pages/AdminDashboard';
import BrandDashboard from '@/pages/BrandDashboard';
import BrandCampaignDashboard from '@/pages/BrandCampaignDashboard';
import BrandApplication from '@/pages/BrandApplication';
import AuthCallback from '@/pages/AuthCallback';
import Onboarding from '@/pages/Onboarding';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <OnboardingProvider>
            <div className="min-h-screen bg-background">
              <main>
                <Routes>
                  <Route path="/" element={<Welcome />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<SignUp />} />
                  <Route path="/auth/callback" element={<AuthCallback />} />
                  <Route path="/brand-application" element={<BrandApplication />} />
                  <Route path="/onboarding" element={<Onboarding />} />
                  
                  {/* Protected Routes */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } />
                  <Route path="/tasks" element={
                    <ProtectedRoute>
                      <Tasks />
                    </ProtectedRoute>
                  } />
                  <Route path="/tasks/:id" element={
                    <ProtectedRoute>
                      <TaskDetail />
                    </ProtectedRoute>
                  } />
                  <Route path="/leaderboard" element={
                    <ProtectedRoute>
                      <Leaderboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/rewards" element={
                    <ProtectedRoute>
                      <Rewards />
                    </ProtectedRoute>
                  } />
                  <Route path="/withdrawal" element={
                    <ProtectedRoute>
                      <Withdrawal />
                    </ProtectedRoute>
                  } />
                  <Route path="/chat" element={
                    <ProtectedRoute>
                      <Chat />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin" element={
                    <ProtectedRoute>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/brand-dashboard" element={
                    <ProtectedRoute>
                      <BrandDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/brand-campaigns" element={
                    <ProtectedRoute>
                      <BrandCampaignDashboard />
                    </ProtectedRoute>
                  } />
                </Routes>
              </main>
              <Toaster />
            </div>
          </OnboardingProvider>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
