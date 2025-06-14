
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const LoginForm = () => {
  const { signIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Form values
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // Form validation
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setErrors({});
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    console.log("Attempting login for:", email);
    
    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        console.error("Login error:", error);
        toast.error(error.message);
        
        // Set field-specific errors if applicable
        if (error.message.includes("Invalid")) {
          setErrors({ 
            email: "Invalid credentials", 
            password: "Invalid credentials" 
          });
        }
      } else {
        console.log("Login successful");
        toast.success("Welcome back!");
        // Don't navigate here - let the useEffect handle it based on auth state
      }
    } catch (error) {
      console.error("Unexpected login error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) {
              setErrors(prev => ({ ...prev, email: "" }));
            }
          }}
          className={`yeild-input ${errors.email ? 'border-red-500' : ''}`}
          required
        />
        {errors.email && (
          <div className="flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle className="h-4 w-4" />
            {errors.email}
          </div>
        )}
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
          onChange={(e) => {
            setPassword(e.target.value);
            if (errors.password) {
              setErrors(prev => ({ ...prev, password: "" }));
            }
          }}
          className={`yeild-input ${errors.password ? 'border-red-500' : ''}`}
          required
        />
        {errors.password && (
          <div className="flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle className="h-4 w-4" />
            {errors.password}
          </div>
        )}
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
  );
};

export default LoginForm;
