
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const useSignUp = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

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
        setAwaitingConfirmation(true);
        toast.success("Account created! Please check your email to confirm your account.");
      }
    } catch (error) {
      setSignUpError("An unexpected error occurred");
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
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
      // https://supabase.com/docs/reference/javascript/auth-resend
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
      });
      if (error) {
        toast.error("Could not resend confirmation email. Please wait a moment and try again.");
        return;
      }
      setResendDone(true);
      toast.success("Confirmation email resent! Check your inbox or spam folder.");
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
  };
};
