
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "./contexts/AuthContext";
import { OnboardingProvider } from "./contexts/OnboardingContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import Index from "./pages/Index";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import BrandDashboard from "./pages/BrandDashboard";
import Onboarding from "./pages/Onboarding";
import Admin from "./pages/Admin";
import Welcome from "./pages/Welcome";
import { CampaignDetails } from "./pages/CampaignDetails";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // Don't retry on auth errors
        if (error?.status === 401 || error?.status === 403) {
          return false;
        }
        return failureCount < 3;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <TooltipProvider>
          <QueryClientProvider client={queryClient}>
            <Router>
              <AuthProvider>
                <OnboardingProvider>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/welcome" element={<Welcome />} />
                    <Route path="/auth" element={<SignUp />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<SignUp />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/brand-dashboard" element={<BrandDashboard />} />
                    <Route path="/onboarding" element={<Onboarding />} />
                    <Route path="/admin" element={<Admin />} />
                    <Route path="/campaigns/:id" element={<CampaignDetails />} />
                  </Routes>
                  <Toaster />
                </OnboardingProvider>
              </AuthProvider>
            </Router>
          </QueryClientProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
