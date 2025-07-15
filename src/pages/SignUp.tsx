
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import ModernSignupPage from "@/components/auth/ModernSignupPage";
import UserTypeSelection from "@/components/auth/UserTypeSelection";

const SignUp = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [searchParams] = useSearchParams();
  const [selectedUserType, setSelectedUserType] = useState<'user' | 'brand' | null>(null);

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
      />
    );
  }

  // Show modern signup page
  return (
    <ModernSignupPage
      userType={selectedUserType}
      onBack={() => setSelectedUserType(null)}
    />
  );
};

export default SignUp;
