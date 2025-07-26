
import React from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import Login from "./pages/Login";
import EmailConfirmation from "./pages/EmailConfirmation";
import BrandAuth from "./pages/BrandAuth";
import BrandDashboard from "./pages/BrandDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ResetPassword from "./pages/ResetPassword";
import UserSignUp from "./pages/UserSignUp";
import BrandSignUp from "./pages/BrandSignUp";
import ProtectedRoute from "@/components/ProtectedRoute";
import { RoleBasedRoute } from "@/components/RoleBasedRoute";
import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/login" element={<Login />} />
              <Route path="/user-signup" element={<UserSignUp />} />
              <Route path="/brand-signup" element={<BrandSignUp />} />
              <Route path="/email-confirmation" element={<EmailConfirmation />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/brand-auth" element={<BrandAuth />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/brand-dashboard"
                element={
                  <RoleBasedRoute requiredRole="brand">
                    <BrandDashboard />
                  </RoleBasedRoute>
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
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
