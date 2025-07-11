import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Eye, EyeOff, Upload, User, Mail, Phone, Camera } from "lucide-react";
import { useSignUp } from '@/hooks/useSignUp';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

interface SignupData {
  firstName: string;
  contactMethod: 'email' | 'phone';
  contact: string;
  password: string;
  username: string;
  profileImage: string | null;
}

const TwitterStyleSignup = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [signupData, setSignupData] = useState<SignupData>({
    firstName: '',
    contactMethod: 'email',
    contact: '',
    password: '',
    username: '',
    profileImage: null
  });

  const { signUp, signInWithProvider } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const steps = [
    'initial',
    'name', 
    'contact',
    'password', 
    'username',
    'profile',
    'confirmation'
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      setIsLoading(true);
      const { error } = await signInWithProvider('google');
      if (error) {
        setError(error.message);
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinalSubmit = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const { error } = await signUp(
        signupData.contact, 
        signupData.password, 
        signupData.firstName
      );
      
      if (error) {
        setError(error.message);
      } else {
        setCurrentStep(6); // Go to confirmation step
      }
    } catch (error: any) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1: return signupData.firstName.trim().length >= 2;
      case 2: return signupData.contact.trim().length >= 5;
      case 3: return signupData.password.length >= 6;
      case 4: return signupData.username.trim().length >= 3;
      case 5: return true; // Profile image is optional
      default: return true;
    }
  };

  const getStepContent = () => {
    switch (currentStep) {
      case 0: // Initial screen
        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center space-y-6"
          >
            <div className="space-y-4">
              <h1 className="text-4xl font-bold text-white">Sign up on</h1>
              <h1 className="text-4xl font-bold text-yeild-yellow">YEILD</h1>
            </div>
            
            <Button 
              onClick={handleGoogleSignup}
              disabled={isLoading}
              className="w-full bg-white text-black hover:bg-gray-100 py-6 text-lg font-medium rounded-full flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Use Google to Sign Up
            </Button>
            
            <div className="flex items-center justify-center space-x-4 text-gray-400">
              <div className="h-px bg-gray-600 flex-1"></div>
              <span>or</span>
              <div className="h-px bg-gray-600 flex-1"></div>
            </div>
            
            <Button 
              onClick={handleNext}
              className="w-full bg-yeild-yellow text-black hover:bg-yellow-400 py-6 text-lg font-bold rounded-full"
            >
              Sign up on YEILD
            </Button>
            
            <div className="text-xs text-gray-400 px-4">
              By signing up, you agree to the{" "}
              <span className="text-yeild-yellow">Terms of Service</span> and{" "}
              <span className="text-yeild-yellow">Privacy Policy</span>
            </div>
          </motion.div>
        );

      case 1: // First name
        return (
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-white">First name</h2>
            </div>
            <Input
              type="text"
              placeholder="First name"
              value={signupData.firstName}
              onChange={(e) => setSignupData({...signupData, firstName: e.target.value})}
              className="w-full bg-transparent border-gray-600 text-white text-xl py-6 rounded-lg focus:border-yeild-yellow"
              autoFocus
            />
            <Button 
              onClick={handleNext}
              disabled={!isStepValid()}
              className="w-full bg-yeild-yellow text-black hover:bg-yellow-400 py-6 text-lg font-bold rounded-full disabled:opacity-50"
            >
              Next
            </Button>
          </motion.div>
        );

      case 2: // Contact method
        return (
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSignupData({...signupData, contactMethod: 'email'})}
                  className={`flex items-center space-x-2 p-3 rounded-full ${
                    signupData.contactMethod === 'email' 
                      ? 'bg-yeild-yellow text-black' 
                      : 'bg-gray-800 text-white'
                  }`}
                >
                  <Mail className="w-5 h-5" />
                  <span>Email</span>
                </button>
                <button
                  onClick={() => setSignupData({...signupData, contactMethod: 'phone'})}
                  className={`flex items-center space-x-2 p-3 rounded-full ${
                    signupData.contactMethod === 'phone' 
                      ? 'bg-yeild-yellow text-black' 
                      : 'bg-gray-800 text-white'
                  }`}
                >
                  <Phone className="w-5 h-5" />
                  <span>Phone</span>
                </button>
              </div>
            </div>

            <Input
              type={signupData.contactMethod === 'email' ? 'email' : 'tel'}
              placeholder={signupData.contactMethod === 'email' ? 'Email address' : 'Phone number'}
              value={signupData.contact}
              onChange={(e) => setSignupData({...signupData, contact: e.target.value})}
              className="w-full bg-transparent border-gray-600 text-white text-xl py-6 rounded-lg focus:border-yeild-yellow"
              autoFocus
            />
            
            {signupData.contactMethod === 'phone' && (
              <p className="text-sm text-gray-400">
                Make sure your password is 6 characters or more.
              </p>
            )}

            <Button 
              onClick={handleNext}
              disabled={!isStepValid()}
              className="w-full bg-yeild-yellow text-black hover:bg-yellow-400 py-6 text-lg font-bold rounded-full disabled:opacity-50"
            >
              Next
            </Button>
          </motion.div>
        );

      case 3: // Password
        return (
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-white">Password</h2>
            </div>
            
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={signupData.password}
                onChange={(e) => setSignupData({...signupData, password: e.target.value})}
                className="w-full bg-transparent border-gray-600 text-white text-xl py-6 pr-12 rounded-lg focus:border-yeild-yellow"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
              </button>
            </div>

            {signupData.password.length > 0 && signupData.password.length < 6 && (
              <p className="text-red-400 text-sm">Password must be at least 6 characters</p>
            )}

            <div className="text-sm text-gray-400 space-y-2">
              <p>Make sure your password is 6 characters or more.</p>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${signupData.password.length >= 6 ? 'bg-green-500' : 'bg-gray-600'}`}></div>
                <span className={signupData.password.length >= 6 ? 'text-green-400' : 'text-gray-400'}>
                  Available
                </span>
              </div>
            </div>

            <Button 
              onClick={handleNext}
              disabled={!isStepValid()}
              className="w-full bg-yeild-yellow text-black hover:bg-yellow-400 py-6 text-lg font-bold rounded-full disabled:opacity-50"
            >
              Next
            </Button>
          </motion.div>
        );

      case 4: // Username
        return (
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-white">Username</h2>
              <p className="text-gray-400">Username cannot be changed later.</p>
            </div>
            
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl">@</span>
              <Input
                type="text"
                placeholder="username"
                value={signupData.username}
                onChange={(e) => setSignupData({...signupData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '')})}
                className="w-full bg-transparent border-gray-600 text-white text-xl py-6 pl-10 rounded-lg focus:border-yeild-yellow"
                autoFocus
              />
            </div>

            {signupData.username.length >= 3 && (
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-green-400">Available</span>
              </div>
            )}

            <Button 
              onClick={handleNext}
              disabled={!isStepValid()}
              className="w-full bg-yeild-yellow text-black hover:bg-yellow-400 py-6 text-lg font-bold rounded-full disabled:opacity-50"
            >
              Next
            </Button>
          </motion.div>
        );

      case 5: // Profile image
        return (
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6 text-center"
          >
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-white">Add a profile image so people can recognize you</h2>
              
              <div className="flex justify-center">
                <div className="w-32 h-32 rounded-full border-4 border-yeild-yellow bg-gray-800 flex items-center justify-center">
                  {signupData.profileImage ? (
                    <img src={signupData.profileImage} alt="Profile" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <User className="w-16 h-16 text-yeild-yellow" />
                  )}
                </div>
              </div>
              
              <Button 
                variant="outline"
                className="border-yeild-yellow text-yeild-yellow hover:bg-yeild-yellow hover:text-black"
              >
                <Camera className="w-5 h-5 mr-2" />
                Choose image
              </Button>
            </div>

            <Button 
              onClick={handleFinalSubmit}
              disabled={isLoading}
              className="w-full bg-yeild-yellow text-black hover:bg-yellow-400 py-6 text-lg font-bold rounded-full"
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
            
            <Button 
              onClick={handleFinalSubmit}
              variant="ghost"
              className="w-full text-yeild-yellow hover:bg-yeild-yellow hover:text-black py-6 text-lg rounded-full"
              disabled={isLoading}
            >
              Skip for now
            </Button>
          </motion.div>
        );

      case 6: // Confirmation
        return (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6"
          >
            <div className="w-20 h-20 mx-auto bg-yeild-yellow rounded-full flex items-center justify-center">
              <Mail className="w-10 h-10 text-black" />
            </div>
            <h2 className="text-3xl font-bold text-white">Check your email</h2>
            <p className="text-gray-400 text-lg">
              We've sent a confirmation link to {signupData.contact}. Click the link to verify your account and get started!
            </p>
            <Button 
              onClick={() => window.location.href = '/login'}
              className="w-full bg-yeild-yellow text-black hover:bg-yellow-400 py-6 text-lg font-bold rounded-full"
            >
              Continue to Login
            </Button>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Progress indicator */}
        {currentStep > 0 && currentStep < 6 && (
          <div className="mb-8">
            <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
              <span>Step {currentStep} of 5</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-1">
              <div 
                className="bg-yeild-yellow h-1 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 5) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Back button */}
        {currentStep > 0 && currentStep < 6 && (
          <Button
            onClick={handleBack}
            variant="ghost"
            className="mb-6 p-2 text-white hover:bg-gray-800 rounded-full"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
        )}

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-600 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Step content */}
        <AnimatePresence mode="wait">
          {getStepContent()}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TwitterStyleSignup;