
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import LoginHeader from "@/components/auth/LoginHeader";
import LoginForm from "@/components/auth/LoginForm";
import LoginFooter from "@/components/auth/LoginFooter";
import { supabase } from "@/integrations/supabase/client";

const Login = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  // Handle redirect after auth state is determined
  useEffect(() => {
    const checkRoleAndRedirect = async () => {
      if (!loading && user) {
        console.log("User authenticated, checking role for redirect");
        try {
          const { data: roles, error } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id);

          if (error) throw error;

          const hasBrandRole = roles?.some(r => r.role === 'brand');
          
          if (hasBrandRole) {
            console.log("User is a brand, redirecting to brand page");
            navigate("/brand-signup");
          } else {
            console.log("User is not a brand, redirecting to user dashboard");
            navigate("/dashboard");
          }
        } catch (error) {
            console.error("Error checking user role, redirecting to default dashboard", error);
            navigate("/dashboard");
        }
      }
    };

    checkRoleAndRedirect();
  }, [user, loading, navigate]);

  // Show loading while auth state is being determined
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-yeild-black">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  // Don't render the form if user is already logged in
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-yeild-black relative">
      {/* Yellow accent graphics */}
      <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-yeild-yellow opacity-10 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-1/4 h-1/4 bg-yeild-yellow opacity-10 blur-3xl"></div>
      
      <div className="w-full max-w-md p-6">
        <LoginHeader onBackClick={() => navigate("/")} />
        <LoginForm />
        <LoginFooter />
      </div>
    </div>
  );
};

export default Login;
