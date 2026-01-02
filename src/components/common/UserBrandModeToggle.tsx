import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeftRight, Building2, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useModeSwitch } from '@/hooks/useModeSwitch';
import { BrandProfileSetupDialog } from './BrandProfileSetupDialog';
import { UserProfileSetupDialog } from './UserProfileSetupDialog';

interface UserBrandModeToggleProps {
  className?: string;
}

export const UserBrandModeToggle: React.FC<UserBrandModeToggleProps> = ({ className }) => {
  const {
    currentMode,
    hasBrandProfile,
    hasUserProfile,
    loading,
    showBrandSetup,
    showUserSetup,
    setShowBrandSetup,
    setShowUserSetup,
    switchToBrandMode,
    switchToUserMode,
    onBrandProfileCreated,
    onUserProfileCreated,
  } = useModeSwitch();

  if (loading) {
    return null;
  }

  const isUserMode = currentMode === 'user';

  return (
    <>
      <div className={cn("p-3 rounded-lg bg-muted/50 border border-border/60", className)}>
        <div className="flex items-center gap-2 mb-2">
          {isUserMode ? (
            <User className="h-4 w-4 text-primary" />
          ) : (
            <Building2 className="h-4 w-4 text-primary" />
          )}
          <span className="text-xs font-medium text-muted-foreground">
            Currently: {isUserMode ? 'User Mode' : 'Brand Mode'}
          </span>
        </div>
        
        <Button
          onClick={isUserMode ? switchToBrandMode : switchToUserMode}
          variant="outline"
          size="sm"
          className="w-full gap-2 text-xs"
        >
          <ArrowLeftRight className="h-3 w-3" />
          Switch to {isUserMode ? 'Brand' : 'User'} Mode
        </Button>
        
        {isUserMode && !hasBrandProfile && (
          <p className="text-[10px] text-muted-foreground mt-2 text-center">
            Set up your brand profile to run campaigns
          </p>
        )}
        {!isUserMode && !hasUserProfile && (
          <p className="text-[10px] text-muted-foreground mt-2 text-center">
            Set up your user profile to earn from tasks
          </p>
        )}
      </div>

      <BrandProfileSetupDialog
        open={showBrandSetup}
        onOpenChange={setShowBrandSetup}
        onSuccess={onBrandProfileCreated}
      />

      <UserProfileSetupDialog
        open={showUserSetup}
        onOpenChange={setShowUserSetup}
        onSuccess={onUserProfileCreated}
      />
    </>
  );
};
