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

export function ProfessionalDashboardOverview({
  profile,
  wallet,
  onCreateCampaign,
  onAddFunds,
}: ProfessionalDashboardOverviewProps) {
  // Mock data - replace with real data
  const metrics = [
    {
      title: "Total Spend",
      value: "₦485,000",
      change: "+12.5%",
      changeType: "increase" as const,
      icon: DollarSign,
      color: "blue" as const,
    },
    {
      title: "Total Impressions",
      value: "2.4M",
      change: "+8.3%",
      changeType: "increase" as const,
      icon: Eye,
      color: "green" as const,
    },
    {
      title: "Average CTR",
      value: "3.2%",
      change: "+0.5%",
      changeType: "increase" as const,
      icon: BarChart3,
      color: "yellow" as const,
    },
    {
      title: "Active Campaigns",
      value: "8",
      change: "-2",
      changeType: "decrease" as const,
      icon: Target,
      color: "red" as const,
    },
  ];

  const campaigns = [
    {
      id: "1",
      name: "Summer Sale Campaign",
      status: "active" as const,
      budget: 150000,
      spent: 95000,
      impressions: 450000,
      clicks: 14500,
      ctr: 3.2,
      roas: 4.5,
    },
    {
      id: "2",
      name: "Brand Awareness Drive",
      status: "paused" as const,
      budget: 200000,
      spent: 120000,
      impressions: 680000,
      clicks: 8900,
      ctr: 1.3,
      roas: 2.1,
    },
    {
      id: "3",
      name: "Product Launch",
      status: "active" as const,
      budget: 300000,
      spent: 280000,
      impressions: 850000,
      clicks: 25500,
      ctr: 3.0,
      roas: 5.2,
    },
  ];

  const alerts = [
    {
      type: "warning",
      message: "Campaign 'Product Launch' budget is 93% utilized",
      action: "Review Budget",
    },
    {
      type: "success",
      message: "Your ROAS improved by 15% this week",
      action: "View Details",
    },
    {
      type: "info",
      message: "New audience insights available",
      action: "Explore",
    },
  ];

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
              {campaigns.map((campaign) => (
                <CampaignCard key={campaign.id} {...campaign} />
              ))}
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