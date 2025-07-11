
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import TwitterStyleSignup from "@/components/auth/TwitterStyleSignup";
import YieldGuideSection from "@/components/onboarding/YieldGuideSection";

const SignUp = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  // Handle redirect after auth state is determined
  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  // Show loading while auth state is being determined
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  // Don't render the form if user is already logged in
  if (user) {
    return null;
  }

  return (
    <>
      <TwitterStyleSignup />
      <YieldGuideSection />
    </>
  );
};

export default SignUp;
