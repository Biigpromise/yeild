
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Users, 
  Target, 
  DollarSign, 
  Clock, 
  Activity,
  PauseCircle,
  PlayCircle,
  Settings
} from 'lucide-react';

interface CampaignAnalyticsProps {
  campaignId: string;
}

interface CampaignStats {
  totalSpent: number;
  remainingBudget: number;
  tasksCompleted: number;
  pendingTasks: number;
  userReach: number;
  conversionRate: number;
  avgCompletionTime: number;
  dailyStats: Array<{
    date: string;
    spent: number;
    completions: number;
    reach: number;
  }>;
}

export const BrandCampaignAnalytics: React.FC<CampaignAnalyticsProps> = ({
  campaignId
}) => {
  const [stats, setStats] = useState<CampaignStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [campaignStatus, setCampaignStatus] = useState<'active' | 'paused' | 'completed'>('active');

  useEffect(() => {
    const fetchCampaignStats = async () => {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data - in real app, this would come from API
      const mockStats: CampaignStats = {
        totalSpent: 150000,
        remainingBudget: 850000,
        tasksCompleted: 324,
        pendingTasks: 89,
        userReach: 12500,
        conversionRate: 2.6,
        avgCompletionTime: 18.5,
        dailyStats: [
          { date: '2024-01-15', spent: 25000, completions: 45, reach: 1800 },
          { date: '2024-01-16', spent: 28000, completions: 52, reach: 2100 },
          { date: '2024-01-17', spent: 22000, completions: 38, reach: 1600 },
          { date: '2024-01-18', spent: 30000, completions: 61, reach: 2400 },
          { date: '2024-01-19', spent: 26000, completions: 48, reach: 1900 },
          { date: '2024-01-20', spent: 19000, completions: 35, reach: 1400 },
          { date: '2024-01-21', spent: 32000, completions: 65, reach: 2600 }
        ]
      };
      
      setStats(mockStats);
      setLoading(false);
    };

    fetchCampaignStats();
  }, [campaignId]);

  const handlePauseCampaign = async () => {
    setCampaignStatus('paused');
    // In real app, make API call to pause campaign
  };

  const handleResumeCampaign = async () => {
    setCampaignStatus('active');
    // In real app, make API call to resume campaign
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return <div>No campaign data available</div>;
  }

  return (
    <div className="space-y-6">
      {/* Campaign Status Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Campaign Performance
            </CardTitle>
            <div className="flex items-center gap-3">
              <Badge className={getStatusColor(campaignStatus)}>
                {campaignStatus}
              </Badge>
              <div className="flex gap-2">
                {campaignStatus === 'active' ? (
                  <Button
                    onClick={handlePauseCampaign}
                    variant="outline"
                    size="sm"
                  >
                    <PauseCircle className="h-4 w-4 mr-2" />
                    Pause
                  </Button>
                ) : (
                  <Button
                    onClick={handleResumeCampaign}
                    variant="outline"
                    size="sm"
                  >
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Resume
                  </Button>
                )}
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-600">Total Spent</span>
            </div>
            <div className="text-2xl font-bold text-green-700">
              ₦{stats.totalSpent.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">
              ₦{stats.remainingBudget.toLocaleString()} remaining
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-600">Tasks Completed</span>
            </div>
            <div className="text-2xl font-bold text-blue-700">
              {stats.tasksCompleted}
            </div>
            <div className="text-sm text-gray-600">
              {stats.pendingTasks} pending
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-600">User Reach</span>
            </div>
            <div className="text-2xl font-bold text-purple-700">
              {stats.userReach.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">
              {stats.conversionRate}% conversion rate
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-600">Avg Completion</span>
            </div>
            <div className="text-2xl font-bold text-orange-700">
              {stats.avgCompletionTime}h
            </div>
            <div className="text-sm text-gray-600">
              per task
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.dailyStats.map((day, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="text-sm font-medium">
                    {new Date(day.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>₦{day.spent.toLocaleString()} spent</span>
                    <span>{day.completions} completions</span>
                    <span>{day.reach.toLocaleString()} reach</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-600">
                    {((day.completions / day.reach) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-600">Strong Performance</span>
              </div>
              <p className="text-sm text-green-800">
                Your campaign is performing {stats.conversionRate > 2 ? 'above' : 'below'} average with a {stats.conversionRate}% conversion rate.
              </p>
            </div>
            
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-600">Reach Optimization</span>
              </div>
              <p className="text-sm text-blue-800">
                Consider increasing your daily budget by 15-20% to maximize reach during peak hours.
              </p>
            </div>
            
            <div className="p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-600">Timing Insights</span>
              </div>
              <p className="text-sm text-yellow-800">
                Tasks completed fastest on weekends. Consider scheduling more tasks during these periods.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
