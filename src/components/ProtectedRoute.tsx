
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      if (loading) return;
      
      if (!user) {
        console.log("User not authenticated, redirecting to auth");
        navigate("/auth");
        return;
      }

      // Check if user has confirmed their email
      if (!user.email_confirmed_at) {
        console.log("Email not confirmed");
        // Don't redirect, let them access the dashboard but show a notice
      }

      // Check user roles to determine proper redirect
      try {
        // Check if admin first
        if (user.email === 'yeildsocials@gmail.com') {
          // Admin can access any protected route
          return;
        }

        const { data: roleData, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        if (error) {
          console.error("Error checking user roles:", error);
        }

        const roles = roleData?.map(r => r.role) || [];
        console.log("User roles:", roles);

        // If accessing admin routes without admin role, redirect
        if (window.location.pathname.includes('/admin') && !roles.includes('admin') && user.email !== 'yeildsocials@gmail.com') {
          if (roles.includes('brand')) {
            navigate('/brand-dashboard');
          } else {
            navigate('/dashboard');
          }
          return;
        }

        // If accessing brand routes without brand role, redirect
        if (window.location.pathname.includes('/brand') && !roles.includes('brand')) {
          if (user.email === 'yeildsocials@gmail.com') {
            navigate('/admin');
          } else {
            navigate('/dashboard');
          }
          return;
        }

      } catch (error) {
        console.error("Error in auth check:", error);
      }
    };

    checkAuthAndRedirect();
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-yeild-black">
        <div className="text-white flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
