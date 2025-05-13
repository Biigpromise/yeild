
import React from "react";
import { Sparkles, BarChart3, ListTodo, Wallet, Trophy, Users, BarChart, HelpCircle } from "lucide-react";
import { TutorialImageGenerator } from "./tutorial-image-generator";

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
  // If there's a direct image URL provided that's an uploaded image, use that
  if (imageUrl && imageUrl.startsWith("/lovable-uploads/")) {
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
  
  // Map step to section for the tutorial image generator
  const getSectionName = () => {
    switch(step) {
      case 1: return "welcome";
      case 2: return "dashboard";
      case 3: return "tasks";
      case 4: return "wallet";
      case 5: return "leaderboard";
      case 6: return "referrals";
      case 7: return "level-up";
      case 8: return "congrats";
      default: return "welcome";
    }
  };
  
  // Use our dynamic tutorial image generator
  return (
    <div className="rounded-lg overflow-hidden border border-gray-800 h-64 flex items-center justify-center">
      <TutorialImageGenerator section={getSectionName()} />
    </div>
  );
};
