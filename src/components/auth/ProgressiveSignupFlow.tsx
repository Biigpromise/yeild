
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface ProgressiveSignupFlowProps {
  userType: 'user' | 'brand';
  onBack: () => void;
  onSwitchToSignin: () => void;
}

const ProgressiveSignupFlow: React.FC<ProgressiveSignupFlowProps> = ({ userType, onBack, onSwitchToSignin }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });

  const { signUp, signInWithProvider } = useAuth();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password || !formData.name) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setIsLoading(true);
      console.log('Attempting sign up with:', { email: formData.email, userType });
      
      const { error } = await signUp(formData.email, formData.password, formData.name, userType);
      if (error) {
        console.error('Sign up error:', error);
        toast.error(error.message || 'An error occurred during sign up');
      } else {
        console.log('Sign up successful');
        toast.success('Account created successfully! Please check your email to verify your account.');
      }
    } catch (error: any) {
      console.error('Unexpected sign up error:', error);
      toast.error(error.message || 'An unexpected error occurred during sign up');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      setIsLoading(true);
      console.log('Attempting Google sign up for user type:', userType);
      
      const { error } = await signInWithProvider('google', userType);
      if (error) {
        console.error('Google sign up error:', error);
        // Error toast is already shown in the signInWithProvider function
      } else {
        console.log('Google sign up initiated successfully');
      }
    } catch (error: any) {
      console.error('Unexpected Google sign up error:', error);
      toast.error('An unexpected error occurred with Google sign up');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="flex items-center justify-between p-6">
        <button onClick={onBack} className="text-foreground">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex items-center justify-center">
          <img src="/lovable-uploads/c0942c4f-38c3-4a43-9d01-3f429f5860ee.png" alt="YIELD" className="h-8" />
        </div>
        <div className="w-6"></div>
      </div>

      {/* Content */}
      <div className="px-6 pb-6 max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Create your account</h1>
            <p className="text-muted-foreground">
              {userType === 'brand' ? 'Join as a brand partner' : 'Join the community'}
            </p>
          </div>

          <div className="space-y-6">
            {userType === 'user' && (
              <>
                <Button
                  onClick={handleGoogleSignUp}
                  disabled={isLoading}
                  className="w-full bg-muted hover:bg-muted/80 text-foreground py-4 rounded-2xl flex items-center justify-center gap-3"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  {isLoading ? 'Connecting...' : 'Continue with Google'}
                </Button>
                
                <div className="flex items-center justify-center">
                  <div className="flex-1 h-px bg-border"></div>
                  <span className="px-4 text-sm text-muted-foreground">or</span>
                  <div className="flex-1 h-px bg-border"></div>
                </div>
              </>
            )}

            <form onSubmit={handleSignUp} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  {userType === 'brand' ? 'Company Name' : 'Full Name'}
                </label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full py-4 px-4 bg-transparent border-b border-muted-foreground/30 rounded-none focus:border-primary focus:ring-0 text-lg"
                  placeholder=""
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full py-4 px-4 bg-transparent border-b border-muted-foreground/30 rounded-none focus:border-primary focus:ring-0 text-lg"
                  placeholder=""
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full py-4 px-4 pr-12 bg-transparent border-b border-muted-foreground/30 rounded-none focus:border-primary focus:ring-0 text-lg"
                    placeholder=""
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-foreground hover:bg-foreground/90 text-background py-4 rounded-full text-lg font-semibold"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                    Creating account...
                  </div>
                ) : (
                  'Create account'
                )}
              </Button>
            </form>

            <div className="text-center">
              <p className="text-muted-foreground">
                Already have an account?{' '}
                <button onClick={onSwitchToSignin} className="text-primary font-medium">
                  Sign in
                </button>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProgressiveSignupFlow;
