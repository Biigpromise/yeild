
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  requiredRole: string;
}

export const RoleProtectedRoute = ({ children, requiredRole }: RoleProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [hasRole, setHasRole] = useState<boolean | null>(null);

  useEffect(() => {
    const checkUserRole = async () => {
      if (!user) {
        navigate("/auth");
        return;
      }

      try {
        // Use role-based check instead of hardcoded email

        // Check user roles in database
        const { data: userRoles, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        if (error) {
          console.error("Error checking user role:", error);
          // Default to user role if error
          if (requiredRole === 'user') {
            setHasRole(true);
          } else {
            navigate("/dashboard");
          }
          return;
        }

        const roleNames = userRoles?.map(r => r.role) || [];
        console.log("User roles found:", roleNames);
        
        const userHasRole = roleNames.includes(requiredRole);
        
        if (userHasRole) {
          setHasRole(true);
        } else {
          // Redirect based on user's actual roles
          const isBrand = roleNames.includes('brand');
          const isAdmin = roleNames.includes('admin');
          
          if (isAdmin) {
            navigate("/admin");
          } else if (isBrand) {
            navigate("/brand-dashboard");
          } else {
            navigate("/dashboard");
          }
        }
      } catch (error) {
        console.error("Error in role check:", error);
        navigate("/dashboard");
      }
    };

    if (!loading) {
      checkUserRole();
    }
  }, [user, loading, navigate, requiredRole]);

  if (loading || hasRole === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-yeild-black">
        <div className="text-white flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          <div>Checking permissions...</div>
        </div>
      </div>
    );
  }

  if (!hasRole) {
    return null;
  }

  return <>{children}</>;
};
