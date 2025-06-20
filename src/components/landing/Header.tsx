
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useRole } from "@/hooks/useRole";
import { Shield, Settings, User, LogOut } from "lucide-react";
import { AdminSetupDialog } from "@/components/AdminSetupDialog";
import { useState } from "react";

export const Header = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { isAdmin } = useRole();
  const [showAdminSetup, setShowAdminSetup] = useState(false);

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

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <>
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  {!isAdmin() && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setShowAdminSetup(true)}>
                        <Shield className="mr-2 h-4 w-4" />
                        Admin Setup
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
      
      <AdminSetupDialog 
        open={showAdminSetup} 
        onOpenChange={setShowAdminSetup} 
      />
    </>
  );
};
