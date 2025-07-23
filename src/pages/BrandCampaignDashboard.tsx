
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  BarChart3, 
  Settings, 
  TrendingUp,
  Users,
  Target,
  DollarSign
} from 'lucide-react';
import { BrandCampaignCalculator } from '@/components/brand/BrandCampaignCalculator';
import { BrandCampaignAnalytics } from '@/components/brand/BrandCampaignAnalytics';

interface Campaign {
  id: string;
  title: string;
  budget: number;
  spent: number;
  status: 'active' | 'paused' | 'completed';
  startDate: string;
  endDate: string;
  completions: number;
  reach: number;
}

const BrandCampaignDashboard: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([
    {
      id: '1',
      title: 'Instagram Retweet Campaign',
      budget: 1000000,
      spent: 150000,
      status: 'active',
      startDate: '2024-01-15',
      endDate: '2024-01-30',
      completions: 324,
      reach: 12500
    },
    {
      id: '2',
      title: 'Product Review Campaign',
      budget: 500000,
      spent: 480000,
      status: 'completed',
      startDate: '2024-01-01',
      endDate: '2024-01-14',
      completions: 156,
      reach: 8200
    },
    {
      id: '3',
      title: 'App Testing Campaign',
      budget: 750000,
      spent: 0,
      status: 'paused',
      startDate: '2024-01-20',
      endDate: '2024-02-05',
      completions: 0,
      reach: 0
    }
  ]);

  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalBudget = campaigns.reduce((sum, c) => sum + c.budget, 0);
  const totalSpent = campaigns.reduce((sum, c) => sum + c.spent, 0);
  const totalCompletions = campaigns.reduce((sum, c) => sum + c.completions, 0);
  const totalReach = campaigns.reduce((sum, c) => sum + c.reach, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Campaign Dashboard</h1>
            <p className="text-gray-600">Manage and track your brand campaigns</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Create Campaign
          </Button>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-600">Total Budget</span>
              </div>
              <div className="text-2xl font-bold text-green-700">
                ₦{totalBudget.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">
                ₦{totalSpent.toLocaleString()} spent
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-600">Total Completions</span>
              </div>
              <div className="text-2xl font-bold text-blue-700">
                {totalCompletions}
              </div>
              <div className="text-sm text-gray-600">
                across all campaigns
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-600">Total Reach</span>
              </div>
              <div className="text-2xl font-bold text-purple-700">
                {totalReach.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">
                users reached
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-600">Avg Performance</span>
              </div>
              <div className="text-2xl font-bold text-orange-700">
                {totalReach > 0 ? ((totalCompletions / totalReach) * 100).toFixed(1) : '0'}%
              </div>
              <div className="text-sm text-gray-600">
                conversion rate
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="campaigns" className="space-y-4">
          <TabsList>
            <TabsTrigger value="campaigns">My Campaigns</TabsTrigger>
            <TabsTrigger value="calculator">Budget Calculator</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="campaigns" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Active Campaigns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {campaigns.map((campaign) => (
                    <div 
                      key={campaign.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedCampaign(campaign.id)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">{campaign.title}</h3>
                          <Badge className={getStatusColor(campaign.status)}>
                            {campaign.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>Budget: ₦{campaign.budget.toLocaleString()}</span>
                          <span>Spent: ₦{campaign.spent.toLocaleString()}</span>
                          <span>Completions: {campaign.completions}</span>
                          <span>Reach: {campaign.reach.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <BarChart3 className="h-4 w-4 mr-2" />
                          View Analytics
                        </Button>
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4 mr-2" />
                          Settings
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calculator">
            <BrandCampaignCalculator />
          </TabsContent>

          <TabsContent value="analytics">
            {selectedCampaign ? (
              <BrandCampaignAnalytics campaignId={selectedCampaign} />
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold mb-2">Select a Campaign</h3>
                  <p className="text-gray-600">
                    Choose a campaign from the "My Campaigns" tab to view detailed analytics.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BrandCampaignDashboard;
