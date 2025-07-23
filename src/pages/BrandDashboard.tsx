
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { BrandWalletCard } from '@/components/brand/BrandWalletCard';
import { CampaignManager } from '@/components/brand/CampaignManager';
import { Plus, Building, Megaphone, DollarSign, BarChart3 } from 'lucide-react';

const BrandDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isBrand, setIsBrand] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [brandProfile, setBrandProfile] = useState<any>(null);

  useEffect(() => {
    checkBrandAccess();
  }, [user]);

  const checkBrandAccess = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'brand')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking brand access:', error);
        toast.error('Error checking brand access');
        setIsBrand(false);
      } else {
        setIsBrand(!!data);
        if (data) {
          loadBrandProfile();
        } else {
          toast.error('Access denied. Brand privileges required.');
          navigate('/dashboard');
        }
      }
    } catch (error) {
      console.error('Error checking brand access:', error);
      setIsBrand(false);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const loadBrandProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('brand_profiles')
        .select('*')
        .eq('user_id', user!.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading brand profile:', error);
      } else {
        setBrandProfile(data);
      }
    } catch (error) {
      console.error('Error loading brand profile:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isBrand) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              You don't have brand privileges to access this page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Building className="h-8 w-8" />
              Brand Dashboard
            </h1>
            <p className="text-muted-foreground">
              Welcome back, {brandProfile?.company_name || 'Brand'}
            </p>
          </div>
          <Button onClick={() => navigate('/campaigns/create')} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Campaign
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <BrandWalletCard />
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="h-5 w-5" />
                Active Campaigns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">0</div>
              <p className="text-sm text-muted-foreground">Currently running</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Total Reach
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">0</div>
              <p className="text-sm text-muted-foreground">Users reached</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="campaigns" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="wallet">Wallet</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="campaigns" className="mt-6">
            <CampaignManager />
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Campaign analytics will be displayed here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="wallet" className="mt-6">
            <BrandWalletCard />
          </TabsContent>

          <TabsContent value="profile" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Brand Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Brand profile settings will be displayed here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BrandDashboard;
