
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, MailCheck, ArrowLeft } from "lucide-react";
import { useSignUp } from '@/hooks/useSignUp';
import PasswordStrengthMeter from "@/components/ui/PasswordStrengthMeter";
import { Link } from "react-router-dom";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const MultiStepSignupForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const {
    email, setEmail,
    password, setPassword,
    name, setName,
    agreeTerms, setAgreeTerms,
    showPassword, setShowPassword,
    isLoading,
    handleSignUp,
    awaitingConfirmation,
    signUpError,
    setAwaitingConfirmation,
    confirmationCode,
    setConfirmationCode,
    handleCodeVerification,
    isVerifying
  } = useSignUp();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullName = `${firstName} ${lastName}`.trim();
    setName(fullName);
    await handleSignUp(e);
  };

  if (awaitingConfirmation) {
    return (
      <div className="text-center flex flex-col items-center p-6">
        <MailCheck className="mx-auto h-12 w-12 text-yeild-yellow mb-4" />
        <h2 className="text-2xl font-bold mb-3">Check Your Email</h2>
        <p className="text-gray-300 mb-6">
          We&apos;ve sent a confirmation email to {email}. Please check your inbox and click the confirmation link to activate your account.
        </p>
        
        
        <Button
          variant="ghost"
          className="text-gray-400 hover:text-white"
          onClick={() => setAwaitingConfirmation(false)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Sign Up
        </Button>
      </div>
    );
  }

  const steps = [
    // Step 0: Welcome
    {
      title: "Welcome to YEILD",
      subtitle: "Join thousands of users making money by completing simple tasks",
      content: (
        <div className="text-center space-y-6">
          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-yeild-yellow">Welcome to YEILD</h1>
            <p className="text-gray-300 text-lg">
              Join thousands of users making money by completing simple tasks from your phone or computer.
            </p>
          </div>
          <Button 
            className="w-full yeild-btn-primary text-lg py-6" 
            onClick={() => setCurrentStep(1)}
          >
            Next
          </Button>
        </div>
      )
    },
    // Step 1: Email
    {
      title: "What's your email address?",
      subtitle: "Enter the email address you can be reached at.",
      content: (
        <div className="space-y-6">
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="yeild-input text-lg py-6"
              autoFocus
            />
          </div>
          <Button 
            className="w-full yeild-btn-primary text-lg py-6" 
            onClick={() => setCurrentStep(2)}
            disabled={!email}
          >
            Next
          </Button>
        </div>
      )
    },
    // Step 2: Password
    {
      title: "Create a password",
      subtitle: "Create a password with at least six letters or numbers. It should be something that others can't guess.",
      content: (
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="yeild-input text-lg py-6 pr-12"
                minLength={6}
                autoFocus
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            <PasswordStrengthMeter password={password} />
          </div>
          <Button 
            className="w-full yeild-btn-primary text-lg py-6" 
            onClick={() => setCurrentStep(3)}
            disabled={!password || password.length < 6}
          >
            Next
          </Button>
        </div>
      )
    },
    // Step 3: Name
    {
      title: "What's your name?",
      subtitle: "Enter the name you use in real life.",
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Input
              placeholder="First name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="yeild-input text-lg py-6"
              autoFocus
            />
            <Input
              placeholder="Surname"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="yeild-input text-lg py-6"
            />
          </div>
          <Button 
            className="w-full yeild-btn-primary text-lg py-6" 
            onClick={() => setCurrentStep(4)}
            disabled={!firstName || !lastName}
          >
            Next
          </Button>
        </div>
      )
    },
    // Step 4: Terms and Create Account
    {
      title: "Agree to YEILD's terms and policies",
      subtitle: "By tapping Create Account, you agree to create an account and to YEILD's terms, Privacy Policy and Cookies Policy.",
      content: (
        <div className="space-y-6">
          <div className="text-sm text-gray-300 space-y-3">
            <p>
              People who use our service may have uploaded your contact information to YEILD.{" "}
              <Link to="/privacy" className="text-yeild-yellow hover:underline">
                Learn more
              </Link>
            </p>
            <p>
              By tapping Create Account, you agree to create an account and to YEILD's{" "}
              <Link to="/terms" className="text-yeild-yellow hover:underline">
                terms
              </Link>
              ,{" "}
              <Link to="/privacy" className="text-yeild-yellow hover:underline">
                Privacy Policy
              </Link>
              {" "}and{" "}
              <Link to="/privacy" className="text-yeild-yellow hover:underline">
                Cookies Policy
              </Link>
              .
            </p>
            <p>
              The Privacy Policy describes the ways we can use the information we collect when you create an account. For example, we use this information to provide, personalise and improve our products, including ads.
            </p>
          </div>
          
          <div className="flex items-start space-x-3 p-3 border border-gray-700 rounded-lg bg-gray-900/50">
            <Checkbox 
              id="terms" 
              checked={agreeTerms}
              onCheckedChange={(checked) => setAgreeTerms(checked === true)}
              className="mt-1 flex-shrink-0"
            />
            <Label
              htmlFor="terms"
              className="text-sm text-gray-300 cursor-pointer leading-relaxed"
            >
              I agree to the Terms of Service and Privacy Policy
            </Label>
          </div>
          
          {signUpError && (
            <div className="text-red-400 text-sm">{signUpError}</div>
          )}
          
          <Button 
            className="w-full yeild-btn-primary text-lg py-6" 
            onClick={handleSubmit}
            disabled={isLoading || !agreeTerms}
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </Button>
        </div>
      )
    }
  ];

  const currentStepData = steps[currentStep];

  return (
    <div className="space-y-6">
      {currentStep > 0 && (
        <Button
          variant="ghost"
          className="text-gray-400 hover:text-white p-2"
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
      )}
      
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">{currentStepData.title}</h2>
        <p className="text-gray-400">{currentStepData.subtitle}</p>
      </div>
      
      {currentStepData.content}
      
      {currentStep === 4 && (
        <div className="text-center">
          <Link to="/login" className="text-yeild-yellow hover:underline">
            Find my account
          </Link>
        </div>
      )}
    </div>
  );
};

export default MultiStepSignupForm;
