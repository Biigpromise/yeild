import React from "react";
import { Sparkles, BarChart3, ListTodo, Wallet, Trophy, Users, BarChart, HelpCircle } from "lucide-react";

interface OnboardingImageProps {
  step: number;
  altText: string;
  imageUrl?: string;
}

export const OnboardingImage: React.FC<OnboardingImageProps> = ({ 
  step, 
  altText,
  imageUrl 
}) => {
  // If there's a direct image URL provided, use that
  if (imageUrl) {
    return (
      <div className="rounded-lg overflow-hidden border border-gray-800 h-64 bg-gradient-to-b from-black to-zinc-900 flex items-center justify-center">
        <img 
          src={imageUrl} 
          alt={altText}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  // Otherwise, create a stylish placeholder based on the step number
  const iconMap = {
    1: <Sparkles className="h-24 w-24 text-yeild-yellow animate-pulse-subtle" />,
    2: <BarChart3 className="h-24 w-24 text-yeild-yellow animate-pulse-subtle" />,
    3: <ListTodo className="h-24 w-24 text-yeild-yellow animate-pulse-subtle" />,
    4: <Wallet className="h-24 w-24 text-yeild-yellow animate-pulse-subtle" />,
    5: <Trophy className="h-24 w-24 text-yeild-yellow animate-pulse-subtle" />,
    6: <Users className="h-24 w-24 text-yeild-yellow animate-pulse-subtle" />,
    7: <BarChart className="h-24 w-24 text-yeild-yellow animate-pulse-subtle" />,
    8: <Sparkles className="h-24 w-24 text-yeild-yellow animate-pulse-subtle" />,
  };

  const icon = iconMap[step as keyof typeof iconMap] || <HelpCircle className="h-24 w-24 text-yeild-yellow" />;

  return (
    <div className="rounded-lg overflow-hidden border border-gray-800 h-64 bg-gradient-to-b from-black to-zinc-900">
      <div className="w-full h-full flex flex-col items-center justify-center p-4 space-y-4">
        {icon}
        <p className="text-yeild-yellow text-lg font-medium text-center">
          {altText}
        </p>
      </div>
    </div>
  );
};
