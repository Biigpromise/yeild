
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Login = () => {
  const navigate = useNavigate();
  const { user, loading, signIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    
    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Welcome back!");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-yeild-black text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-6">
        <button onClick={() => navigate("/")} className="text-white text-lg">
          ←
        </button>
        <div className="text-center">
          <span className="text-yeild-yellow text-2xl font-bold">YEILD</span>
        </div>
        <div className="w-6"></div>
      </div>

      {/* Main Content */}
      <div className="px-6 pt-16">
        <div className="max-w-sm mx-auto">
          <h1 className="text-2xl font-semibold text-center mb-12">
            Log into YEILD
          </h1>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Mobile number or email address" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-yeild-black border-gray-600 text-white placeholder-gray-400 py-4 text-base rounded-lg focus:border-yeild-yellow focus:ring-yeild-yellow"
              />
            </div>
            
            <div>
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-yeild-black border-gray-600 text-white placeholder-gray-400 py-4 text-base rounded-lg focus:border-yeild-yellow focus:ring-yeild-yellow"
              />
            </div>
            
            <Button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-yeild-yellow text-yeild-black hover:bg-yeild-yellow/90 py-4 text-base font-semibold rounded-lg mt-8"
            >
              {isLoading ? "Logging in..." : "Log in"}
            </Button>
          </form>
          
          <div className="text-center mt-6">
            <button 
              onClick={() => navigate("/forgot-password")}
              className="text-yeild-yellow text-base hover:text-yeild-yellow/80"
            >
              Forgotten password?
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="fixed bottom-0 left-0 right-0 p-6">
        <div className="max-w-sm mx-auto">
          <div className="text-center mb-6">
            <hr className="border-gray-600 mb-6" />
            <Button
              onClick={() => navigate("/signup")}
              variant="outline"
              className="w-full border-yeild-yellow text-yeild-yellow hover:bg-yeild-yellow/10 py-4 text-base font-semibold rounded-lg"
            >
              Create new account
            </Button>
          </div>
          
          <div className="text-center">
            <span className="text-yeild-yellow text-lg font-bold">Meta</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
