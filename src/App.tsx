
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { PhoenixUserProvider } from "@/components/referral/PhoenixUserProvider";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import TaskDetail from "./pages/TaskDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import BrandDashboard from "./pages/BrandDashboard";
import Chat from "./pages/Chat";
import Social from "./pages/Social";
import Leaderboard from "./pages/Leaderboard";
import Referrals from "./pages/Referrals";
import Profile from "./pages/Profile";
import Wallet from "./pages/Wallet";
import Support from "./pages/Support";
import BrandApplication from "./pages/BrandApplication";
import BrandLogin from "./pages/BrandLogin";
import BrandRegister from "./pages/BrandRegister";
import ProtectedRoute from "./components/ProtectedRoute";
import { ErrorBoundary } from "@/components/ui/error-boundary";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <PhoenixUserProvider>
            <TooltipProvider>
              <ErrorBoundary>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/brand-login" element={<BrandLogin />} />
                  <Route path="/brand-register" element={<BrandRegister />} />
                  <Route path="/brand-application" element={<BrandApplication />} />
                  <Route path="/support" element={<Support />} />
                  
                  {/* Protected Routes */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <Dashboard />
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
                  
                  <Route path="/chat" element={
                    <ProtectedRoute>
                      <Chat />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/social" element={
                    <ProtectedRoute>
                      <Social />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/leaderboard" element={
                    <ProtectedRoute>
                      <Leaderboard />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/referrals" element={
                    <ProtectedRoute>
                      <Referrals />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/wallet" element={
                    <ProtectedRoute>
                      <Wallet />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/admin" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/brand-dashboard" element={
                    <ProtectedRoute allowedRoles={['brand']}>
                      <BrandDashboard />
                    </ProtectedRoute>
                  } />
                </Routes>
              </ErrorBoundary>
              <Toaster />
            </TooltipProvider>
          </PhoenixUserProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
