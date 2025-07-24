
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CreateCampaignDialog } from '@/components/brand/CreateCampaignDialog';
import { BrandWalletFundingDialog } from '@/components/brand/BrandWalletFundingDialog';
import { ModernBrandDashboard } from '@/components/brand/dashboard/ModernBrandDashboard';
import { toast } from 'sonner';

const BrandDashboard = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isFundingDialogOpen, setIsFundingDialogOpen] = useState(false);

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

  return (
    <>
      <ModernBrandDashboard
        profile={profile}
        wallet={wallet}
        onCreateCampaign={handleCreateCampaign}
        onAddFunds={handleAddFunds}
      />

      <CreateCampaignDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
      />

      <BrandWalletFundingDialog
        open={isFundingDialogOpen}
        onOpenChange={setIsFundingDialogOpen}
        onFundingComplete={handleFundingComplete}
      />
    </>
  );
};

export default BrandDashboard;
