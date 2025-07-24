import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Eye,
  Users,
  Target,
  BarChart3,
  Plus,
  Wallet,
  ArrowUpRight,
  AlertTriangle,
  CheckCircle,
  PlayCircle,
  PauseCircle,
} from "lucide-react";

interface ProfessionalDashboardOverviewProps {
  profile?: any;
  wallet?: any;
  onCreateCampaign: () => void;
  onAddFunds: () => void;
}

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  changeType: "increase" | "decrease";
  icon: any;
  color: "blue" | "green" | "yellow" | "red";
}

const MetricCard = ({ title, value, change, changeType, icon: Icon, color }: MetricCardProps) => {
  const colorClasses = {
    blue: "bg-primary/10 text-primary border-primary/20",
    green: "bg-brand-success/10 text-brand-success border-brand-success/20",
    yellow: "bg-brand-warning/10 text-brand-warning border-brand-warning/20",
    red: "bg-brand-danger/10 text-brand-danger border-brand-danger/20",
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-300 border border-border/50">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            <div className="flex items-center mt-2">
              {changeType === "increase" ? (
                <TrendingUp className="w-4 h-4 text-brand-success mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-brand-danger mr-1" />
              )}
              <span
                className={`text-sm font-medium ${
                  changeType === "increase" ? "text-brand-success" : "text-brand-danger"
                }`}
              >
                {change}
              </span>
            </div>
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface CampaignCardProps {
  id: string;
  name: string;
  status: "active" | "paused" | "draft" | "completed";
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  ctr: number;
  roas: number;
}

const CampaignCard = ({ name, status, budget, spent, impressions, clicks, ctr, roas }: CampaignCardProps) => {
  const statusConfig = {
    active: { color: "bg-brand-success text-white", icon: PlayCircle, label: "Active" },
    paused: { color: "bg-brand-warning text-white", icon: PauseCircle, label: "Paused" },
    draft: { color: "bg-muted text-muted-foreground", icon: Target, label: "Draft" },
    completed: { color: "bg-primary text-primary-foreground", icon: CheckCircle, label: "Completed" },
  };

  const spendProgress = (spent / budget) * 100;
  const { color, icon: StatusIcon, label } = statusConfig[status];

  return (
    <Card className="hover:shadow-md transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-sm text-foreground truncate">{name}</h4>
          <Badge className={`${color} text-xs px-2 py-1`}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {label}
          </Badge>
        </div>
        
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Budget Usage</span>
              <span>{spendProgress.toFixed(1)}%</span>
            </div>
            <Progress value={spendProgress} className="h-2" />
            <div className="flex justify-between text-xs mt-1">
              <span className="text-muted-foreground">₦{spent.toLocaleString()}</span>
              <span className="text-muted-foreground">₦{budget.toLocaleString()}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-muted-foreground">Impressions</p>
              <p className="font-semibold text-foreground">{impressions.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Clicks</p>
              <p className="font-semibold text-foreground">{clicks.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">CTR</p>
              <p className="font-semibold text-foreground">{ctr.toFixed(2)}%</p>
            </div>
            <div>
              <p className="text-muted-foreground">ROAS</p>
              <p className={`font-semibold ${roas >= 3 ? "text-brand-success" : roas >= 2 ? "text-brand-warning" : "text-brand-danger"}`}>
                {roas.toFixed(1)}x
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function ProfessionalDashboardOverview({
  profile,
  wallet,
  onCreateCampaign,
  onAddFunds,
}: ProfessionalDashboardOverviewProps) {
  // Fetch real campaign data
  const { data: campaigns = [], isLoading: campaignsLoading } = useQuery({
    queryKey: ['brand-campaigns-dashboard'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('brand_campaigns')
        .select('*')
        .eq('brand_id', user.id)
        .limit(3)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  // Calculate real metrics from campaigns
  const totalSpent = campaigns.reduce((sum, campaign) => sum + (campaign.funded_amount || 0), 0);
  const activeCampaigns = campaigns.filter(campaign => campaign.status === 'active').length;
  
  const metrics = [
    {
      title: "Total Spend",
      value: `₦${totalSpent.toLocaleString()}`,
      change: "+12.5%",
      changeType: "increase" as const,
      icon: DollarSign,
      color: "blue" as const,
    },
    {
      title: "Wallet Balance",
      value: `₦${wallet?.balance?.toLocaleString() || "0.00"}`,
      change: "+8.3%",
      changeType: "increase" as const,
      icon: Eye,
      color: "green" as const,
    },
    {
      title: "Total Campaigns",
      value: campaigns.length.toString(),
      change: "+0.5%",
      changeType: "increase" as const,
      icon: BarChart3,
      color: "yellow" as const,
    },
    {
      title: "Active Campaigns",
      value: activeCampaigns.toString(),
      change: activeCampaigns > 0 ? `+${activeCampaigns}` : "0",
      changeType: activeCampaigns > 0 ? "increase" as const : "decrease" as const,
      icon: Target,
      color: "red" as const,
    },
  ];

  // Generate smart alerts based on real data
  const alerts = [];
  
  // Check for low wallet balance
  if (wallet && wallet.balance < 50000) {
    alerts.push({
      type: "warning",
      message: "Your wallet balance is running low. Consider adding funds.",
      action: "Add Funds",
    });
  }

  // Check for campaigns needing attention
  const draftCampaigns = campaigns.filter(c => c.status === 'draft').length;
  if (draftCampaigns > 0) {
    alerts.push({
      type: "info",
      message: `You have ${draftCampaigns} draft campaign${draftCampaigns > 1 ? 's' : ''} ready to activate.`,
      action: "View Campaigns",
    });
  }

  // Add success message if campaigns are active
  if (activeCampaigns > 0) {
    alerts.push({
      type: "success",
      message: `You have ${activeCampaigns} active campaign${activeCampaigns > 1 ? 's' : ''} running smoothly.`,
      action: "View Performance",
    });
  }

  // Default message if no alerts
  if (alerts.length === 0) {
    alerts.push({
      type: "info",
      message: "All systems running smoothly. Ready to create your first campaign?",
      action: "Get Started",
    });
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Welcome back, {profile?.company_name || "Brand"}
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your campaigns today.
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={onAddFunds} variant="outline" className="gap-2">
            <Wallet className="w-4 h-4" />
            Add Funds
          </Button>
          <Button onClick={onCreateCampaign} className="gap-2">
            <Plus className="w-4 h-4" />
            New Campaign
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Campaign Performance */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Active Campaigns</CardTitle>
                <Button variant="ghost" size="sm" className="gap-2">
                  View All
                  <ArrowUpRight className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {campaignsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-20 bg-muted rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : campaigns.length > 0 ? (
                campaigns.map((campaign) => (
                  <CampaignCard 
                    key={campaign.id} 
                    id={campaign.id}
                    name={campaign.title}
                    status={campaign.status as any}
                    budget={campaign.budget}
                    spent={campaign.funded_amount || 0}
                    impressions={0}
                    clicks={0}
                    ctr={0}
                    roas={0}
                  />
                ))
              ) : (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No campaigns yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Create your first campaign to get started
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Wallet Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                Wallet Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Available Balance</p>
                <p className="text-2xl font-bold text-foreground">
                  ₦{wallet?.balance?.toLocaleString() || "0.00"}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Total Deposited</p>
                  <p className="font-semibold">₦{wallet?.total_deposited?.toLocaleString() || "0.00"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Spent</p>
                  <p className="font-semibold">₦{wallet?.total_spent?.toLocaleString() || "0.00"}</p>
                </div>
              </div>
              <Button onClick={onAddFunds} className="w-full">
                Add Funds
              </Button>
            </CardContent>
          </Card>

          {/* Smart Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Smart Alerts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {alerts.map((alert, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/50"
                >
                  {alert.type === "warning" && (
                    <AlertTriangle className="w-4 h-4 text-brand-warning mt-0.5 flex-shrink-0" />
                  )}
                  {alert.type === "success" && (
                    <CheckCircle className="w-4 h-4 text-brand-success mt-0.5 flex-shrink-0" />
                  )}
                  {alert.type === "info" && (
                    <BarChart3 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">{alert.message}</p>
                    <Button variant="link" size="sm" className="h-auto p-0 text-xs text-primary">
                      {alert.action}
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}