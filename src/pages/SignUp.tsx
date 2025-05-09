
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

const SignUp = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Form values
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!agreeTerms) {
      toast.error("Please agree to the Terms and Privacy Policy");
      return;
    }

    if (!email || !password || !name) {
      toast.error("Please fill out all fields");
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    try {
      // For demo purposes, we're just storing in localStorage
      // In a real app, this would be an API call to register the user
      const user = {
        email,
        name,
        id: Date.now().toString(),
        points: 0,
        level: 1,
        tasks_completed: 0
      };
      
      localStorage.setItem("yeild-user", JSON.stringify(user));
      
      setTimeout(() => {
        toast.success("Account created successfully!");
        navigate("/dashboard");
      }, 1500);
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-yeild-black relative">
      {/* Yellow accent graphics */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-yeild-yellow opacity-10 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-yeild-yellow opacity-10 blur-3xl"></div>
      
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
          <h1 className="text-2xl font-bold">Create Your Account</h1>
          <p className="text-gray-400 mt-2">Join the YEILD community and start earning</p>
        </div>
        
        <form onSubmit={handleSignUp} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="yeild-input"
              required
            />
          </div>
          
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
              <span className="text-sm text-yeild-yellow hover:underline cursor-pointer">
                Password Requirements
              </span>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="yeild-input"
              minLength={8}
              required
            />
          </div>
          
          <div className="flex items-center space-x-2 mt-4">
            <div 
              className="cursor-pointer flex items-center space-x-2" 
              onClick={() => setAgreeTerms(!agreeTerms)}
            >
              <Checkbox 
                id="terms" 
                checked={agreeTerms}
                onCheckedChange={() => setAgreeTerms(!agreeTerms)}
              />
              <label
                htmlFor="terms"
                className="text-sm text-gray-400 cursor-pointer"
              >
                I agree to the <a href="#" className="text-yeild-yellow hover:underline">Terms of Service</a> and <a href="#" className="text-yeild-yellow hover:underline">Privacy Policy</a>
              </label>
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full yeild-btn-primary mt-6" 
            disabled={isLoading}
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-gray-400">
            Already have an account?{" "}
            <Link to="/login" className="text-yeild-yellow hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
