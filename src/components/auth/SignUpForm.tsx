
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff } from "lucide-react";
import { useSignUp } from '@/hooks/useSignUp';

const SignUpForm = () => {
  const {
    email, setEmail,
    password, setPassword,
    name, setName,
    agreeTerms, setAgreeTerms,
    showPassword, setShowPassword,
    isLoading,
    handleSignUp,
  } = useSignUp();

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
