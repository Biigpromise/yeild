
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Welcome = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  // Redirect authenticated users
  React.useEffect(() => {
    if (!loading && user) {
      if (user.email === 'yeildsocials@gmail.com') {
        navigate("/admin");
      } else if (user.user_metadata?.user_type === 'brand' || user.user_metadata?.company_name) {
        navigate("/brand-dashboard");
      } else {
        navigate("/dashboard");
      }
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yeild-yellow"></div>
      </div>
    );
  }

  if (user) {
    return null; // Will be redirected
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-yeild-yellow/10 via-black to-black" />
      
      <div className="relative z-10 text-center max-w-4xl mx-auto">
        {/* Animated Logo */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
          className="mb-12"
        >
          <img 
            src="/lovable-uploads/54ccebd1-9d4c-452f-b0a9-0b9de0fcfebf.png" 
            alt="YEILD Logo" 
            className="w-24 h-24 md:w-32 md:h-32 mx-auto mb-6 object-contain"
          />
          <h1 className="text-4xl md:text-6xl lg:text-8xl font-bold text-yeild-yellow">
            YEILD
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mt-4 mb-8">
            Earn rewards for completing tasks and grow your network
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 items-center justify-center"
        >
          <Button
            onClick={() => navigate('/auth?type=user&mode=signup')}
            className="bg-yeild-yellow text-black hover:bg-yeild-yellow/90 px-8 py-4 text-lg font-bold rounded-full transition-all duration-300 transform hover:scale-105 w-full sm:w-auto"
          >
            Join as Creator
          </Button>
          
          <Button
            onClick={() => navigate('/auth?type=brand&mode=signup')}
            variant="outline"
            className="border-yeild-yellow text-yeild-yellow hover:bg-yeild-yellow hover:text-black px-8 py-4 text-lg font-bold rounded-full transition-all duration-300 transform hover:scale-105 w-full sm:w-auto"
          >
            Join as Brand
          </Button>
        </motion.div>

        {/* Sign In Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mt-6"
        >
          <button
            onClick={() => navigate('/auth?mode=signin')}
            className="text-gray-400 hover:text-white transition-colors underline"
          >
            Already have an account? Sign in
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default Welcome;
