
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export const Hero = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGetStarted = () => {
    if (user) {
      navigate("/dashboard");
    } else {
      navigate("/signup");
    }
  };

  const handleLoginClick = () => {
    navigate("/login");
  };
  
  return (
    <div className="relative">
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-20 text-center">
        <div className="mb-8">
          <div className="inline-block p-3 bg-yeild-yellow/10 rounded-full mb-6">
            <span className="text-yeild-yellow text-4xl font-bold">YEILD</span>
          </div>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-white">
          Welcome to <span className="text-yeild-yellow">YEILD</span>
        </h1>
        
        <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
          Join thousands of users making money by completing simple tasks from your phone or computer. Start earning today!
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Button 
            size="lg" 
            className="bg-yeild-yellow text-black hover:bg-yeild-yellow/90 text-lg px-8 py-6 w-full sm:w-auto font-semibold"
            onClick={handleGetStarted}
          >
            Get Started
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          
          {!user && (
            <Button 
              variant="outline" 
              size="lg" 
              className="border-gray-600 text-white hover:bg-gray-800 text-lg px-8 py-6 w-full sm:w-auto"
              onClick={handleLoginClick}
            >
              Login
            </Button>
          )}
        </div>
        
        <div className="text-sm text-gray-400">
          <p>No credit card required • Start earning immediately • Join 10,000+ users</p>
        </div>
      </div>
    </div>
  );
};
