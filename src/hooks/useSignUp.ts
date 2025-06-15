
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

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

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    setIsLoading(true);
    
    try {
      const { error } = await signUp(email, password, name);
      
      if (error) {
        if (error.message.includes("User already registered")) {
          toast.error("An account with this email already exists");
        } else if (error.message.includes("Password should be")) {
          toast.error("Password must be at least 6 characters long");
        } else {
          toast.error(error.message || "Sign up failed");
        }
      } else {
        toast.success("Account created! Please check your email to confirm your account.");
        navigate("/login");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
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
  };
};
