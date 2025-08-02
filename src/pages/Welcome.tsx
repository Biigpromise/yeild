
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { YieldLogo } from '@/components/ui/YieldLogo';
import { UserTypeInfoModal } from '@/components/ui/UserTypeInfoModal';
import { extractReferralCode } from '@/config/app';

const Welcome: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [logoAnimated, setLogoAnimated] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedUserType, setSelectedUserType] = useState<'user' | 'brand' | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLogoAnimated(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Check for referral code and redirect to signup
  useEffect(() => {
    const referralCode = searchParams.get('ref');
    if (referralCode) {
      // Redirect to signup with referral code
      navigate(`/auth?mode=signup&ref=${referralCode}`);
    }
  }, [searchParams, navigate]);

  const handleUserTypeSelect = (type: 'user' | 'brand') => {
    setSelectedUserType(type);
    setShowModal(true);
  };

  const handleContinue = () => {
    if (selectedUserType) {
      navigate(`/auth?type=${selectedUserType}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-yeild-black relative overflow-hidden">
      {/* Modern geometric background */}
      <div className="absolute inset-0 bg-gradient-to-br from-yeild-black via-yeild-black to-yeild-yellow/5"></div>
      <div className="absolute top-20 right-20 w-64 h-64 bg-yeild-yellow/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 left-20 w-48 h-48 bg-yeild-yellow/5 rounded-full blur-2xl animate-pulse-subtle"></div>
      
      <div className="relative z-10 text-center space-y-12 p-8 max-w-md mx-auto">
        {/* Large Logo */}
        <div className={`transition-all duration-1000 ease-out ${
          logoAnimated ? 'transform translate-y-0 opacity-100 scale-100' : 'transform -translate-y-10 opacity-0 scale-95'
        }`}>
          <div className="mx-auto mb-8">
            <YieldLogo size={120} className="mx-auto drop-shadow-2xl" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight">
            YEILD
          </h1>
        </div>
        
        {/* User Type Selection - Modern Buttons */}
        <div className={`transition-all duration-1000 delay-300 ease-out ${
          logoAnimated ? 'transform translate-y-0 opacity-100' : 'transform translate-y-10 opacity-0'
        }`}>
          <div className="space-y-4">
            <Button 
              onClick={() => handleUserTypeSelect('user')}
              className="w-full h-16 text-lg font-semibold bg-yeild-yellow text-yeild-black hover:bg-yeild-yellow/90 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-yeild-glow"
            >
              I'm a User
            </Button>
            
            <Button 
              onClick={() => handleUserTypeSelect('brand')}
              className="w-full h-16 text-lg font-semibold bg-transparent text-white border-2 border-yeild-yellow/30 hover:border-yeild-yellow hover:bg-yeild-yellow/10 rounded-2xl transition-all duration-300 hover:scale-105"
            >
              I'm a Brand
            </Button>
          </div>
        </div>

        {/* Sign in link */}
        <div className={`transition-all duration-1000 delay-500 ease-out ${
          logoAnimated ? 'transform translate-y-0 opacity-100' : 'transform translate-y-10 opacity-0'
        }`}>
          <button 
            onClick={() => navigate('/auth')}
            className="text-gray-400 hover:text-yeild-yellow transition-colors duration-300 text-sm"
          >
            Already have an account? Sign in
          </button>
        </div>
      </div>

      {/* User Type Info Modal */}
      <UserTypeInfoModal
        open={showModal}
        onOpenChange={setShowModal}
        userType={selectedUserType}
        onContinue={handleContinue}
      />
    </div>
  );
};

export default Welcome;
