import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Bell, ChevronDown, CreditCard, LogOut, Plus, Settings, User, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { BrandWalletFundingDialog } from './BrandWalletFundingDialog';

interface BrandDashboardHeaderProps {
  profile?: any;
  wallet?: any;
  onRefreshWallet: () => void;
  onCreateCampaign: () => void;
}

export const BrandDashboardHeader: React.FC<BrandDashboardHeaderProps> = ({
  profile,
  wallet,
  onRefreshWallet,
  onCreateCampaign
}) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isFundingDialogOpen, setIsFundingDialogOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Error signing out');
    }
  };

  const handleFundingComplete = () => {
    onRefreshWallet();
    toast.success('Wallet refreshed');
  };

  return (
    <>
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Brand Info */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={profile?.logo_url} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {profile?.company_name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-xl font-bold text-foreground">
                    {profile?.company_name || 'Brand Dashboard'}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {profile?.industry || 'Manage your campaigns'}
                  </p>
                </div>
              </div>
            </div>

            {/* Center: Wallet Balance */}
            <div className="flex items-center gap-6">
              <div className="bg-muted/50 rounded-lg px-4 py-2 flex items-center gap-3">
                <Wallet className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Wallet Balance</p>
                  <p className="text-lg font-bold text-foreground">
                    ${wallet?.balance?.toLocaleString() || '10'}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsFundingDialogOpen(true)}
                  className="ml-2"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Funds
                </Button>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
              <Button
                onClick={onCreateCampaign}
                className="bg-primary hover:bg-primary/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Campaign
              </Button>

              <Button variant="outline" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 text-xs p-0 flex items-center justify-center">
                  3
                </Badge>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={user?.user_metadata?.avatar_url} />
                      <AvatarFallback className="text-xs">
                        {user?.email?.charAt(0)?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden md:inline text-sm">
                      {user?.email?.split('@')[0]}
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsFundingDialogOpen(true)}>
                    <CreditCard className="mr-2 h-4 w-4" />
                    <span>Wallet & Billing</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Account Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleSignOut}
                    className="text-destructive focus:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <BrandWalletFundingDialog
        open={isFundingDialogOpen}
        onOpenChange={setIsFundingDialogOpen}
        onFundingComplete={handleFundingComplete}
      />
    </>
  );
};