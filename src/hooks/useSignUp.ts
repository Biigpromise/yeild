
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
  const { signUp, verifyConfirmationCode } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Form values
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Confirmation step UI
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

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
        // Handle referral code if present
        if (referralCode) {
          const currentUser = await supabase.auth.getUser();
          if (currentUser.data.user) {
            await userService.handleReferralSignup(referralCode, currentUser.data.user.id);
          }
        }
        
        // Store fraud detection data - this will now be handled by useSignupFraudDetection hook
        // but we'll also store it immediately for better coverage
        const currentUser = await supabase.auth.getUser();
        if (currentUser.data.user) {
          await fraudDetectionService.storeSignupData(currentUser.data.user.id);
        }
        
        setAwaitingConfirmation(true);
        toast.success("Account created! Please check your email for a confirmation code.");
      }
    } catch (error) {
      setSignUpError("An unexpected error occurred");
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeVerification = async () => {
    if (!confirmationCode || confirmationCode.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }

    setIsVerifying(true);
    try {
      const result = await verifyConfirmationCode(confirmationCode);
      
      if (result.success) {
        toast.success("Account confirmed! Redirecting to dashboard...");
        setTimeout(() => {
          navigate("/dashboard");
        }, 1000);
      } else {
        toast.error(result.error || "Invalid confirmation code");
      }
    } catch (error) {
      toast.error("Verification failed. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  // RESEND EMAIL LOGIC
  const [resending, setResending] = useState(false);
  const [resendDone, setResendDone] = useState(false);

  const resendConfirmation = async () => {
    if (!email) {
      toast.error("No email found to resend confirmation. Please refresh and sign up again.");
      return;
    }
    setResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
      });
      if (error) {
        toast.error("Could not resend confirmation email. Please wait a moment and try again.");
        return;
      }
      setResendDone(true);
      toast.success("Confirmation code resent! Check your inbox or spam folder.");
    } catch (err) {
      toast.error("Unexpected error during resend.");
    } finally {
      setResending(false);
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
    resendConfirmation,
    resending,
    resendDone,
    setAwaitingConfirmation,
    referralCode,
    confirmationCode,
    setConfirmationCode,
    handleCodeVerification,
    isVerifying
  };
};
