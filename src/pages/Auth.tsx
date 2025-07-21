import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Eye, EyeOff, Mail, Lock, User, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });

  const { signIn, signUp, signInWithProvider, user, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect if user is already logged in
  useEffect(() => {
    if (!loading && user) {
      navigate('/onboarding');
    }
  }, [user, loading, navigate]);

  const handleGoogleAuth = async () => {
    try {
      setIsLoading(true);
      
      // Track Google auth attempt
      console.log('Starting Google authentication');
      
      const { error } = await signInWithProvider('google');
      if (error) {
        toast.error(error.message);
        console.error('Google auth error:', error);
      }
      // The redirect will be handled by the auth context
    } catch (error: any) {
      toast.error(error.message);
      console.error('Google auth unexpected error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!isLogin && !formData.name) {
      toast.error("Please enter your name");
      return;
    }

    setIsLoading(true);
    
    try {
      if (isLogin) {
        console.log('Attempting email login');
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          toast.error(error.message);
          console.error('Email login error:', error);
        } else {
          toast.success("Welcome back!");
          navigate('/dashboard');
        }
      } else {
        console.log('Attempting email signup');
        const { error } = await signUp(formData.email, formData.password, formData.name);
        if (error) {
          toast.error(error.message);
          console.error('Email signup error:', error);
        } else {
          toast.success("Account created successfully!");
          navigate('/onboarding');
        }
      }
    } catch (error: any) {
      toast.error("An unexpected error occurred");
      console.error('Email auth unexpected error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-yeild-yellow/20 to-black items-center justify-center p-12">
        <div className="text-center">
          <img 
            src="/lovable-uploads/54ccebd1-9d4c-452f-b0a9-0b9de0fcfebf.png" 
            alt="YEILD Logo" 
            className="w-32 h-32 mx-auto mb-8 object-contain"
          />
          <h1 className="text-5xl font-bold mb-6">Join us today</h1>
          <div className="space-y-4 text-left max-w-md">
            {[
              "Earn rewards for completing tasks",
              "Build your referral network",
              "Unlock exclusive benefits",
              "Join a growing community"
            ].map((text, index) => (
              <div key={index} className="flex items-center space-x-3">
                <CheckCircle className="w-6 h-6 text-yeild-yellow" />
                <span className="text-lg">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 lg:px-16">
        <div className="max-w-md mx-auto w-full">
          {/* Back button */}
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            className="mb-8 p-2 text-white hover:bg-gray-800 rounded-full"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>

          {/* Logo for mobile */}
          <div className="lg:hidden text-center mb-8">
            <img 
              src="/lovable-uploads/54ccebd1-9d4c-452f-b0a9-0b9de0fcfebf.png" 
              alt="YEILD Logo" 
              className="w-16 h-16 mx-auto mb-4 object-contain"
            />
            <h2 className="text-2xl font-bold">Join us today</h2>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? 'login' : 'signup'}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="text-3xl lg:text-4xl font-bold mb-8">
                {isLogin ? 'Sign in to YEILD' : 'Create your account'}
              </h1>

              {/* Google Sign In */}
              <Button
                onClick={handleGoogleAuth}
                disabled={isLoading}
                variant="outline"
                className="w-full mb-6 py-6 text-lg font-medium border-gray-600 text-white hover:bg-gray-800 rounded-full flex items-center justify-center gap-3"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {isLogin ? 'Sign in with Google' : 'Sign up with Google'}
              </Button>

              {/* Divider */}
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-black text-gray-400">or</span>
                </div>
              </div>

              {/* Email Form */}
              <form onSubmit={handleEmailAuth} className="space-y-4">
                {!isLogin && (
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      type="text"
                      placeholder="Full name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full bg-black border-gray-600 text-white pl-10 py-6 text-lg rounded-lg focus:border-yeild-yellow focus:ring-yeild-yellow"
                    />
                  </div>
                )}
                
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="email"
                    placeholder="Email address"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full bg-black border-gray-600 text-white pl-10 py-6 text-lg rounded-lg focus:border-yeild-yellow focus:ring-yeild-yellow"
                  />
                </div>
                
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="w-full bg-black border-gray-600 text-white pl-10 pr-10 py-6 text-lg rounded-lg focus:border-yeild-yellow focus:ring-yeild-yellow"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-yeild-yellow text-black hover:bg-yeild-yellow/90 py-6 text-lg font-bold rounded-full mt-6"
                >
                  {isLoading ? "Please wait..." : (isLogin ? "Sign in" : "Create account")}
                </Button>
              </form>

              {/* Switch between login/signup */}
              <div className="text-center mt-8">
                <span className="text-gray-400">
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                </span>
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-yeild-yellow hover:text-yeild-yellow/80 font-medium"
                >
                  {isLogin ? "Sign up" : "Sign in"}
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Auth;
