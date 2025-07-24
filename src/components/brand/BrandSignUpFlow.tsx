import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Eye, EyeOff, Mail, Lock, User, Building, Globe, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const BrandSignUpFlow = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    company_name: '',
    website: '',
    industry: ''
  });

  const { signIn, signUp, user, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect if user is already logged in
  React.useEffect(() => {
    if (!loading && user) {
      navigate('/brand-dashboard');
    }
  }, [user, loading, navigate]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!isLogin && (!formData.name || !formData.company_name)) {
      toast.error("Please enter your name and company name");
      return;
    }

    setIsLoading(true);
    
    try {
      if (isLogin) {
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          toast.error(error.message);
        } else {
          toast.success("Welcome back!");
          navigate('/brand-dashboard');
        }
      } else {
        // Brand signup with additional metadata
        const signUpData = {
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              name: formData.name,
              user_type: 'brand',
              company_name: formData.company_name,
              website: formData.website,
              industry: formData.industry
            }
          }
        };

        const { error } = await signUp(signUpData.email, signUpData.password, signUpData.options.data.name);
        if (error) {
          toast.error(error.message);
        } else {
          toast.success("Brand account created successfully!");
          navigate('/brand-dashboard');
        }
      }
    } catch (error: any) {
      toast.error("An unexpected error occurred");
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
          <h1 className="text-5xl font-bold mb-6">Brand Portal</h1>
          <div className="space-y-4 text-left max-w-md">
            {[
              "Connect with talented creators",
              "Launch impactful campaigns",
              "Track performance metrics",
              "Grow your brand reach"
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
            <h2 className="text-2xl font-bold">Brand Portal</h2>
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
                {isLogin ? 'Brand Sign In' : 'Create Brand Account'}
              </h1>

              {/* Email Form */}
              <form onSubmit={handleEmailAuth} className="space-y-4">
                {!isLogin && (
                  <>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        type="text"
                        placeholder="Your full name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full bg-black border-gray-600 text-white pl-10 py-6 text-lg rounded-lg focus:border-yeild-yellow focus:ring-yeild-yellow"
                      />
                    </div>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        type="text"
                        placeholder="Company name"
                        value={formData.company_name}
                        onChange={(e) => handleInputChange('company_name', e.target.value)}
                        className="w-full bg-black border-gray-600 text-white pl-10 py-6 text-lg rounded-lg focus:border-yeild-yellow focus:ring-yeild-yellow"
                      />
                    </div>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        type="url"
                        placeholder="Website (optional)"
                        value={formData.website}
                        onChange={(e) => handleInputChange('website', e.target.value)}
                        className="w-full bg-black border-gray-600 text-white pl-10 py-6 text-lg rounded-lg focus:border-yeild-yellow focus:ring-yeild-yellow"
                      />
                    </div>
                  </>
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
                  {isLoading ? "Please wait..." : (isLogin ? "Sign in" : "Create Brand Account")}
                </Button>
              </form>

              {/* Forgot Password Link */}
              {isLogin && (
                <div className="text-center mt-4">
                  <button
                    onClick={() => navigate('/forgot-password')}
                    className="text-yeild-yellow hover:text-yeild-yellow/80 text-sm"
                  >
                    Forgot your password?
                  </button>
                </div>
              )}

              {/* Switch between login/signup */}
              <div className="text-center mt-8">
                <span className="text-gray-400">
                  {isLogin ? "Don't have a brand account? " : "Already have an account? "}
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

export default BrandSignUpFlow;