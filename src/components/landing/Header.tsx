
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useRole } from "@/hooks/useRole";
import { Shield } from "lucide-react";

export const Header = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin } = useRole();

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
    <nav className="flex justify-between items-center p-6 relative z-10">
      <div className="flex items-center space-x-2">
        <span className="text-yeild-yellow text-2xl font-bold">YEILD</span>
      </div>
      <div className="flex items-center space-x-4">
        {user ? (
          <>
            <Button variant="ghost" onClick={() => navigate("/dashboard")}>
              Dashboard
            </Button>
            {/* Only show Admin Setup if user is logged in but is not already admin */}
            {!isAdmin() && (
              <Button
                asChild
                variant="outline"
                className="border-yeild-yellow text-yeild-yellow hover:bg-yeild-yellow hover:text-black"
              >
                <Link to="/admin-setup">
                  <Shield className="mr-2 h-4 w-4" />
                  Admin Setup
                </Link>
              </Button>
            )}
          </>
        ) : (
          <>
            <Button 
              variant="outline" 
              onClick={handleLoginClick}
              className="border-gray-600 text-white hover:bg-gray-800"
            >
              Login
            </Button>
            <Button 
              className="bg-white text-black hover:bg-gray-200" 
              onClick={handleGetStarted}
            >
              Sign Up
            </Button>
          </>
        )}
      </div>
    </nav>
  );
};
