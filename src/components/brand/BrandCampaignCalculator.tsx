
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Calculator, TrendingUp, Users, Target, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface CampaignPrediction {
  estimatedReach: number;
  expectedCompletions: number;
  costPerCompletion: number;
  engagementRate: number;
  roi: number;
  duration: number;
  dailyBudget: number;
  totalCost: number;
  potentialReach: number;
  competitionLevel: 'low' | 'medium' | 'high';
}

interface BrandCampaignCalculatorProps {
  onCampaignPredict?: (prediction: CampaignPrediction) => void;
}

export const BrandCampaignCalculator: React.FC<BrandCampaignCalculatorProps> = ({
  onCampaignPredict
}) => {
  const [budget, setBudget] = useState<string>('');
  const [pointsPerTask, setPointsPerTask] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [difficulty, setDifficulty] = useState<string>('');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [prediction, setPrediction] = useState<CampaignPrediction | null>(null);
  const [calculating, setCalculating] = useState(false);

  const categories = [
    { value: 'social_media', label: 'Social Media' },
    { value: 'content_creation', label: 'Content Creation' },
    { value: 'reviews', label: 'Reviews & Feedback' },
    { value: 'surveys', label: 'Surveys' },
    { value: 'app_testing', label: 'App Testing' },
    { value: 'marketing', label: 'Marketing' }
  ];

  const difficulties = [
    { value: 'easy', label: 'Easy', multiplier: 1.0 },
    { value: 'medium', label: 'Medium', multiplier: 1.5 },
    { value: 'hard', label: 'Hard', multiplier: 2.0 }
  ];

  const calculateCampaignPrediction = async () => {
    if (!budget || !pointsPerTask || !category || !difficulty || !startDate || !endDate) {
      return;
    }

    setCalculating(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const budgetNum = parseFloat(budget);
    const pointsNum = parseFloat(pointsPerTask);
    const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Base calculations with realistic factors
    const baseCostPerCompletion = pointsNum * 0.1; // 10% of points as cost
    const difficultyMultiplier = difficulties.find(d => d.value === difficulty)?.multiplier || 1;
    const categoryMultiplier = getCategoryMultiplier(category);
    
    const adjustedCostPerCompletion = baseCostPerCompletion * difficultyMultiplier * categoryMultiplier;
    const expectedCompletions = Math.floor(budgetNum / adjustedCostPerCompletion);
    
    // Platform statistics (simulated but realistic)
    const platformActiveUsers = 50000; // Assumed active user base
    const categoryEngagement = getCategoryEngagement(category);
    const seasonalMultiplier = getSeasonalMultiplier(startDate);
    
    const potentialReach = Math.min(platformActiveUsers, expectedCompletions * 3);
    const estimatedReach = Math.floor(potentialReach * categoryEngagement * seasonalMultiplier);
    
    const engagementRate = Math.min((expectedCompletions / estimatedReach) * 100, 85);
    const roi = ((expectedCompletions * pointsNum * 0.05) / budgetNum) * 100; // 5% conversion value
    
    const dailyBudget = budgetNum / duration;
    const competitionLevel = getCompetitionLevel(category, pointsNum);

    const predictionResult: CampaignPrediction = {
      estimatedReach,
      expectedCompletions,
      costPerCompletion: adjustedCostPerCompletion,
      engagementRate,
      roi,
      duration,
      dailyBudget,
      totalCost: budgetNum,
      potentialReach,
      competitionLevel
    };

    setPrediction(predictionResult);
    onCampaignPredict?.(predictionResult);
    setCalculating(false);
  };

  const getCategoryMultiplier = (cat: string): number => {
    const multipliers = {
      social_media: 1.2,
      content_creation: 1.5,
      reviews: 1.0,
      surveys: 0.8,
      app_testing: 1.3,
      marketing: 1.1
    };
    return multipliers[cat as keyof typeof multipliers] || 1.0;
  };

  const getCategoryEngagement = (cat: string): number => {
    const engagements = {
      social_media: 0.75,
      content_creation: 0.65,
      reviews: 0.85,
      surveys: 0.70,
      app_testing: 0.60,
      marketing: 0.80
    };
    return engagements[cat as keyof typeof engagements] || 0.70;
  };

  const getSeasonalMultiplier = (date: Date): number => {
    const month = date.getMonth();
    // Higher engagement in Dec-Jan and May-July
    if (month >= 11 || month <= 1 || (month >= 4 && month <= 6)) {
      return 1.15;
    }
    return 1.0;
  };

  const getCompetitionLevel = (cat: string, points: number): 'low' | 'medium' | 'high' => {
    const competitiveCategories = ['social_media', 'marketing', 'content_creation'];
    const isCompetitive = competitiveCategories.includes(cat);
    
    if (isCompetitive && points < 100) return 'high';
    if (isCompetitive && points < 500) return 'medium';
    return 'low';
  };

  const getCompetitionColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Campaign Budget Calculator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="budget">Total Budget (₦)</Label>
              <Input
                id="budget"
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="1000000"
                min="0"
              />
            </div>
            
            <div>
              <Label htmlFor="points">Points per Task</Label>
              <Input
                id="points"
                type="number"
                value={pointsPerTask}
                onChange={(e) => setPointsPerTask(e.target.value)}
                placeholder="50"
                min="1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Task Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Difficulty Level</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  {difficulties.map(diff => (
                    <SelectItem key={diff.value} value={diff.value}>
                      {diff.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Pick start date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : "Pick end date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <Button 
            onClick={calculateCampaignPrediction}
            disabled={!budget || !pointsPerTask || !category || !difficulty || !startDate || !endDate || calculating}
            className="w-full"
          >
            {calculating ? 'Calculating...' : 'Calculate Campaign Performance'}
          </Button>
        </CardContent>
      </Card>

      {/* Prediction Results */}
      {prediction && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Campaign Performance Prediction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-600">Estimated Reach</span>
                </div>
                <div className="text-2xl font-bold text-blue-700">
                  {prediction.estimatedReach.toLocaleString()}
                </div>
                <div className="text-sm text-blue-600">
                  users will see your campaign
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-600">Expected Completions</span>
                </div>
                <div className="text-2xl font-bold text-green-700">
                  {prediction.expectedCompletions.toLocaleString()}
                </div>
                <div className="text-sm text-green-600">
                  tasks completed
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-600">Cost per Completion</span>
                </div>
                <div className="text-2xl font-bold text-yellow-700">
                  ₦{prediction.costPerCompletion.toFixed(2)}
                </div>
                <div className="text-sm text-yellow-600">
                  per completed task
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Engagement Rate</span>
                <span className="text-lg font-semibold text-blue-600">
                  {prediction.engagementRate.toFixed(1)}%
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Projected ROI</span>
                <span className="text-lg font-semibold text-green-600">
                  {prediction.roi.toFixed(1)}%
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Daily Budget</span>
                <span className="text-lg font-semibold">
                  ₦{prediction.dailyBudget.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Campaign Duration</span>
                <span className="text-lg font-semibold">
                  {prediction.duration} days
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Competition Level</span>
                <Badge className={getCompetitionColor(prediction.competitionLevel)}>
                  {prediction.competitionLevel}
                </Badge>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Campaign Insights</h4>
              <ul className="space-y-1 text-sm text-blue-800">
                <li>• Your campaign will reach approximately {prediction.estimatedReach.toLocaleString()} users</li>
                <li>• Expected {prediction.expectedCompletions.toLocaleString()} task completions</li>
                <li>• Competition level is {prediction.competitionLevel} for this category</li>
                <li>• Optimal daily spending: ₦{prediction.dailyBudget.toFixed(2)} over {prediction.duration} days</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
