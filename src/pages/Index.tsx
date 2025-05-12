
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  // Simulate a logged-in user (replace with actual auth check)
  const isLoggedIn = localStorage.getItem("yeild-user") !== null;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Simplified Navigation */}
      <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center">
          <span className="text-white text-3xl font-bold tracking-tight">YEILD</span>
        </div>
        <div className="hidden md:flex space-x-6">
          <a href="#how-it-works" className="text-white hover:text-gray-300 transition-colors duration-300 font-medium">How It Works</a>
          <a href="#for-brands" className="text-white hover:text-gray-300 transition-colors duration-300 font-medium">For Brands</a>
          <a href="#testimonials" className="text-white hover:text-gray-300 transition-colors duration-300 font-medium">Testimonials</a>
        </div>
        <div className="flex space-x-4">
          {isLoggedIn ? (
            <Button 
              className="bg-white text-black font-bold py-3 px-6 rounded-lg hover:bg-gray-200 transition-all duration-300"
              onClick={() => navigate("/dashboard")}
            >
              Dashboard
            </Button>
          ) : (
            <>
              <Button 
                variant="outline" 
                className="border-2 border-white text-white font-bold py-3 px-6 rounded-lg hover:bg-white/10 transition-all duration-300"
                onClick={() => navigate("/login")}
              >
                Login
              </Button>
              <Button 
                className="bg-white text-black font-bold py-3 px-6 rounded-lg hover:bg-gray-200 transition-all duration-300"
                onClick={() => navigate("/signup")}
              >
                Sign Up
              </Button>
            </>
          )}
        </div>
      </nav>

      {/* Minimalist Hero Section */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-3xl w-full">
          <div className="bg-black border border-white p-12 rounded-xl flex flex-col items-center justify-center text-center">
            <img 
              src="/lovable-uploads/383ca0f4-918c-4ce3-a2e1-e7cd12b0f420.png" 
              alt="YEILD Logo" 
              className="w-48 h-48 mb-8" 
            />
            
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button 
                className="bg-white text-black font-bold py-3 px-6 rounded-lg hover:bg-gray-200 transition-all duration-300 text-lg group"
                onClick={() => navigate("/signup")}
              >
                Get Started
                <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                variant="outline" 
                className="border-2 border-white text-white font-bold py-3 px-6 rounded-lg hover:bg-white/10 transition-all duration-300 text-lg"
                onClick={() => navigate("/login")}
              >
                Login
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Simple Footer */}
      <footer className="bg-black py-8 border-t border-white/20">
        <div className="container mx-auto px-4 text-center">
          <p className="text-white/70">&copy; {new Date().getFullYear()} YEILD. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
