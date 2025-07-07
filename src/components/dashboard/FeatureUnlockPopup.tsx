import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Lock, CheckSquare, Users } from 'lucide-react';
import { ExperienceTier } from '@/hooks/useExperienceLevel';

interface FeatureUnlockPopupProps {
  isOpen: boolean;
  onClose: () => void;
  nextTier: ExperienceTier | null;
  tasksToNextTier: number;
  referralsToNextTier: number;
  featureName: string;
}

export const FeatureUnlockPopup: React.FC<FeatureUnlockPopupProps> = ({
  isOpen,
  onClose,
  nextTier,
  tasksToNextTier,
  referralsToNextTier,
  featureName
}) => {
  if (!nextTier) return null;

  const getRequirementText = () => {
    const requirements = [];
    
    if (tasksToNextTier > 0) {
      requirements.push(`complete ${tasksToNextTier} task${tasksToNextTier === 1 ? '' : 's'}`);
    }
    
    if (referralsToNextTier > 0) {
      requirements.push(`refer ${referralsToNextTier} people`);
    }
    
    if (requirements.length === 0) return "Complete your current requirements";
    if (requirements.length === 1) return requirements[0];
    return requirements.join(' and ');
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Lock className="h-5 w-5 text-muted-foreground" />
            <AlertDialogTitle>Feature Locked</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-3">
            <p>
              <strong>{featureName}</strong> is currently locked.
            </p>
            
            <div className="space-y-2">
              <p className="text-sm font-medium">
                To unlock <Badge variant="secondary">{nextTier.name}</Badge>:
              </p>
              
              <div className="space-y-2">
                {tasksToNextTier > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <CheckSquare className="h-4 w-4 text-muted-foreground" />
                    <span>Complete {tasksToNextTier} task{tasksToNextTier === 1 ? '' : 's'}</span>
                  </div>
                )}
                
                {referralsToNextTier > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>Refer {referralsToNextTier} people</span>
                  </div>
                )}
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground">
              {nextTier.description}
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter>
          <AlertDialogAction onClick={onClose}>
            Got it!
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};