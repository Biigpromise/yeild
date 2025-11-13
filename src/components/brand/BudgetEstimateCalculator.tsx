import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calculator, Users, TrendingUp, DollarSign } from 'lucide-react';

interface BudgetEstimate {
  totalBudget: number;
  pointsPerTask: number;
  guaranteedCompletions: number;
  estimatedReach: number;
  costPerCompletion: number;
}

export const BudgetEstimateCalculator = () => {
  const [budget, setBudget] = useState<string>('15000');
  const [pointsPerTask, setPointsPerTask] = useState<string>('300');
  const [estimate, setEstimate] = useState<BudgetEstimate | null>(null);

  const NAIRA_TO_POINTS = 1; // 1 Naira = 1 Point

  useEffect(() => {
    calculateEstimate();
  }, [budget, pointsPerTask]);

  const calculateEstimate = () => {
    const budgetValue = parseFloat(budget) || 0;
    const pointsValue = parseFloat(pointsPerTask) || 300;

    if (budgetValue <= 0 || pointsValue < 300) {
      setEstimate(null);
      return;
    }

    // Convert budget to points (1 Naira = 1 Point)
    const totalPoints = budgetValue * NAIRA_TO_POINTS;

    // Calculate guaranteed completions (brand pays base points only)
    const guaranteedCompletions = Math.floor(totalPoints / pointsValue);

    // Estimated reach (assume 2-3x reach through views/engagement)
    const estimatedReach = Math.floor(guaranteedCompletions * 2.5);

    // Cost per completion in Naira
    const costPerCompletion = pointsValue / NAIRA_TO_POINTS;

    setEstimate({
      totalBudget: budgetValue,
      pointsPerTask: pointsValue,
      guaranteedCompletions,
      estimatedReach,
      costPerCompletion,
    });
  };

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <Calculator className="w-5 h-5 text-primary" />
          Budget Estimate Calculator
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Calculate how many task completions your budget will get
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="budget" className="text-foreground">Campaign Budget (₦)</Label>
            <Input
              id="budget"
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="15000"
              min="300"
              className="border-border bg-background text-foreground"
            />
            <p className="text-xs text-muted-foreground mt-1">
              1 Naira = 1 Point
            </p>
          </div>

          <div>
            <Label htmlFor="pointsPerTask" className="text-foreground">Points per Task</Label>
            <Input
              id="pointsPerTask"
              type="number"
              value={pointsPerTask}
              onChange={(e) => setPointsPerTask(e.target.value)}
              placeholder="300"
              min="300"
              className="border-border bg-background text-foreground"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Minimum 300 points required
            </p>
          </div>
        </div>

        {/* Results Section */}
        {estimate && (
          <div className="space-y-4 pt-4 border-t border-border">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Estimated Results
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-primary/5 rounded-lg p-4 border border-primary/10">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Guaranteed Completions</p>
                    <p className="text-2xl font-bold text-primary mt-1">
                      {estimate.guaranteedCompletions}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Users who will complete your task
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-primary/40" />
                </div>
              </div>

              <div className="bg-secondary/5 rounded-lg p-4 border border-secondary/10">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Estimated Reach</p>
                    <p className="text-2xl font-bold text-secondary mt-1">
                      {estimate.estimatedReach}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Total users who may see your campaign
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-secondary/40" />
                </div>
              </div>

              <div className="bg-accent/5 rounded-lg p-4 border border-accent/10">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Cost per Completion</p>
                    <p className="text-2xl font-bold text-accent mt-1">
                      ₦{estimate.costPerCompletion}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      What you pay per completed task
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-accent/40" />
                </div>
              </div>

              <div className="bg-muted/30 rounded-lg p-4 border border-border">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Points Available</p>
                    <p className="text-2xl font-bold text-foreground mt-1">
                      {estimate.totalBudget.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Points allocated for this campaign
                    </p>
                  </div>
                  <Calculator className="w-8 h-8 text-muted-foreground/40" />
                </div>
              </div>
            </div>

            {/* Bird Level Info */}
            <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4" />
                How Bird Levels Work
              </h4>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• You pay the <strong>base points per task</strong> ({estimate.pointsPerTask} points)</li>
                <li>• Users with higher bird levels earn <strong>bonus points from platform pool</strong></li>
                <li>• Your budget is predictable - exactly {estimate.guaranteedCompletions} completions</li>
                <li>• Example: Phoenix user gets {estimate.pointsPerTask} (from you) + platform bonus</li>
              </ul>
            </div>

            {/* Budget Recommendation */}
            {estimate.guaranteedCompletions < 30 && (
              <div className="bg-yellow-50 dark:bg-yellow-950/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
                <p className="text-sm text-yellow-900 dark:text-yellow-100">
                  <strong>Tip:</strong> Consider increasing your budget to at least ₦{(30 * estimate.pointsPerTask).toLocaleString()} 
                  for better campaign reach (30+ completions recommended)
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
