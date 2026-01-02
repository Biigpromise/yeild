import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calculator, Users, TrendingUp, DollarSign, Info, AlertTriangle, CheckCircle, Wallet } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNavigate } from 'react-router-dom';

interface BudgetEstimate {
  totalBudget: number;
  pointsPerTask: number;
  guaranteedCompletions: number;
  estimatedReach: number;
  costPerCompletion: number;
  minRecommendedBudget: number;
}

interface BudgetEstimateCalculatorProps {
  onBudgetConfirmed?: (budget: number, pointsPerTask: number) => void;
  walletBalance?: number;
  isRequired?: boolean;
  initialBudget?: number;
  initialPointsPerTask?: number;
}

// Bird level bonus percentages (platform covers these)
const BIRD_LEVEL_BONUSES = {
  sparrow: { name: 'Sparrow', bonus: 0, color: 'text-amber-600' },
  robin: { name: 'Robin', bonus: 0.10, color: 'text-orange-500' },
  eagle: { name: 'Eagle', bonus: 0.20, color: 'text-blue-500' },
  phoenix: { name: 'Phoenix', bonus: 0.30, color: 'text-red-500' },
};

const MIN_POINTS_PER_TASK = 300;
const MIN_RECOMMENDED_COMPLETIONS = 3;

export const BudgetEstimateCalculator: React.FC<BudgetEstimateCalculatorProps> = ({
  onBudgetConfirmed,
  walletBalance,
  isRequired = false,
  initialBudget,
  initialPointsPerTask
}) => {
  const navigate = useNavigate();
  const [budget, setBudget] = useState<string>(initialBudget?.toString() || '15000');
  const [pointsPerTask, setPointsPerTask] = useState<string>(initialPointsPerTask?.toString() || '300');
  const [estimate, setEstimate] = useState<BudgetEstimate | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const NAIRA_TO_POINTS = 1; // 1 Naira = 1 Point

  useEffect(() => {
    calculateEstimate();
  }, [budget, pointsPerTask]);

  // Reset confirmation when budget changes
  useEffect(() => {
    setIsConfirmed(false);
  }, [budget, pointsPerTask]);

  const calculateEstimate = () => {
    const budgetValue = parseFloat(budget) || 0;
    const pointsValue = parseFloat(pointsPerTask) || MIN_POINTS_PER_TASK;

    if (budgetValue <= 0 || pointsValue < MIN_POINTS_PER_TASK) {
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

    // Minimum recommended budget for at least 3 completions
    const minRecommendedBudget = MIN_RECOMMENDED_COMPLETIONS * pointsValue;

    setEstimate({
      totalBudget: budgetValue,
      pointsPerTask: pointsValue,
      guaranteedCompletions,
      estimatedReach,
      costPerCompletion,
      minRecommendedBudget,
    });
  };

  const handleConfirmBudget = () => {
    if (!estimate || estimate.guaranteedCompletions < 1) {
      return;
    }
    
    // Check wallet balance if provided
    if (walletBalance !== undefined && walletBalance < estimate.totalBudget) {
      return; // Button should be disabled, but double-check
    }
    
    setIsConfirmed(true);
    onBudgetConfirmed?.(estimate.totalBudget, estimate.pointsPerTask);
  };

  const hasSufficientFunds = walletBalance === undefined || (estimate && walletBalance >= estimate.totalBudget);
  const canConfirm = estimate && estimate.guaranteedCompletions >= 1 && hasSufficientFunds;

  return (
    <Card className={`border-border ${isRequired ? 'border-2 border-primary/30' : ''}`}>
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <Calculator className="w-5 h-5 text-primary" />
          Budget Estimate Calculator
          {isRequired && (
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full ml-2">
              Required
            </span>
          )}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {isRequired 
            ? 'You must confirm your budget before proceeding'
            : 'Calculate how many task completions your budget will get'
          }
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Wallet Balance Display */}
        {walletBalance !== undefined && (
          <div className={`p-4 rounded-lg border ${hasSufficientFunds ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800' : 'bg-destructive/10 border-destructive/30'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet className={`w-5 h-5 ${hasSufficientFunds ? 'text-green-600' : 'text-destructive'}`} />
                <span className="font-medium">Your Wallet Balance</span>
              </div>
              <span className={`text-lg font-bold ${hasSufficientFunds ? 'text-green-600' : 'text-destructive'}`}>
                ₦{walletBalance.toLocaleString()}
              </span>
            </div>
            {!hasSufficientFunds && estimate && (
              <div className="mt-3 pt-3 border-t border-destructive/20">
                <p className="text-sm text-destructive mb-2">
                  Insufficient funds. You need ₦{(estimate.totalBudget - walletBalance).toLocaleString()} more.
                </p>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => navigate('/brand-dashboard/wallet')}
                  className="text-destructive border-destructive/30 hover:bg-destructive/10"
                >
                  Fund Your Wallet
                </Button>
              </div>
            )}
          </div>
        )}

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
              min={MIN_POINTS_PER_TASK}
              className="border-border bg-background text-foreground"
              disabled={isConfirmed}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Minimum: ₦{MIN_POINTS_PER_TASK} (1 Naira = 1 Point)
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
              min={MIN_POINTS_PER_TASK}
              className="border-border bg-background text-foreground"
              disabled={isConfirmed}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Minimum {MIN_POINTS_PER_TASK} points required per task
            </p>
          </div>
        </div>

        {/* Minimum Budget Warning */}
        {estimate && estimate.guaranteedCompletions < MIN_RECOMMENDED_COMPLETIONS && (
          <Alert className="border-destructive/50 bg-destructive/5">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Budget too low:</strong> With ₦{estimate.totalBudget.toLocaleString()}, you'll only get {estimate.guaranteedCompletions} completion(s). 
              We recommend at least ₦{estimate.minRecommendedBudget.toLocaleString()} for {MIN_RECOMMENDED_COMPLETIONS}+ completions.
            </AlertDescription>
          </Alert>
        )}

        {/* Results Section */}
        {estimate && estimate.guaranteedCompletions >= 1 && (
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
                      ₦{estimate.costPerCompletion.toLocaleString()}
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
              <h4 className="font-medium text-blue-900 dark:text-blue-100 flex items-center gap-2 mb-3">
                <Info className="w-4 h-4" />
                How Bird Levels Work
              </h4>
              <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                You pay a fixed <strong>{estimate.pointsPerTask} points</strong> per task completion. 
                Users with higher bird levels earn bonus points from our platform pool—<strong>your budget stays predictable!</strong>
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {Object.entries(BIRD_LEVEL_BONUSES).map(([key, level]) => (
                  <div key={key} className="bg-white/50 dark:bg-white/5 rounded-md p-2 text-center">
                    <div className={`font-semibold text-sm ${level.color}`}>{level.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {level.bonus === 0 ? 'Base rate' : `+${level.bonus * 100}% bonus`}
                    </div>
                    <div className="text-xs font-medium mt-1">
                      Gets {Math.round(estimate.pointsPerTask * (1 + level.bonus))} pts
                    </div>
                  </div>
                ))}
              </div>
              
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-3">
                * Bird level bonuses are paid by the platform, not deducted from your budget
              </p>
            </div>

            {/* Budget Recommendations */}
            <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
              <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">Recommended Budget Tiers</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div 
                  className="bg-white/50 dark:bg-white/5 rounded-md p-3 cursor-pointer hover:ring-2 hover:ring-green-400 transition-all"
                  onClick={() => !isConfirmed && setBudget((5 * estimate.pointsPerTask).toString())}
                >
                  <div className="font-semibold text-green-800 dark:text-green-200">Starter</div>
                  <div className="text-2xl font-bold text-green-700 dark:text-green-300">₦{(5 * estimate.pointsPerTask).toLocaleString()}</div>
                  <div className="text-xs text-green-600 dark:text-green-400">~5 completions</div>
                </div>
                <div 
                  className="bg-white/50 dark:bg-white/5 rounded-md p-3 ring-2 ring-green-500 cursor-pointer hover:ring-green-400 transition-all"
                  onClick={() => !isConfirmed && setBudget((20 * estimate.pointsPerTask).toString())}
                >
                  <div className="font-semibold text-green-800 dark:text-green-200">Growth ⭐</div>
                  <div className="text-2xl font-bold text-green-700 dark:text-green-300">₦{(20 * estimate.pointsPerTask).toLocaleString()}</div>
                  <div className="text-xs text-green-600 dark:text-green-400">~20 completions</div>
                </div>
                <div 
                  className="bg-white/50 dark:bg-white/5 rounded-md p-3 cursor-pointer hover:ring-2 hover:ring-green-400 transition-all"
                  onClick={() => !isConfirmed && setBudget((50 * estimate.pointsPerTask).toString())}
                >
                  <div className="font-semibold text-green-800 dark:text-green-200">Scale</div>
                  <div className="text-2xl font-bold text-green-700 dark:text-green-300">₦{(50 * estimate.pointsPerTask).toLocaleString()}</div>
                  <div className="text-xs text-green-600 dark:text-green-400">~50 completions</div>
                </div>
              </div>
            </div>

            {/* Confirm Budget Button - Only shown when required */}
            {isRequired && (
              <div className="pt-4 border-t border-border">
                {isConfirmed ? (
                  <div className="flex items-center justify-center gap-2 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-700 dark:text-green-300">
                      Budget Confirmed: ₦{estimate.totalBudget.toLocaleString()} ({estimate.guaranteedCompletions} completions)
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsConfirmed(false)}
                      className="ml-2"
                    >
                      Edit
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={handleConfirmBudget}
                    disabled={!canConfirm}
                    className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-lg py-6"
                    size="lg"
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Confirm Budget: ₦{estimate.totalBudget.toLocaleString()}
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
