
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import ProgressiveSignupFlow from "@/components/auth/ProgressiveSignupFlow";
import ModernSignInFlow from "@/components/auth/ModernSignInFlow";
import UserTypeSelection from "@/components/auth/UserTypeSelection";

const SignUp = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [searchParams] = useSearchParams();
  const [selectedUserType, setSelectedUserType] = useState<'user' | 'brand' | null>(null);
  const [authMode, setAuthMode] = useState<'signup' | 'signin'>('signin'); // Default to signin

  // Check for user type in URL params
  useEffect(() => {
    const userType = searchParams.get('type') as 'user' | 'brand';
    if (userType && ['user', 'brand'].includes(userType)) {
      setSelectedUserType(userType);
    }
  }, [searchParams]);

  // Handle redirect after auth state is determined
  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard");
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
        onSwitchToSignin={() => setAuthMode('signup')} // This actually switches to signup
      />
    );
  }

  // Show signin or signup flow
  if (authMode === 'signin') {
    return (
      <ModernSignInFlow
        userType={selectedUserType}
        onBack={() => setSelectedUserType(null)}
        onSwitchToSignup={() => setAuthMode('signup')}
      />
    );
  } else {
    return (
      <ProgressiveSignupFlow
        userType={selectedUserType}
        onBack={() => setSelectedUserType(null)}
      />
    );
  }
};

export default SignUp;
