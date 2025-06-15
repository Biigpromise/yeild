
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, MailCheck } from "lucide-react";
import { useSignUp } from '@/hooks/useSignUp';
import PasswordStrengthMeter from "@/components/ui/PasswordStrengthMeter";

const SignUpForm = () => {
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
    resendConfirmation,
    resending,
    resendDone,
    setAwaitingConfirmation,
  } = useSignUp();

  const navigate = useNavigate();

  if (awaitingConfirmation) {
    // Confirmation Screen after sign up
    return (
      <div className="text-center flex flex-col items-center p-6">
        <MailCheck className="mx-auto h-12 w-12 text-yeild-yellow mb-2" />
        <h2 className="text-xl font-bold mb-2">Confirm Your Email</h2>
        <p className="text-gray-300 mb-3">
          We&apos;ve sent a confirmation email to:
        </p>
        <div className="font-semibold text-gray-100 mb-3">{email}</div>
        <p className="text-gray-400 mb-4">
          Please check your inbox and click the confirmation link. You can close this tab and finish later.
        </p>
        <Button
          disabled={resending}
          className="w-full mb-2"
          variant="outline"
          onClick={resendConfirmation}
        >
          {resending ? "Resending..." : "Resend Confirmation Email"}
        </Button>
        {resendDone ? (
          <div className="text-green-400 text-sm mt-1">
            Confirmation email resent! Check your inbox.
          </div>
        ) : null}
        <div className="mt-4 text-gray-400 text-sm">
          Didn&apos;t get the email? Check your spam or promotions folder. If you still can&apos;t find it, click <b>Resend</b> above.
        </div>
        <Button
          variant="ghost"
          className="w-full mt-6 text-gray-400 hover:text-white"
          onClick={() => {
            setAwaitingConfirmation(false);
          }}
        >
          &larr; Back to Sign Up
        </Button>
        <div className="mt-4 text-center">
          <p className="text-gray-400">
            Already confirmed?{" "}
            <span
              role="button"
              className="text-yeild-yellow hover:underline cursor-pointer ml-1"
              onClick={() => navigate("/login")}
            >
              Log in
            </span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSignUp} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="yeild-input"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="yeild-input"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Create a password (min 8 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="yeild-input pr-10"
            minLength={8}
            required
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-gray-400" />
            ) : (
              <Eye className="h-4 w-4 text-gray-400" />
            )}
          </button>
        </div>
        <PasswordStrengthMeter password={password} />
      </div>
      
      <div className="flex items-start space-x-3 mt-4 p-3 border border-gray-700 rounded-lg bg-gray-900/50">
        <Checkbox 
          id="terms" 
          checked={agreeTerms}
          onCheckedChange={(checked) => setAgreeTerms(checked === true)}
          className="mt-1 flex-shrink-0"
        />
        <div className="flex-1">
          <Label
            htmlFor="terms"
            className="text-sm text-gray-300 cursor-pointer leading-relaxed"
          >
            I agree to the{" "}
            <Link 
              to="/terms" 
              className="text-yeild-yellow hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Terms of Service
            </Link>
            {" "}and{" "}
            <Link 
              to="/privacy" 
              className="text-yeild-yellow hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Privacy Policy
            </Link>
          </Label>
        </div>
      </div>
      {signUpError && (
        <div className="text-red-400 text-sm mt-1">{signUpError}</div>
      )}
      <Button 
        type="submit" 
        className="w-full yeild-btn-primary mt-6" 
        disabled={isLoading}
      >
        {isLoading ? "Creating Account..." : "Create Account"}
      </Button>
    </form>
  );
};

export default SignUpForm;
