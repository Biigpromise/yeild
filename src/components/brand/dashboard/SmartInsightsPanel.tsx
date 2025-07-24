
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Brain, 
  AlertCircle, 
  TrendingUp, 
  Target, 
  Clock,
  Lightbulb,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

interface InsightProps {
  id: string;
  type: 'optimization' | 'alert' | 'opportunity' | 'achievement';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  actionLabel?: string;
  onAction?: () => void;
}

const InsightCard: React.FC<InsightProps> = ({ 
  type, 
  title, 
  description, 
  priority, 
  actionLabel, 
  onAction 
}) => {
  const getTypeIcon = () => {
    switch (type) {
      case 'optimization': return <TrendingUp className="h-4 w-4" />;
      case 'alert': return <AlertCircle className="h-4 w-4" />;
      case 'opportunity': return <Target className="h-4 w-4" />;
      case 'achievement': return <CheckCircle className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getTypeColor = () => {
    switch (type) {
      case 'optimization': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
      case 'alert': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      case 'opportunity': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      case 'achievement': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100';
    }
  };

  const getPriorityColor = () => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-500';
    }
  };

  return (
    <div className={`p-4 rounded-lg border-l-4 ${getPriorityColor()} bg-card hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <Badge className={`${getTypeColor()} flex items-center gap-1`}>
            {getTypeIcon()}
            {type}
          </Badge>
          <div className="flex-1">
            <h4 className="font-medium text-foreground mb-1">{title}</h4>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        {actionLabel && onAction && (
          <Button variant="ghost" size="sm" onClick={onAction} className="group">
            {actionLabel}
            <ArrowRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
          </Button>
        )}
      </div>
    </div>
  );
};

interface BudgetHealthProps {
  totalBudget: number;
  spent: number;
  remaining: number;
  dailySpendRate: number;
  projectedRunout: number; // days
}

const BudgetHealthIndicator: React.FC<BudgetHealthProps> = ({
  totalBudget,
  spent,
  remaining,
  dailySpendRate,
  projectedRunout
}) => {
  const spentPercentage = (spent / totalBudget) * 100;
  const healthStatus = projectedRunout > 30 ? 'healthy' : projectedRunout > 10 ? 'warning' : 'critical';

  const getHealthColor = () => {
    switch (healthStatus) {
      case 'healthy': return 'text-green-600 dark:text-green-400';
      case 'warning': return 'text-yellow-600 dark:text-yellow-400';
      case 'critical': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getHealthBadge = () => {
    switch (healthStatus) {
      case 'healthy': return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">Healthy</Badge>;
      case 'warning': return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">Monitor</Badge>;
      case 'critical': return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">Critical</Badge>;
      default: return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Budget Health
          </span>
          {getHealthBadge()}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Budget Progress Bar */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Budget Usage</span>
              <span>{spentPercentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  spentPercentage < 70 ? 'bg-green-500' : 
                  spentPercentage < 90 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(spentPercentage, 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Budget Stats */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Spent</p>
              <p className="font-medium">${spent.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Remaining</p>
              <p className="font-medium">${remaining.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Daily Rate</p>
              <p className="font-medium">${dailySpendRate.toLocaleString()}/day</p>
            </div>
            <div>
              <p className="text-muted-foreground">Est. Duration</p>
              <p className={`font-medium ${getHealthColor()}`}>{projectedRunout} days</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface SmartInsightsPanelProps {
  insights: InsightProps[];
  budgetHealth: BudgetHealthProps;
}

export const SmartInsightsPanel: React.FC<SmartInsightsPanelProps> = ({ insights, budgetHealth }) => {
  return (
    <div className="space-y-6">
      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Campaign Coach
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {insights.map((insight) => (
              <InsightCard key={insight.id} {...insight} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Budget Health */}
      <BudgetHealthIndicator {...budgetHealth} />
    </div>
  );
};
