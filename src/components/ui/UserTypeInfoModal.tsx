import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { User, Building2 } from 'lucide-react';

interface UserTypeInfoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userType: 'user' | 'brand' | null;
  onContinue: () => void;
}

export const UserTypeInfoModal: React.FC<UserTypeInfoModalProps> = ({
  open,
  onOpenChange,
  userType,
  onContinue
}) => {
  const getUserTypeInfo = () => {
    if (userType === 'user') {
      return {
        title: "You're signing up as a User",
        icon: <User className="w-12 h-12 text-yeild-yellow" />,
        description: "As a user, you'll be able to:",
        features: [
          "Connect and collaborate with brands",
          "Participate in exciting campaigns",
          "Earn rewards and incentives",
          "Build your personal brand",
          "Access exclusive opportunities"
        ]
      };
    } else {
      return {
        title: "You're signing up as a Brand",
        icon: <Building2 className="w-12 h-12 text-yeild-yellow" />,
        description: "As a brand, you'll be able to:",
        features: [
          "Find and collaborate with creators",
          "Launch targeted campaigns",
          "Promote your products/services",
          "Track campaign performance",
          "Build authentic partnerships"
        ]
      };
    }
  };

  const info = getUserTypeInfo();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-yeild-black border-yeild-yellow/30 text-white">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold text-white">
            {info.title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 p-2">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="p-4 bg-yeild-yellow/10 rounded-full border border-yeild-yellow/30">
              {info.icon}
            </div>
          </div>

          {/* Description */}
          <div className="text-center">
            <p className="text-gray-300 mb-4">{info.description}</p>
            
            {/* Features */}
            <ul className="space-y-2 text-left text-sm text-gray-400">
              {info.features.map((feature, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-yeild-yellow rounded-full flex-shrink-0"></div>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Continue Button */}
          <Button 
            onClick={onContinue}
            className="w-full h-12 text-lg font-semibold bg-yeild-yellow text-yeild-black hover:bg-yeild-yellow/90 rounded-xl transition-all duration-300"
          >
            Continue as {userType === 'user' ? 'User' : 'Brand'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};