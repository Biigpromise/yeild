
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Mail } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setIsLoading(true);
    console.log("Attempting password reset for:", email);
    
    try {
      const { error } = await resetPassword(email);
      
      if (error) {
        console.error("Password reset error:", error);
        toast.error(error.message || "Failed to send reset email");
      } else {
        console.log("Password reset email sent successfully");
        setEmailSent(true);
        toast.success("Password reset email sent! Check your inbox.");
      }
    } catch (error) {
      console.error("Unexpected password reset error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate("/login");
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-yeild-black relative">
        {/* Yellow accent graphics */}
        <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-yeild-yellow opacity-10 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-1/4 h-1/4 bg-yeild-yellow opacity-10 blur-3xl"></div>
        
        <div className="w-full max-w-md p-6">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-yeild-yellow rounded-full flex items-center justify-center">
                <Mail className="w-8 h-8 text-yeild-black" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Check Your Email</h1>
            <p className="text-gray-400">
              We've sent a password reset link to <span className="text-yeild-yellow">{email}</span>
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-gray-400 text-center">
              Didn't receive the email? Check your spam folder or try again with a different email address.
            </p>
            
            <Button 
              variant="outline" 
              className="w-full border-gray-700 hover:bg-gray-800"
              onClick={() => setEmailSent(false)}
            >
              Try Again
            </Button>
            
            <div className="text-center">
              <Button
                variant="ghost"
                className="text-yeild-yellow hover:underline text-sm"
                onClick={handleBackToLogin}
              >
                Back to Login
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-yeild-black relative">
      {/* Yellow accent graphics */}
      <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-yeild-yellow opacity-10 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-1/4 h-1/4 bg-yeild-yellow opacity-10 blur-3xl"></div>
      
      <div className="w-full max-w-md p-6">
        <Button 
          variant="ghost" 
          className="mb-6 text-gray-400 hover:text-white" 
          onClick={handleBackToLogin}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Login
        </Button>
        
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <span className="text-yeild-yellow text-3xl font-bold">YEILD</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Reset Your Password</h1>
          <p className="text-gray-400 mt-2">
            Enter your email address and we'll send you a link to reset your password
          </p>
        </div>
        
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">Email Address</Label>
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
          
          <Button 
            type="submit" 
            className="w-full yeild-btn-primary mt-6" 
            disabled={isLoading}
          >
            {isLoading ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-gray-400">
            Remember your password?{" "}
            <Button
              variant="ghost"
              className="text-yeild-yellow hover:underline p-0 h-auto"
              onClick={handleBackToLogin}
            >
              Sign in
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
