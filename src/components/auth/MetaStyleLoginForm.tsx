
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface MetaStyleLoginFormProps {
  onBack: () => void;
}

const MetaStyleLoginForm = ({ onBack }: MetaStyleLoginFormProps) => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <button onClick={onBack} className="p-2">
          <X className="h-6 w-6 text-white" />
        </button>
        <div className="text-center">
          <span className="text-yeild-yellow text-xl font-bold">YEILD</span>
        </div>
        <div className="w-10"></div>
      </div>

      {/* Login Form */}
      <div className="px-6 pt-20">
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Input
              type="email"
              placeholder="Mobile number or email address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-800 border-gray-700 text-white placeholder-gray-400 py-6 text-lg rounded-lg"
            />
          </div>
          
          <div>
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-800 border-gray-700 text-white placeholder-gray-400 py-6 text-lg rounded-lg"
            />
          </div>
          
          <Button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg font-semibold rounded-full mt-8"
          >
            {isLoading ? "Logging in..." : "Log in"}
          </Button>
        </form>
        
        <div className="text-center mt-6">
          <Link to="/forgot-password" className="text-gray-300 text-lg">
            Forgotten password?
          </Link>
        </div>
      </div>

      {/* Create Account Button at Bottom */}
      <div className="fixed bottom-8 left-6 right-6">
        <Button
          onClick={() => navigate("/signup")}
          variant="outline"
          className="w-full border-blue-600 text-blue-400 hover:bg-blue-600/10 py-6 text-lg font-semibold rounded-full"
        >
          Create new account
        </Button>
      </div>
    </div>
  );
};

export default MetaStyleLoginForm;
