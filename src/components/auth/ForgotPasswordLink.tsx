
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface ForgotPasswordLinkProps {
  userType?: 'user' | 'brand';
}

export const ForgotPasswordLink: React.FC<ForgotPasswordLinkProps> = ({ userType = 'user' }) => {
  const navigate = useNavigate();

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  return (
    <div className="text-center mt-4">
      <button
        type="button"
        onClick={handleForgotPassword}
        className="text-sm text-muted-foreground hover:text-foreground underline transition-colors"
      >
        Forgot your password?
      </button>
    </div>
  );
};
