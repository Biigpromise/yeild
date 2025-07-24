import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator, Target, TrendingUp, Users, Eye, DollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ROIMetrics {
  estimatedReach: number;
  expectedEngagement: number;
  projectedROI: number;
  costPerEngagement: number;
  estimatedConversions: number;
  costPerConversion: number;
}

export const CampaignROICalculator = () => {
  const [budget, setBudget] = useState<number>(10000);
  const [campaignType, setCampaignType] = useState<string>('social_media');
  const [targetAudience, setTargetAudience] = useState<string>('general');
  const [duration, setDuration] = useState<number>(7);
  const [metrics, setMetrics] = useState<ROIMetrics>({
    estimatedReach: 0,
    expectedEngagement: 0,
    projectedROI: 0,
    costPerEngagement: 0,
    estimatedConversions: 0,
    costPerConversion: 0
  });

  useEffect(() => {
    calculateMetrics();
  }, [budget, campaignType, targetAudience, duration]);

  const calculateMetrics = () => {
    if (budget <= 0) {
      setMetrics({
        estimatedReach: 0,
        expectedEngagement: 0,
        projectedROI: 0,
        costPerEngagement: 0,
        estimatedConversions: 0,
        costPerConversion: 0
      });
      return;
    }

    // Base multipliers for different campaign types
    const typeMultipliers = {
      social_media: { reach: 15, engagement: 0.03, conversion: 0.02 },
      influencer: { reach: 8, engagement: 0.05, conversion: 0.035 },
      content_creation: { reach: 12, engagement: 0.04, conversion: 0.025 },
      brand_awareness: { reach: 20, engagement: 0.025, conversion: 0.015 },
    };

    // Audience targeting multipliers
    const audienceMultipliers = {
      general: 1.0,
      targeted: 1.3,
      premium: 1.6,
      niche: 1.8
    };

    // Duration efficiency (longer campaigns may have diminishing returns)
    const durationEfficiency = Math.max(0.7, 1 - (duration - 7) * 0.02);

    const multiplier = typeMultipliers[campaignType as keyof typeof typeMultipliers];
    const audienceMultiplier = audienceMultipliers[targetAudience as keyof typeof audienceMultipliers];

    // Calculate metrics
    const estimatedReach = Math.round(budget * multiplier.reach * audienceMultiplier * durationEfficiency);
    const expectedEngagement = Math.round(estimatedReach * multiplier.engagement);
    const estimatedConversions = Math.round(expectedEngagement * multiplier.conversion);
    
    const costPerEngagement = expectedEngagement > 0 ? budget / expectedEngagement : 0;
    const costPerConversion = estimatedConversions > 0 ? budget / estimatedConversions : 0;
    
    // ROI calculation (assuming average conversion value of ₦2000)
    const averageConversionValue = 2000;
    const totalRevenue = estimatedConversions * averageConversionValue;
    const projectedROI = budget > 0 ? ((totalRevenue - budget) / budget) * 100 : 0;

    setMetrics({
      estimatedReach,
      expectedEngagement,
      projectedROI,
      costPerEngagement,
      estimatedConversions,
      costPerConversion
    });
  };

  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString()}`;
  };

  const getROIColor = (roi: number) => {
    if (roi >= 100) return 'text-green-600';
    if (roi >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Campaign ROI Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="budget">Campaign Budget (₦)</Label>
            <Input
              id="budget"
              type="number"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              placeholder="10,000"
              min="1000"
              step="1000"
            />
          </div>

          <div>
            <Label htmlFor="campaign-type">Campaign Type</Label>
            <Select value={campaignType} onValueChange={setCampaignType}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="social_media">Social Media</SelectItem>
                <SelectItem value="influencer">Influencer Marketing</SelectItem>
                <SelectItem value="content_creation">Content Creation</SelectItem>
                <SelectItem value="brand_awareness">Brand Awareness</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="target-audience">Target Audience</Label>
            <Select value={targetAudience} onValueChange={setTargetAudience}>
              <SelectTrigger>
                <SelectValue placeholder="Select audience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General Audience</SelectItem>
                <SelectItem value="targeted">Targeted Demographics</SelectItem>
                <SelectItem value="premium">Premium Segment</SelectItem>
                <SelectItem value="niche">Niche Market</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="duration">Duration (Days)</Label>
            <Input
              id="duration"
              type="number"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              placeholder="7"
              min="1"
              max="90"
            />
          </div>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-muted-foreground">Estimated Reach</span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {metrics.estimatedReach.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              People who will see your campaign
            </p>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-muted-foreground">Expected Engagement</span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {metrics.expectedEngagement.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Likes, shares, comments, clicks
            </p>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-muted-foreground">Est. Conversions</span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {metrics.estimatedConversions.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Estimated sales/sign-ups
            </p>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-muted-foreground">Projected ROI</span>
            </div>
            <p className={`text-2xl font-bold ${getROIColor(metrics.projectedROI)}`}>
              {metrics.projectedROI.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Return on investment
            </p>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-muted-foreground">Cost per Engagement</span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {formatCurrency(Math.round(metrics.costPerEngagement))}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Cost for each interaction
            </p>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-muted-foreground">Cost per Conversion</span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {formatCurrency(Math.round(metrics.costPerConversion))}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Cost for each sale/conversion
            </p>
          </div>
        </div>

        {/* Performance Indicator */}
        <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-lg p-4">
          <div>
            <h3 className="font-medium text-foreground">Campaign Performance Prediction</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Based on historical data and industry benchmarks
            </p>
          </div>
          <div className="flex gap-2">
            {metrics.projectedROI >= 100 && (
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                Excellent ROI
              </Badge>
            )}
            {metrics.projectedROI >= 50 && metrics.projectedROI < 100 && (
              <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
                Good ROI
              </Badge>
            )}
            {metrics.projectedROI < 50 && (
              <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">
                Consider Optimization
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};