
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Login = () => {
  const navigate = useNavigate();
  const { user, loading, signIn, signInWithProvider } = useAuth();
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

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      const { error } = await signInWithProvider('google');
      if (error) {
        toast.error(error.message);
      }
    } catch (error: any) {
      toast.error(error.message);
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

          {/* Google Sign In */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-yeild-black text-gray-400">or</span>
              </div>
            </div>
            
            <Button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              variant="outline"
              className="w-full mt-4 border-gray-600 text-white hover:bg-gray-800 py-4 text-base font-semibold rounded-lg flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </Button>
          </div>
          
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
        </div>
      </div>
    </div>
  );
};

export default Login;
