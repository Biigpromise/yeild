
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [tokenVerified, setTokenVerified] = useState(false);

  useEffect(() => {
    // Check if we have the necessary tokens in the URL
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    const tokenHash = searchParams.get('token_hash');
    const type = searchParams.get('type');
    
    console.log('Reset password URL params:', {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      hasTokenHash: !!tokenHash,
      type
    });

    // Handle both old and new token formats
    if ((!accessToken || !refreshToken) && !tokenHash) {
      console.error("Missing authentication tokens in URL");
      toast.error("Invalid reset link. Please request a new password reset.");
      navigate("/forgot-password");
      return;
    }

    // If we have tokens, verify them by setting the session
    if (accessToken && refreshToken) {
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      }).then(({ data, error }) => {
        if (error) {
          console.error("Token verification failed:", error);
          toast.error("Reset link has expired. Please request a new one.");
          navigate("/forgot-password");
        } else {
          console.log("Token verified successfully");
          setTokenVerified(true);
        }
      });
    } else if (tokenHash && type === 'recovery') {
      // Handle new token hash format
      supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: 'recovery'
      }).then(({ data, error }) => {
        if (error) {
          console.error("Token hash verification failed:", error);
          toast.error("Reset link has expired. Please request a new one.");
          navigate("/forgot-password");
        } else {
          console.log("Token hash verified successfully");
          setTokenVerified(true);
        }
      });
    } else {
      setTokenVerified(true); // Assume valid for now
    }
  }, [searchParams, navigate]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tokenVerified) {
      toast.error("Please wait for token verification...");
      return;
    }
    
    if (!password || !confirmPassword) {
      toast.error("Please fill out all fields");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    // Add password strength validation
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      toast.error("Password must contain uppercase, lowercase, and numbers");
      return;
    }

    setIsLoading(true);
    console.log("Attempting to update password");
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });
      
      if (error) {
        console.error("Password update error:", error);
        
        // Handle specific error cases
        if (error.message.includes('same as the old password')) {
          toast.error("New password must be different from your current password");
        } else if (error.message.includes('weak password')) {
          toast.error("Password is too weak. Please choose a stronger password");
        } else {
          toast.error(error.message || "Failed to update password");
        }
      } else {
        console.log("Password updated successfully");
        toast.success("Password updated successfully! You can now sign in with your new password.");
        
        // Sign out after password reset for security
        await supabase.auth.signOut();
        navigate("/login");
      }
    } catch (error) {
      console.error("Unexpected password update error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!tokenVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-yeild-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yeild-yellow mx-auto"></div>
          <p className="text-white mt-4">Verifying reset link...</p>
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
          onClick={() => navigate("/login")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Login
        </Button>
        
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <span className="text-yeild-yellow text-3xl font-bold">YEILD</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Set New Password</h1>
          <p className="text-gray-400 mt-2">
            Enter your new secure password below
          </p>
        </div>
        
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-white">New Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password (min 8 chars)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="yeild-input pr-10"
                required
                minLength={8}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-400">
              Must include uppercase, lowercase, and numbers
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-white">Confirm New Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="yeild-input pr-10"
                required
                minLength={8}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full yeild-btn-primary mt-6" 
            disabled={isLoading || !tokenVerified}
          >
            {isLoading ? "Updating Password..." : "Update Password"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
