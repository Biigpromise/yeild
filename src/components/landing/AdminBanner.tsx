
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export const AdminBanner = () => {
  const { user, loading } = useAuth();
  const [showAdminBanner, setShowAdminBanner] = useState(false);

  useEffect(() => {
    // Show admin banner for logged in users
    if (!loading && user) {
      setShowAdminBanner(true);
    } else {
      setShowAdminBanner(false);
    }
  }, [user, loading]);

  if (!showAdminBanner) {
    return null;
  }

  return (
    <div className="bg-yellow-600 text-black p-4 border-b">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="h-5 w-5" />
          <span className="font-medium">
            Set up admin access to manage the platform
          </span>
        </div>
        <Button 
          asChild 
          size="sm" 
          className="bg-black text-white hover:bg-gray-800"
        >
          <Link to="/admin-setup">
            Make Me Admin
          </Link>
        </Button>
      </div>
    </div>
  );
};
