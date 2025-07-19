import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export default function Index() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-yeild-black text-white">
      {/* Header with Admin Login */}
      <header className="absolute top-0 left-0 right-0 z-50 p-6">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <img 
              src="/lovable-uploads/54ccebd1-9d4c-452f-b0a9-0b9de0fcfebf.png" 
              alt="YEILD Logo" 
              className="w-10 h-10 object-contain"
            />
            <span className="text-2xl font-bold text-yeild-yellow">YEILD</span>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => navigate("/auth?admin=true")} 
              variant="ghost" 
              size="sm"
              className="text-gray-400 hover:text-white"
            >
              Admin
            </Button>
            <Button onClick={() => navigate("/auth")} variant="outline">
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-yeild-yellow">
            Unlock Your Potential with YEILD
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl text-gray-400 mb-12">
            Join our community and earn rewards for completing simple tasks.
          </p>
          <div className="flex justify-center space-x-4">
            <Button onClick={() => navigate("/user-type")} variant="outline" size="lg">
              Get Started
            </Button>
            <Button onClick={() => navigate("/auth")} size="lg">
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="absolute bottom-0 left-0 right-0 p-4 text-center text-gray-500">
        © {new Date().getFullYear()} YEILD. All rights reserved.
      </footer>
    </div>
  );
}
