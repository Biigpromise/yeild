
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { ArrowLeft, Github } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { signIn, signInWithProvider, user, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Form values
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // Handle redirect after auth state is determined
  useEffect(() => {
    console.log("Auth state changed - loading:", loading, "user:", user?.email);
    if (!loading && user) {
      console.log("User authenticated, redirecting to dashboard");
      navigate("/dashboard");
    }
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
      toast.error("Please fill out all fields");
      return;
    }

    setIsLoading(true);
    console.log("Attempting login for:", email);
    
    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        console.error("Login error:", error);
        if (error.message.includes("Invalid login credentials")) {
          toast.error("Invalid email or password");
        } else if (error.message.includes("Email not confirmed")) {
          toast.error("Please check your email and confirm your account");
        } else {
          toast.error(error.message || "Login failed");
        }
      } else {
        console.log("Login successful");
        toast.success("Welcome back!");
        // Don't navigate here - let the useEffect handle it based on auth state
      }
    } catch (error) {
      console.error("Unexpected login error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    console.log("Attempting social login with:", provider);
    try {
      const { error } = await signInWithProvider(provider);
      if (error) {
        console.error("Social login error:", error);
        toast.error(`Failed to sign in with ${provider}`);
      }
    } catch (error) {
      console.error("Social login unexpected error:", error);
      toast.error("Social login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-yeild-black relative">
      {/* Yellow accent graphics */}
      <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-yeild-yellow opacity-10 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-1/4 h-1/4 bg-yeild-yellow opacity-10 blur-3xl"></div>
      
      <div className="w-full max-w-md p-6">
        <Button 
          variant="ghost" 
          className="mb-6 text-gray-400 hover:text-white" 
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
        
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <span className="text-yeild-yellow text-3xl font-bold">YEILD</span>
          </div>
          <h1 className="text-2xl font-bold">Welcome Back</h1>
          <p className="text-gray-400 mt-2">Login to your YEILD account</p>
        </div>

        {/* Social Login Buttons */}
        <div className="space-y-3 mb-6">
          <Button 
            variant="outline" 
            className="w-full border-gray-700 hover:bg-gray-800"
            onClick={() => handleSocialLogin('google')}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full border-gray-700 hover:bg-gray-800"
            onClick={() => handleSocialLogin('github')}
          >
            <Github className="mr-2 h-4 w-4" />
            Continue with GitHub
          </Button>
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-700" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-yeild-black px-2 text-gray-400">Or continue with email</span>
          </div>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="yeild-input"
              required
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="password">Password</Label>
              <Link to="/forgot-password" className="text-sm text-yeild-yellow hover:underline">
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="yeild-input"
              required
            />
          </div>
          
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="remember" 
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              />
              <label
                htmlFor="remember"
                className="text-sm text-gray-400"
              >
                Remember me
              </label>
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full yeild-btn-primary mt-6" 
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Log In"}
          </Button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-gray-400">
            Don't have an account?{" "}
            <Link to="/signup" className="text-yeild-yellow hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
