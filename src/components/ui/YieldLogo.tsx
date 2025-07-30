import React from 'react';

interface YieldLogoProps {
  className?: string;
  size?: number;
}

export const YieldLogo: React.FC<YieldLogoProps> = ({ className = "", size = 32 }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Circle background */}
      <circle
        cx="50"
        cy="50"
        r="45"
        fill="hsl(var(--primary))"
        stroke="hsl(var(--primary-foreground))"
        strokeWidth="2"
      />
      
      {/* Y letter */}
      <path
        d="M30 35 L50 55 L70 35 M50 55 L50 75"
        stroke="hsl(var(--primary-foreground))"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
};