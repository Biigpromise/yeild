
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import UserTypeSelection from '@/components/auth/UserTypeSelection';
import ModernSignInFlow from '@/components/auth/ModernSignInFlow';
import ProgressiveSignupFlow from '@/components/auth/ProgressiveSignupFlow';
import ModernBrandSignup from '@/components/auth/ModernBrandSignup';

const AuthPage = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [searchParams] = useSearchParams();
  const [selectedUserType, setSelectedUserType] = useState<'user' | 'brand' | null>(null);
  const [authMode, setAuthMode] = useState<'signup' | 'signin' | 'select'>('select');

  // Check for user type in URL params
  useEffect(() => {
    const userType = searchParams.get('type') as 'user' | 'brand';
    const mode = searchParams.get('mode') as 'signin' | 'signup';
    
    if (userType && ['user', 'brand'].includes(userType)) {
      setSelectedUserType(userType);
      setAuthMode(mode || 'signup');
    }
  }, [searchParams]);

  // Handle redirect after auth state is determined
  useEffect(() => {
    if (!loading && user) {
      console.log('User authenticated, checking role for redirect');
      
      // Check if user is admin
      if (user.email === 'yeildsocials@gmail.com') {
        navigate("/admin");
        return;
      }
      
      // Check if user is a brand based on metadata or roles
      const isBrand = user.user_metadata?.user_type === 'brand' || 
                     user.user_metadata?.company_name;
      
      if (isBrand) {
        navigate("/brand-dashboard");
      } else {
        navigate("/dashboard");
      }
    }
  }, [user, loading, navigate]);

  // Show loading while auth state is being determined
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yeild-yellow"></div>
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  // Don't render if user is already logged in
  if (user) {
    return null;
  }

  const handleSelectUser = () => {
    setSelectedUserType('user');
    setAuthMode('signup');
  };

  const handleSelectBrand = () => {
    setSelectedUserType('brand');
    setAuthMode('signup');
  };

  const handleSwitchToSignin = () => {
    setAuthMode('signin');
  };

  const handleSwitchToSignup = () => {
    setAuthMode('signup');
  };

  const handleBack = () => {
    setSelectedUserType(null);
    setAuthMode('select');
  };

  // Show user type selection if no type is selected
  if (!selectedUserType || authMode === 'select') {
    return (
      <UserTypeSelection
        onSelectUser={handleSelectUser}
        onSelectBrand={handleSelectBrand}
        onSwitchToSignin={handleSwitchToSignin}
      />
    );
  }

  // Show signin flow
  if (authMode === 'signin') {
    return (
      <ModernSignInFlow
        userType={selectedUserType}
        onBack={handleBack}
        onSwitchToSignup={handleSwitchToSignup}
      />
    );
  }

  // Show signup flow - use ModernBrandSignup for brands, ProgressiveSignupFlow for users
  if (selectedUserType === 'brand') {
    return (
      <ModernBrandSignup
        onBack={handleBack}
        onSwitchToSignin={handleSwitchToSignin}
      />
    );
  } else {
    return (
      <ProgressiveSignupFlow
        userType={selectedUserType}
        onBack={handleBack}
        onSwitchToSignin={handleSwitchToSignin}
      />
    );
  }
};

export default AuthPage;
