
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
        const { data: userRoles, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        if (error) {
          console.error("Error checking user role:", error);
          navigate("/auth");
          return;
        }

        const userHasRole = userRoles?.some(roleObj => roleObj.role === requiredRole);
        
        if (userHasRole) {
          setHasRole(true);
        } else {
          // If user doesn't have the required role, redirect based on their roles
          const isBrand = userRoles?.some(roleObj => roleObj.role === 'brand');
          const isAdmin = userRoles?.some(roleObj => roleObj.role === 'admin');
          
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
        navigate("/auth");
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
