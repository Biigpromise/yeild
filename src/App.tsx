
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { OnboardingProvider } from "@/contexts/OnboardingContext";
import Index from "./pages/Index";
import SignUp from "./pages/SignUp";
import UserTypeSelection from "./pages/UserTypeSelection";
import Dashboard from "./pages/Dashboard";
import BrandDashboard from "./pages/BrandDashboard";
import Onboarding from "./pages/Onboarding";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <AuthProvider>
            <OnboardingProvider>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<SignUp />} />
                <Route path="/user-type" element={<UserTypeSelection />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/brand-dashboard" element={<BrandDashboard />} />
                <Route path="/onboarding" element={<Onboarding />} />
              </Routes>
            </OnboardingProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
