
import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SidebarProvider } from '@/components/ui/sidebar';
import { BrandSidebar } from '@/components/brand/dashboard/BrandSidebar';
import { ProfessionalDashboardOverview } from '@/components/brand/dashboard/ProfessionalDashboardOverview';
import { BrandSettings } from '@/components/brand/dashboard/BrandSettings';
import { CreateCampaignDialog } from '@/components/brand/CreateCampaignDialog';
import { BrandWalletFundingDialog } from '@/components/brand/BrandWalletFundingDialog';
import { BrandCampaignManager } from '@/components/brand/dashboard/BrandCampaignManager';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, LogOut } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { NotificationCenter } from '@/components/dashboard/NotificationCenter';
import { toast } from 'sonner';

const BrandDashboard = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isFundingDialogOpen, setIsFundingDialogOpen] = useState(false);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const navigate = useNavigate();

  const { data: profile } = useQuery({
    queryKey: ['brand-profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('brand_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: wallet, refetch: refetchWallet } = useQuery({
    queryKey: ['brand-wallet'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('brand_wallets')
        .select('*')
        .eq('brand_id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const handleCreateCampaign = () => {
    setIsCreateDialogOpen(true);
  };

  const handleAddFunds = () => {
    setIsFundingDialogOpen(true);
  };

  const handleFundingComplete = () => {
    refetchWallet();
    toast.success('Wallet refreshed');
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success('Signed out successfully');
      navigate('/auth');
    } catch (error: any) {
      console.error('Error signing out:', error);
      toast.error('Error signing out: ' + error.message);
    }
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <BrandSidebar profile={profile} wallet={wallet} />
        
        <main className="flex-1 overflow-auto">
          {/* Header with Sign Out Button */}
          <header className="border-b bg-card shadow-sm">
            <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold text-warning glow-text">YEILD</h1>
                <span className="text-muted-foreground">Brand Dashboard</span>
              </div>
              
              <div className="flex items-center gap-4">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                      <Bell className="h-5 w-5" />
                      {unreadNotificationCount > 0 && (
                        <Badge 
                          variant="destructive" 
                          className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500 text-white"
                        >
                          {unreadNotificationCount}
                        </Badge>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-0" align="end">
                    <NotificationCenter onUnreadCountChange={setUnreadNotificationCount} />
                  </PopoverContent>
                </Popover>
                
                <Button 
                  onClick={handleSignOut}
                  variant="destructive" 
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </div>
          </header>
          
          <div className="container mx-auto p-4 sm:p-6 max-w-7xl">
            <Routes>
              <Route
                path="/"
                element={
                  <ProfessionalDashboardOverview
                    profile={profile}
                    wallet={wallet}
                    onCreateCampaign={handleCreateCampaign}
                    onAddFunds={handleAddFunds}
                  />
                }
              />
              <Route
                path="/campaigns"
                element={<BrandCampaignManager />}
              />
              <Route
                path="/audience"
                element={
                  <div className="text-center py-12">
                    <h2 className="text-2xl font-bold text-foreground mb-4">Audience Insights</h2>
                    <p className="text-muted-foreground">Coming soon...</p>
                  </div>
                }
              />
              <Route
                path="/creative"
                element={
                  <div className="text-center py-12">
                    <h2 className="text-2xl font-bold text-foreground mb-4">Creative Studio</h2>
                    <p className="text-muted-foreground">Coming soon...</p>
                  </div>
                }
              />
              <Route
                path="/finance"
                element={
                  <div className="text-center py-12">
                    <h2 className="text-2xl font-bold text-foreground mb-4">Financial Hub</h2>
                    <p className="text-muted-foreground">Coming soon...</p>
                  </div>
                }
              />
              <Route
                path="/analytics"
                element={
                  <div className="text-center py-12">
                    <h2 className="text-2xl font-bold text-foreground mb-4">Analytics</h2>
                    <p className="text-muted-foreground">Coming soon...</p>
                  </div>
                }
              />
              <Route
                path="/support"
                element={
                  <div className="text-center py-12">
                    <h2 className="text-2xl font-bold text-foreground mb-4">Help & Support</h2>
                    <p className="text-muted-foreground">Coming soon...</p>
                  </div>
                }
              />
              <Route
                path="/settings"
                element={<BrandSettings profile={profile} />}
              />
            </Routes>
          </div>
        </main>
      </div>
      
      <CreateCampaignDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
      />
      
      <BrandWalletFundingDialog
        open={isFundingDialogOpen}
        onOpenChange={setIsFundingDialogOpen}
        onFundingComplete={handleFundingComplete}
      />
    </SidebarProvider>
  );
};

export default BrandDashboard;
