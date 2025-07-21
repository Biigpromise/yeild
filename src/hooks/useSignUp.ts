
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { userService } from "@/services/userService";
import { fraudDetectionService } from "@/services/fraudDetectionService";
import { useSignupFraudDetection } from "@/hooks/useSignupFraudDetection";

export const useSignUp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signUp, resendConfirmation } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  // Form values
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Confirmation step UI
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);

  // For tracking any error encountered during sign up so we can display below the form
  const [signUpError, setSignUpError] = useState<string | null>(null);

  // Extract referral code from URL
  const [referralCode, setReferralCode] = useState<string>("");

  // Use fraud detection hook
  useSignupFraudDetection();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const refCode = searchParams.get('ref');
    if (refCode) {
      setReferralCode(refCode);
      toast.info("You're signing up with a referral code!");
      console.log('Referral code detected:', refCode);
    }
  }, [location]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpError(null);

    if (!agreeTerms) {
      toast.error("Please agree to the Terms and Privacy Policy");
      return;
    }

    if (!email || !password || !name) {
      toast.error("Please fill out all fields");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('Starting signup process...');
      const { error } = await signUp(email, password, name);
      
      if (error) {
        setSignUpError(error.message || "Sign up failed");
        if (error.message.includes("User already registered")) {
          toast.error("An account with this email already exists");
        } else if (error.message.includes("Password must be at least 6 characters long")) {
          toast.error("Password must be at least 6 characters long");
        } else {
          toast.error(error.message || "Sign up failed");
        }
      } else {
        console.log('Signup successful, handling referral code...');
        
        // Handle referral code if present
        if (referralCode) {
          console.log('Processing referral code:', referralCode);
          const currentUser = await supabase.auth.getUser();
          if (currentUser.data.user) {
            console.log('User found, applying referral:', currentUser.data.user.id);
            const success = await userService.handleReferralSignup(referralCode, currentUser.data.user.id);
            if (success) {
              toast.success("Referral bonus applied!");
              console.log('Referral bonus applied successfully');
            } else {
              console.log('Referral bonus application failed');
            }
          } else {
            console.log('No user found for referral application');
          }
        }
        
        // Store fraud detection data - this will now be handled by useSignupFraudDetection hook
        // but we'll also store it immediately for better coverage
        const currentUser = await supabase.auth.getUser();
        if (currentUser.data.user) {
          await fraudDetectionService.storeSignupData(currentUser.data.user.id);
        }
        
        setAwaitingConfirmation(true);
        toast.success("Account created! Please check your email for a confirmation link.");
      }
    } catch (error) {
      console.error('Signup error:', error);
      setSignUpError("An unexpected error occurred");
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setResendLoading(true);
    
    try {
      const { error } = await resendConfirmation(email);
      
      if (error) {
        toast.error(error.message || "Failed to resend confirmation email");
      } else {
        toast.success("Confirmation email sent! Please check your inbox.");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setResendLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    name,
    setName,
    agreeTerms,
    setAgreeTerms,
    showPassword,
    setShowPassword,
    isLoading,
    handleSignUp,
    awaitingConfirmation,
    signUpError,
    setAwaitingConfirmation,
    referralCode,
    handleResendConfirmation,
    resendLoading
  };
};
