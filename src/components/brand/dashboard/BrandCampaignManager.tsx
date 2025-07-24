import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BrandCampaignActions } from '@/components/brand/BrandCampaignActions';
import { 
  Search, 
  Filter, 
  Plus, 
  Target, 
  DollarSign, 
  Calendar, 
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
  Pause,
  Play
} from 'lucide-react';
import { CreateCampaignDialog } from '@/components/brand/CreateCampaignDialog';
import { BrandWalletFundingDialog } from '@/components/brand/BrandWalletFundingDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

export const BrandCampaignManager: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isFundingDialogOpen, setIsFundingDialogOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);

  const { data: campaigns = [], isLoading, refetch } = useQuery({
    queryKey: ['brand-campaigns-manager'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      console.log('Fetching campaigns for user:', user.id);

      const { data, error } = await supabase
        .from('brand_campaigns')
        .select('*')
        .eq('brand_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching campaigns:', error);
        throw error;
      }
      
      console.log('Fetched campaigns:', data);
      return data || [];
    },
    enabled: true,
    refetchOnWindowFocus: true
  });

  const { data: wallet } = useQuery({
    queryKey: ['brand-wallet-manager'],
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

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (campaign.description && campaign.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-brand-success text-white';
      case 'completed': return 'bg-primary text-primary-foreground';
      case 'draft': return 'bg-muted text-muted-foreground';
      case 'paused': return 'bg-brand-warning text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getApprovalStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-brand-success text-white';
      case 'rejected': return 'bg-brand-danger text-white';
      default: return 'bg-brand-warning text-white';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Play className="h-3 w-3" />;
      case 'paused': return <Pause className="h-3 w-3" />;
      case 'completed': return <CheckCircle className="h-3 w-3" />;
      case 'draft': return <Clock className="h-3 w-3" />;
      default: return <AlertCircle className="h-3 w-3" />;
    }
  };

  const handleTopUpCampaign = (campaign: any) => {
    setSelectedCampaign(campaign);
    setIsFundingDialogOpen(true);
  };

  const handlePauseCampaign = async (campaignId: string) => {
    try {
      const { error } = await supabase
        .from('brand_campaigns')
        .update({ status: 'paused' })
        .eq('id', campaignId);

      if (error) throw error;
      toast.success('Campaign paused successfully');
      refetch();
    } catch (error: any) {
      toast.error('Failed to pause campaign: ' + error.message);
    }
  };

  const handleResumeCampaign = async (campaignId: string) => {
    try {
      // Check wallet balance first
      if (!wallet || wallet.balance < 10000) {
        toast.error('Insufficient wallet balance. Please add funds to resume campaign.');
        return;
      }

      const { error } = await supabase
        .from('brand_campaigns')
        .update({ status: 'active' })
        .eq('id', campaignId);

      if (error) throw error;
      toast.success('Campaign resumed successfully');
      refetch();
    } catch (error: any) {
      toast.error('Failed to resume campaign: ' + error.message);
    }
  };

  const stats = {
    total: campaigns.length,
    active: campaigns.filter(c => c.status === 'active').length,
    paused: campaigns.filter(c => c.status === 'paused').length,
    draft: campaigns.filter(c => c.status === 'draft').length,
    totalBudget: campaigns.reduce((sum, c) => sum + c.budget, 0),
    totalSpent: campaigns.reduce((sum, c) => sum + (c.funded_amount || 0), 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Campaign Manager</h1>
          <p className="text-muted-foreground">
            Manage and monitor all your marketing campaigns
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => setIsFundingDialogOpen(true)} variant="outline" className="gap-2">
            <DollarSign className="w-4 h-4" />
            Add Funds
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            New Campaign
          </Button>
        </div>
      </div>

      {/* Campaign Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Campaigns</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Target className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-brand-success">{stats.active}</p>
              </div>
              <Play className="h-8 w-8 text-brand-success" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Budget</p>
                <p className="text-2xl font-bold">₦{stats.totalBudget.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Wallet Balance</p>
                <p className="text-2xl font-bold">₦{wallet?.balance?.toLocaleString() || "0.00"}</p>
              </div>
              <DollarSign className="h-8 w-8 text-brand-success" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search campaigns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Campaigns List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-muted rounded w-1/4 mb-4"></div>
                  <div className="h-3 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No campaigns found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Create your first campaign to get started'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Campaign
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredCampaigns.map((campaign) => (
            <Card key={campaign.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-xl">{campaign.title}</CardTitle>
                      <Badge className={`${getStatusColor(campaign.status)} flex items-center gap-1`}>
                        {getStatusIcon(campaign.status)}
                        {campaign.status}
                      </Badge>
                      <Badge className={getApprovalStatusColor(campaign.admin_approval_status || 'pending')}>
                        {campaign.admin_approval_status || 'pending'}
                      </Badge>
                    </div>
                    
                    {campaign.admin_approval_status === 'rejected' && campaign.rejection_reason && (
                      <div className="flex items-center gap-2 text-brand-danger bg-brand-danger/10 px-3 py-2 rounded-lg">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">Rejected:</span>
                        <span className="text-sm">{campaign.rejection_reason}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* Campaign Management Actions */}
                    {campaign.status === 'active' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePauseCampaign(campaign.id)}
                      >
                        <Pause className="h-4 w-4 mr-1" />
                        Pause
                      </Button>
                    )}
                    
                    {campaign.status === 'paused' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleResumeCampaign(campaign.id)}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Resume
                      </Button>
                    )}
                    
                    {(campaign.funded_amount || 0) < campaign.budget * 0.9 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleTopUpCampaign(campaign)}
                      >
                        <DollarSign className="h-4 w-4 mr-1" />
                        Top Up
                      </Button>
                    )}
                    
                    <BrandCampaignActions 
                      campaign={campaign} 
                      onUpdate={() => refetch()} 
                    />
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-brand-success" />
                    <div>
                      <span className="text-sm font-medium">Budget: ₦{campaign.budget.toLocaleString()}</span>
                      <div className="text-xs text-muted-foreground">
                        Funded: ₦{(campaign.funded_amount || 0).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <div>
                      <span className="text-sm">Created: {new Date(campaign.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-brand-warning" />
                    <div>
                      <span className="text-sm">
                        {campaign.start_date 
                          ? `Starts: ${new Date(campaign.start_date).toLocaleDateString()}`
                          : 'No start date'
                        }
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <span className="text-sm">Performance: Coming soon</span>
                    </div>
                  </div>
                </div>
                
                {campaign.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {campaign.description}
                  </p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Dialogs */}
      <CreateCampaignDialog
        isOpen={isCreateDialogOpen}
        onClose={() => {
          setIsCreateDialogOpen(false);
          refetch();
        }}
      />
      
      <BrandWalletFundingDialog
        open={isFundingDialogOpen}
        onOpenChange={setIsFundingDialogOpen}
        onFundingComplete={() => {
          refetch();
          toast.success('Wallet updated successfully');
        }}
      />
    </div>
  );
};