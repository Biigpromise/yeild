
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import ProgressiveSignupFlow from "@/components/auth/ProgressiveSignupFlow";
import ModernSignInFlow from "@/components/auth/ModernSignInFlow";
import UserTypeSelection from "@/components/auth/UserTypeSelection";
import ModernBrandSignup from "@/components/auth/ModernBrandSignup";

const SignUp = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [searchParams] = useSearchParams();
  const [selectedUserType, setSelectedUserType] = useState<'user' | 'brand' | null>(null);
  const [authMode, setAuthMode] = useState<'signup' | 'signin'>('signup'); // Default to signup instead of signin

  // Check for user type in URL params
  useEffect(() => {
    const userType = searchParams.get('type') as 'user' | 'brand';
    if (userType && ['user', 'brand'].includes(userType)) {
      setSelectedUserType(userType);
      // Force signup mode when type is specified
      setAuthMode('signup');
    }
  }, [searchParams]);

  // Handle redirect after auth state is determined
  useEffect(() => {
    if (!loading && user) {
      // Check if user is admin and redirect accordingly
      if (user.email === 'yeildsocials@gmail.com') {
        navigate("/admin");
      } else {
        // Check user roles to determine proper dashboard
        navigate("/dashboard");
      }
    }
  }, [user, loading, navigate]);

  // Show loading while auth state is being determined
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Don't render the form if user is already logged in
  if (user) {
    return null;
  }

  // Show user type selection if no type is selected
  if (!selectedUserType) {
    return (
      <UserTypeSelection
        onSelectUser={() => setSelectedUserType('user')}
        onSelectBrand={() => setSelectedUserType('brand')}
        onSwitchToSignin={() => setAuthMode('signin')}
      />
    );
  }

  // Show signin flow
  if (authMode === 'signin') {
    return (
      <ModernSignInFlow
        userType={selectedUserType}
        onBack={() => setSelectedUserType(null)}
        onSwitchToSignup={() => setAuthMode('signup')}
      />
    );
  }

  // Show signup flow - use ModernBrandSignup for brands, ProgressiveSignupFlow for users
  if (selectedUserType === 'brand') {
    return (
      <ModernBrandSignup
        onBack={() => setSelectedUserType(null)}
      />
    );
  } else {
    return (
      <ProgressiveSignupFlow
        userType={selectedUserType}
        onBack={() => setSelectedUserType(null)}
        onSwitchToSignin={() => setAuthMode('signin')}
      />
    );
  }
};

export default SignUp;
