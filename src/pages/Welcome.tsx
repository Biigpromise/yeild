
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Users, Building2 } from 'lucide-react';
import { extractReferralCode } from '@/config/app';

const Welcome: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [logoAnimated, setLogoAnimated] = useState(false);

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

  const handleUserSignup = () => {
    navigate('/auth?type=user');
  };

  const handleBrandSignup = () => {
    navigate('/auth?type=brand');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-yeild-black relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-yeild-yellow opacity-10 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-yeild-yellow opacity-10 blur-3xl"></div>
      
      <div className="text-center space-y-8 p-6 max-w-4xl mx-auto">
        <div className="space-y-6">
          {/* Animated Logo */}
          <div className={`transition-all duration-1000 ease-out ${
            logoAnimated ? 'transform translate-y-0 opacity-100 scale-100' : 'transform -translate-y-20 opacity-0 scale-110'
          }`}>
            <div className="inline-block p-4 bg-yeild-yellow/10 rounded-full">
              <img 
                src="/lovable-uploads/54ccebd1-9d4c-452f-b0a9-0b9de0fcfebf.png" 
                alt="YEILD Logo" 
                className="w-20 h-20 md:w-24 md:h-24 object-contain"
              />
            </div>
          </div>
          
          {/* Welcome Text */}
          <div className={`transition-all duration-1000 delay-300 ease-out ${
            logoAnimated ? 'transform translate-y-0 opacity-100' : 'transform translate-y-10 opacity-0'
          }`}>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              Welcome to <span className="text-yeild-yellow">YEILD</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Join the ultimate platform for earning rewards and connecting brands with their audience
            </p>
          </div>
        </div>
        
        {/* User Type Selection */}
        <div className={`transition-all duration-1000 delay-500 ease-out ${
          logoAnimated ? 'transform translate-y-0 opacity-100' : 'transform translate-y-10 opacity-0'
        }`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <Card className="bg-yeild-black/50 border-yeild-yellow/20 hover:border-yeild-yellow/40 transition-all duration-300 cursor-pointer group" onClick={handleUserSignup}>
              <CardContent className="p-6 text-center">
                <div className="mb-4 flex justify-center">
                  <div className="p-3 bg-yeild-yellow/10 rounded-full group-hover:bg-yeild-yellow/20 transition-all">
                    <Users className="w-8 h-8 text-yeild-yellow" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">I'm a User</h3>
                <p className="text-gray-300 text-sm mb-4">
                  Complete tasks, earn rewards, and build your reputation
                </p>
                <Button 
                  className="bg-yeild-yellow text-black hover:bg-yeild-yellow/90 w-full group-hover:scale-105 transition-all"
                  onClick={handleUserSignup}
                >
                  Get Started <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-yeild-black/50 border-yeild-yellow/20 hover:border-yeild-yellow/40 transition-all duration-300 cursor-pointer group" onClick={handleBrandSignup}>
              <CardContent className="p-6 text-center">
                <div className="mb-4 flex justify-center">
                  <div className="p-3 bg-yeild-yellow/10 rounded-full group-hover:bg-yeild-yellow/20 transition-all">
                    <Building2 className="w-8 h-8 text-yeild-yellow" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">I'm a Brand</h3>
                <p className="text-gray-300 text-sm mb-4">
                  Create campaigns, reach your audience, and grow your business
                </p>
                <Button 
                  className="bg-yeild-yellow text-black hover:bg-yeild-yellow/90 w-full group-hover:scale-105 transition-all"
                  onClick={handleBrandSignup}
                >
                  Get Started <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Already have an account */}
        <div className={`transition-all duration-1000 delay-700 ease-out ${
          logoAnimated ? 'transform translate-y-0 opacity-100' : 'transform translate-y-10 opacity-0'
        }`}>
          <p className="text-gray-400">
            Already have an account?{' '}
            <button 
              onClick={() => navigate('/auth')}
              className="text-yeild-yellow hover:text-yeild-yellow/80 underline"
            >
              Sign in here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
