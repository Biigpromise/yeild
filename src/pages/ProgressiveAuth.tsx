
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Eye, EyeOff, Mail, Lock, User, Phone, Play } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

const ProgressiveAuth = () => {
  const [searchParams] = useSearchParams();
  const userType = searchParams.get('type') || 'user';
  const [currentStep, setCurrentStep] = useState(0);
  const [isSignUp, setIsSignUp] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    username: '',
    phone: '',
    profilePicture: null as File | null,
    userPreference: '',
    language: 'en',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });

  const { signIn, signUp, signInWithProvider, user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      if (userType === 'brand') {
        navigate('/brand-signup');
      } else {
        navigate('/onboarding');
      }
    }
  }, [user, loading, navigate, userType]);

  const steps = isSignUp 
    ? ['welcome', 'method', 'basicInfo', 'preferences', 'confirmation', 'achievement', 'community', 'complete']
    : ['method', 'email', 'password'];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep === 0) {
      navigate('/user-type');
    } else {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      setIsLoading(true);
      const { error } = await signInWithProvider('google', userType);
      if (error) {
        toast.error(error.message);
      } else {
        // Skip to achievement step for social signup
        setCurrentStep(5);
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneSignup = () => {
    // For now, just move to next step - phone auth can be implemented later
    toast.info("Phone signup coming soon! Please use email for now.");
  };

  const handleEmailSignup = () => {
    handleNext();
  };

  const generateUsername = (name: string) => {
    const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const randomNum = Math.floor(Math.random() * 1000);
    return `${cleanName}${randomNum}`;
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      username: prev.username || generateUsername(name)
    }));
  };

  const handleEmailAuth = async () => {
    if (!formData.email || !formData.password || !formData.name) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    
    try {
      const { error } = await signUp(
        formData.email, 
        formData.password, 
        formData.name,
        userType,
        {
          username: formData.username,
          phone: formData.phone,
          user_preference: formData.userPreference,
          language: formData.language,
          timezone: formData.timezone
        }
      );
      
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Account created successfully! Please check your email to confirm.");
        setCurrentStep(4); // Move to confirmation step
      }
    } catch (error: any) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async () => {
    if (!formData.email || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    
    try {
      const { error } = await signIn(formData.email, formData.password);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Welcome back!");
      }
    } catch (error: any) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const getStepContent = () => {
    switch (steps[currentStep]) {
      case 'welcome':
        return (
          <motion.div 
            key="welcome"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8 text-center"
          >
            <div className="space-y-6">
              <div className="w-20 h-20 mx-auto bg-yeild-yellow rounded-full flex items-center justify-center mb-6">
                <span className="text-3xl">👋</span>
              </div>
              <h1 className="text-4xl font-bold">
                Welcome to <span className="text-yeild-yellow">YEILD</span>
              </h1>
              <p className="text-xl text-gray-300">
                Let's set up your account and get you earning.
              </p>
            </div>
            
            <Button 
              onClick={handleNext}
              className="w-full bg-yeild-yellow text-black hover:bg-yeild-yellow/90 py-6 text-lg font-bold rounded-lg"
            >
              Continue
            </Button>
          </motion.div>
        );

      case 'method':
        return (
          <motion.div 
            key="method"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6 text-center"
          >
            <div className="space-y-4">
              <h1 className="text-3xl font-bold">
                {isSignUp ? 'Choose how to sign up' : 'Sign in to continue'}
              </h1>
            </div>
            
            <div className="space-y-4">
              <Button 
                onClick={handleGoogleAuth}
                disabled={isLoading}
                className="w-full bg-white text-black hover:bg-gray-100 py-6 text-lg font-medium rounded-lg flex items-center justify-center gap-3"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {isSignUp ? 'Sign up with Google' : 'Sign in with Google'}
              </Button>

              {isSignUp && (
                <Button 
                  onClick={handlePhoneSignup}
                  className="w-full bg-gray-800 text-white hover:bg-gray-700 py-6 text-lg font-medium rounded-lg flex items-center justify-center gap-3"
                >
                  <Phone className="w-5 h-5" />
                  Sign up with Phone Number
                </Button>
              )}
              
              <Button 
                onClick={handleEmailSignup}
                className="w-full bg-yeild-yellow text-black hover:bg-yeild-yellow/90 py-6 text-lg font-bold rounded-lg flex items-center justify-center gap-3"
              >
                <Mail className="w-5 h-5" />
                {isSignUp ? 'Sign up with Email' : 'Sign in with Email'}
              </Button>
            </div>

            {isSignUp && (
              <div className="text-center">
                <span className="text-gray-400">Already have an account? </span>
                <button
                  onClick={() => setIsSignUp(false)}
                  className="text-yeild-yellow hover:text-yeild-yellow/80 font-medium"
                >
                  Sign in
                </button>
              </div>
            )}

            {!isSignUp && (
              <div className="text-center">
                <span className="text-gray-400">Don't have an account? </span>
                <button
                  onClick={() => setIsSignUp(true)}
                  className="text-yeild-yellow hover:text-yeild-yellow/80 font-medium"
                >
                  Sign up
                </button>
              </div>
            )}
          </motion.div>
        );

      case 'basicInfo':
        return (
          <motion.div 
            key="basicInfo"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="space-y-2 text-center">
              <h2 className="text-3xl font-bold">Basic Info</h2>
              <p className="text-gray-300">Tell us a bit about yourself</p>
            </div>
            
            <div className="space-y-4">
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full bg-black border-gray-600 text-white pl-10 py-6 text-lg rounded-lg focus:border-yeild-yellow focus:ring-yeild-yellow"
                  autoFocus
                />
              </div>

              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg">@</span>
                <Input
                  type="text"
                  placeholder="Username"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  className="w-full bg-black border-gray-600 text-white pl-10 py-6 text-lg rounded-lg focus:border-yeild-yellow focus:ring-yeild-yellow"
                />
              </div>

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-black border-gray-600 text-white pl-10 py-6 text-lg rounded-lg focus:border-yeild-yellow focus:ring-yeild-yellow"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full bg-black border-gray-600 text-white pl-10 pr-12 py-6 text-lg rounded-lg focus:border-yeild-yellow focus:ring-yeild-yellow"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            
            <Button 
              onClick={handleNext}
              disabled={!formData.name || !formData.username || !formData.email || !formData.password}
              className="w-full bg-yeild-yellow text-black hover:bg-yeild-yellow/90 py-6 text-lg font-bold rounded-lg disabled:opacity-50"
            >
              Next
            </Button>
          </motion.div>
        );

      case 'preferences':
        return (
          <motion.div 
            key="preferences"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8 text-center"
          >
            <div className="space-y-4">
              <h2 className="text-3xl font-bold">What do you prefer?</h2>
              <p className="text-gray-300">Choose what interests you most</p>
            </div>
            
            <div className="space-y-4">
              <button
                onClick={() => setFormData({...formData, userPreference: 'tasks'})}
                className={`w-full p-6 rounded-lg border-2 transition-all ${
                  formData.userPreference === 'tasks' 
                    ? 'border-yeild-yellow bg-yeild-yellow/10 text-yeild-yellow' 
                    : 'border-gray-600 text-white hover:border-gray-500'
                }`}
              >
                <div className="font-semibold text-xl mb-2">Tasks</div>
                <div className="text-sm text-gray-400">Complete surveys, reviews, and more</div>
              </button>
              
              <button
                onClick={() => setFormData({...formData, userPreference: 'referrals'})}
                className={`w-full p-6 rounded-lg border-2 transition-all ${
                  formData.userPreference === 'referrals' 
                    ? 'border-yeild-yellow bg-yeild-yellow/10 text-yeild-yellow' 
                    : 'border-gray-600 text-white hover:border-gray-500'
                }`}
              >
                <div className="font-semibold text-xl mb-2">Referrals</div>
                <div className="text-sm text-gray-400">Invite friends and earn rewards</div>
              </button>
              
              <button
                onClick={() => setFormData({...formData, userPreference: 'both'})}
                className={`w-full p-6 rounded-lg border-2 transition-all ${
                  formData.userPreference === 'both' 
                    ? 'border-yeild-yellow bg-yeild-yellow/10 text-yeild-yellow' 
                    : 'border-gray-600 text-white hover:border-gray-500'
                }`}
              >
                <div className="font-semibold text-xl mb-2">Both</div>
                <div className="text-sm text-gray-400">I want to do everything!</div>
              </button>
            </div>
            
            <Button 
              onClick={handleEmailAuth}
              disabled={!formData.userPreference || isLoading}
              className="w-full bg-yeild-yellow text-black hover:bg-yeild-yellow/90 py-6 text-lg font-bold rounded-lg disabled:opacity-50"
            >
              {isLoading ? "Creating Account..." : "Continue"}
            </Button>
          </motion.div>
        );

      case 'confirmation':
        return (
          <motion.div 
            key="confirmation"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8 text-center"
          >
            <div className="space-y-6">
              <div className="w-20 h-20 mx-auto bg-yeild-yellow rounded-full flex items-center justify-center">
                <Mail className="w-10 h-10 text-black" />
              </div>
              <h2 className="text-3xl font-bold">Check Your Email</h2>
              <p className="text-gray-300">
                We've sent a confirmation link to<br />
                <span className="text-yeild-yellow">{formData.email}</span>
              </p>
            </div>
            
            <div className="space-y-4">
              <Button 
                onClick={handleNext}
                className="w-full bg-yeild-yellow text-black hover:bg-yeild-yellow/90 py-6 text-lg font-bold rounded-lg"
              >
                I've Confirmed My Email
              </Button>
              
              <Button 
                onClick={() => toast.info("Resend feature coming soon!")}
                variant="outline"
                className="w-full border-gray-600 text-white hover:bg-gray-800 py-6 text-lg rounded-lg"
              >
                Resend Email
              </Button>
            </div>
          </motion.div>
        );

      case 'achievement':
        return (
          <motion.div 
            key="achievement"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8 text-center"
          >
            <div className="space-y-6">
              <div className="text-8xl mb-4">🎉</div>
              <h1 className="text-3xl font-bold">You're now a</h1>
              <div className="text-6xl font-bold text-yeild-yellow">
                BRONZE
              </div>
              <div className="text-3xl font-bold">
                YEILDER
              </div>
            </div>
            
            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-orange-400 to-yellow-600 rounded-full flex items-center justify-center">
              <span className="text-5xl">🕊️</span>
            </div>
            
            <div className="space-y-4">
              <Button 
                onClick={() => window.open('https://youtube.com/watch?v=YOUR_VIDEO_ID', '_blank')}
                className="w-full bg-red-600 text-white hover:bg-red-700 py-6 text-lg font-bold rounded-lg flex items-center justify-center gap-3"
              >
                <Play className="w-5 h-5" />
                Watch: Intro to YEILD
              </Button>
              
              <Button 
                onClick={handleNext}
                className="w-full bg-yeild-yellow text-black hover:bg-yeild-yellow/90 py-6 text-lg font-bold rounded-lg"
              >
                Continue
              </Button>
            </div>
          </motion.div>
        );

      case 'community':
        return (
          <motion.div 
            key="community"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8 text-center"
          >
            <div className="space-y-4">
              <h2 className="text-3xl font-bold">
                Join <span className="text-yeild-yellow">YEILDER</span> Community?
              </h2>
              <p className="text-gray-300">Connect with other earners and get exclusive updates</p>
            </div>
            
            <div className="space-y-4">
              <Button 
                onClick={() => window.open('https://wa.me/your-whatsapp-link', '_blank')}
                className="w-full bg-green-600 text-white hover:bg-green-700 py-6 text-lg font-bold rounded-lg flex items-center justify-center gap-3"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
                WhatsApp
              </Button>
              
              <Button 
                onClick={() => window.open('https://t.me/your-telegram-link', '_blank')}
                className="w-full bg-blue-500 text-white hover:bg-blue-600 py-6 text-lg font-bold rounded-lg flex items-center justify-center gap-3"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
                Telegram
              </Button>
              
              <Button 
                onClick={handleNext}
                variant="outline"
                className="w-full border-gray-600 text-white hover:bg-gray-800 py-6 text-lg rounded-lg"
              >
                Skip for Now
              </Button>
            </div>
          </motion.div>
        );

      case 'complete':
        return (
          <motion.div 
            key="complete"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8 text-center"
          >
            <div className="space-y-6">
              <div className="text-6xl mb-4">🎊</div>
              <h1 className="text-4xl font-bold">
                Welcome, <span className="text-yeild-yellow">{formData.username || formData.name}!</span>
              </h1>
              <p className="text-xl text-gray-300">
                Your YEILD journey begins now
              </p>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-lg">
              <p className="text-yeild-yellow font-semibold mb-2">💡 Pro Tip</p>
              <p className="text-gray-300">Complete your profile to unlock better tasks and higher rewards!</p>
            </div>
            
            <Button 
              onClick={() => navigate('/dashboard')}
              className="w-full bg-yeild-yellow text-black hover:bg-yeild-yellow/90 py-6 text-lg font-bold rounded-lg"
            >
              Start Earning
            </Button>
          </motion.div>
        );

      // Sign-in only steps
      case 'email':
        return (
          <motion.div 
            key="email"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="space-y-2 text-center">
              <h2 className="text-3xl font-bold">What's your email?</h2>
            </div>
            
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="email"
                placeholder="Email address"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full bg-black border-gray-600 text-white pl-10 py-6 text-lg rounded-lg focus:border-yeild-yellow focus:ring-yeild-yellow"
                autoFocus
              />
            </div>
            
            <Button 
              onClick={handleNext}
              disabled={!formData.email}
              className="w-full bg-yeild-yellow text-black hover:bg-yeild-yellow/90 py-6 text-lg font-bold rounded-lg disabled:opacity-50"
            >
              Next
            </Button>
          </motion.div>
        );

      case 'password':
        return (
          <motion.div 
            key="password"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="space-y-2 text-center">
              <h2 className="text-3xl font-bold">Enter your password</h2>
            </div>
            
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full bg-black border-gray-600 text-white pl-10 pr-12 py-6 text-lg rounded-lg focus:border-yeild-yellow focus:ring-yeild-yellow"
                autoFocus
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
              onClick={handleSignIn}
              disabled={!formData.password || isLoading}
              className="w-full bg-yeild-yellow text-black hover:bg-yeild-yellow/90 py-6 text-lg font-bold rounded-lg disabled:opacity-50"
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>
          </motion.div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  const totalSteps = isSignUp ? 8 : 3;
  const currentStepNumber = currentStep + 1;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="p-6 flex items-center justify-between">
        <Button
          onClick={handleBack}
          variant="ghost"
          className="text-white hover:bg-gray-800 p-2 rounded-full"
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>
        
        <div className="text-center">
          <span className="text-yeild-yellow text-xl font-bold">YEILD</span>
        </div>
        
        <div className="w-10"></div>
      </div>

      {/* Progress Bar */}
      <div className="px-6 mb-8">
        <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
          <span>Step {currentStepNumber} of {totalSteps}</span>
          <span>{Math.round((currentStepNumber / totalSteps) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-yeild-yellow to-yellow-400 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(currentStepNumber / totalSteps) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            {getStepContent()}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ProgressiveAuth;
