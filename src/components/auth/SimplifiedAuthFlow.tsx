import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, ArrowRight, Loader2, User, Building2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { YieldLogo } from '@/components/ui/YieldLogo';
import { ForgotPasswordLink } from './ForgotPasswordLink';

interface FormData {
  email: string;
  password: string;
  name: string;
  userType: 'user' | 'brand';
}

// Store user type before OAuth redirect
const OAUTH_USER_TYPE_KEY = 'oauth_pending_user_type';

export const SimplifiedAuthFlow = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    name: '',
    userType: 'user'
  });

  const { signIn, signUp, user, loading, signInWithProvider } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Auto-set user type from URL params or localStorage (for OAuth callback)
  useEffect(() => {
    const typeParam = searchParams.get('type');
    const modeParam = searchParams.get('mode');
    
    // Check localStorage for pending OAuth user type
    const pendingUserType = localStorage.getItem(OAUTH_USER_TYPE_KEY);
    
    if (typeParam === 'brand' || typeParam === 'user') {
      setFormData(prev => ({ ...prev, userType: typeParam as 'user' | 'brand' }));
    } else if (pendingUserType === 'brand' || pendingUserType === 'user') {
      setFormData(prev => ({ ...prev, userType: pendingUserType as 'user' | 'brand' }));
    }
    
    if (modeParam === 'signup') {
      setIsLogin(false);
    }
  }, [searchParams]);

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      // Clear the pending OAuth user type
      localStorage.removeItem(OAUTH_USER_TYPE_KEY);
      
      const userType = user.user_metadata?.user_type;
      navigate(userType === 'brand' ? '/brand-dashboard' : '/dashboard');
    }
  }, [user, loading, navigate]);

  const validateForm = () => {
    if (!formData.email || !formData.email.includes('@')) {
      toast.error('Please enter a valid email');
      return false;
    }
    if (!formData.password || formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return false;
    }
    if (!isLogin && (!formData.name || formData.name.trim().length < 2)) {
      toast.error('Please enter your full name');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      if (isLogin) {
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          console.error('Sign in error:', error);
          if (error.message?.includes('Invalid login credentials')) {
            toast.error('Invalid email or password. Please check your credentials.');
          } else if (error.message?.includes('Email not confirmed')) {
            toast.error('Please check your email and confirm your account before signing in.');
          } else if (error.message?.includes('Too many requests')) {
            toast.error('Too many attempts. Please wait a moment before trying again.');
          } else {
            toast.error(error.message || 'Failed to sign in. Please try again.');
          }
        } else {
          toast.success('Welcome back!');
        }
      } else {
        const { error } = await signUp(formData.email, formData.password, formData.name, formData.userType);
        if (error) {
          console.error('Sign up error:', error);
          if (error.message?.includes('User already registered')) {
            toast.error('An account with this email already exists. Try signing in instead.');
          } else if (error.message?.includes('Password should be at least')) {
            toast.error('Password must be at least 8 characters long.');
          } else if (error.message?.includes('invalid email')) {
            toast.error('Please enter a valid email address.');
          } else if (error.message?.includes('signup disabled')) {
            toast.error('Account creation is temporarily disabled. Please try again later.');
          } else {
            toast.error('Failed to create account. Please try again.');
          }
        } else {
          toast.success('Verification code sent! Redirecting...');
          // Redirect to verification page with email, name, and userType
          navigate(`/verify-signup-code?email=${encodeURIComponent(formData.email)}&name=${encodeURIComponent(formData.name)}&userType=${formData.userType}`);
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    // Store user type in localStorage before OAuth redirect
    localStorage.setItem(OAUTH_USER_TYPE_KEY, formData.userType);
    
    setIsLoading(true);
    try {
      const { error } = await signInWithProvider('google', formData.userType);
      if (error) {
        localStorage.removeItem(OAUTH_USER_TYPE_KEY);
        toast.error('Failed to sign in with Google');
      }
    } catch (error) {
      localStorage.removeItem(OAUTH_USER_TYPE_KEY);
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isBrand = formData.userType === 'brand';

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <YieldLogo size={64} className="mx-auto mb-4" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            {isLogin 
              ? (isBrand ? 'Welcome back, Brand!' : 'Welcome back') 
              : (isBrand ? 'Register as a Brand' : 'Join YEILD')
            }
          </h1>
          <p className="text-muted-foreground mt-2">
            {isLogin 
              ? (isBrand ? 'Sign in to your Brand Dashboard' : 'Sign in to start earning')
              : (isBrand ? 'Create campaigns and reach thousands of users' : 'Complete tasks and earn rewards')
            }
          </p>
        </div>

        {/* User Type Selection - Always visible */}
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-6"
        >
          <p className="text-sm text-center text-muted-foreground mb-3">
            {isLogin ? "I'm signing in as:" : "I want to:"}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, userType: 'user' }))}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                formData.userType === 'user'
                  ? 'border-primary bg-primary/10 shadow-md'
                  : 'border-border hover:border-primary/50 hover:bg-muted/50'
              }`}
            >
              <div className={`p-3 rounded-full ${
                formData.userType === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}>
                <User className="h-5 w-5" />
              </div>
              <div className="text-center">
                <p className={`font-semibold ${formData.userType === 'user' ? 'text-primary' : ''}`}>
                  I'm a User
                </p>
                <p className="text-xs text-muted-foreground">
                  Earn by completing tasks
                </p>
              </div>
            </button>
            
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, userType: 'brand' }))}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                formData.userType === 'brand'
                  ? 'border-primary bg-primary/10 shadow-md'
                  : 'border-border hover:border-primary/50 hover:bg-muted/50'
              }`}
            >
              <div className={`p-3 rounded-full ${
                formData.userType === 'brand' ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}>
                <Building2 className="h-5 w-5" />
              </div>
              <div className="text-center">
                <p className={`font-semibold ${formData.userType === 'brand' ? 'text-primary' : ''}`}>
                  I'm a Brand
                </p>
                <p className="text-xs text-muted-foreground">
                  Create & run campaigns
                </p>
              </div>
            </button>
          </div>
        </motion.div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name field for signup */}
          <AnimatePresence>
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Input
                  type="text"
                  placeholder={isBrand ? "Company / Brand Name" : "Full Name"}
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="h-12 bg-background border-border/60 focus:border-primary"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Email field */}
          <Input
            type="email"
            placeholder={isBrand ? "Business Email" : "Email"}
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="h-12 bg-background border-border/60 focus:border-primary"
            required
          />

          {/* Password field */}
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              className="h-12 bg-background border-border/60 focus:border-primary pr-12"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {isLogin && (
            <div className="flex justify-end">
              <ForgotPasswordLink userType={formData.userType} />
            </div>
          )}
          
          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <div className="flex items-center justify-center gap-2">
                {isLogin 
                  ? (isBrand ? 'Sign In to Brand Dashboard' : 'Sign In') 
                  : (isBrand ? 'Create Brand Account' : 'Create Account')
                }
                <ArrowRight className="h-4 w-4" />
              </div>
            )}
          </Button>

          {!isLogin && (
            <p className="mt-2 text-xs text-muted-foreground text-center">
              You&apos;ll receive a 6-digit verification code to activate your account.
            </p>
          )}
        </form>

        {/* Google Auth */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/60" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>
          
          <Button
            type="button"
            variant="outline"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleGoogleAuth();
            }}
            disabled={isLoading}
            className="w-full h-12 mt-4 border-border/60 hover:border-primary/40 cursor-pointer relative z-10"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google {isBrand ? '(as Brand)' : ''}
          </Button>
          
          {isBrand && (
            <p className="text-xs text-center text-muted-foreground mt-2">
              Make sure "I'm a Brand" is selected above before signing in with Google
            </p>
          )}
        </div>

        {/* Switch Mode */}
        <div className="text-center mt-6">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
