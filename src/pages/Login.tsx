
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Form values
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please fill out all fields");
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    try {
      // In a real app, this would be authentication API call
      // For demo purposes we'll check if there's a user in localStorage
      // and just let anyone log in
      const storedUser = localStorage.getItem("yeild-user");
      
      setTimeout(() => {
        if (storedUser) {
          // If a user exists, use that
          toast.success("Welcome back!");
        } else {
          // Create a demo user if none exists
          const demoUser = {
            email,
            name: "Demo User",
            id: Date.now().toString(),
            points: 250,
            level: 2,
            tasks_completed: 5
          };
          localStorage.setItem("yeild-user", JSON.stringify(demoUser));
          toast.success("Demo account created!");
        }
        
        navigate("/dashboard");
      }, 1500);
    } catch (error) {
      toast.error("Invalid email or password");
      setIsLoading(false);
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
