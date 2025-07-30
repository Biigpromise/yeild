import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  TrendingUp, 
  History, 
  Settings, 
  ArrowRight,
  Wallet,
  Building,
  Clock
} from 'lucide-react';

interface QuickActionPanelProps {
  userBalance: number;
  pendingWithdrawals?: number;
  onQuickWithdraw: (method: string) => void;
}

export const QuickActionPanel: React.FC<QuickActionPanelProps> = ({
  userBalance,
  pendingWithdrawals = 0,
  onQuickWithdraw
}) => {
  const quickActions = [
    {
      id: 'yield_wallet',
      title: 'Quick Transfer',
      subtitle: 'To Yield Wallet',
      description: 'Instant transfer, no fees',
      icon: Wallet,
      iconColor: 'text-primary',
      bgColor: 'bg-primary/10',
      amount: Math.floor(userBalance * 0.25),
      disabled: userBalance < 100
    },
    {
      id: 'flutterwave',
      title: 'Bank Withdrawal',
      subtitle: 'To Bank Account',
      description: '5% fee, 1-24 hours',
      icon: Building,
      iconColor: 'text-brand-blue',
      bgColor: 'bg-brand-blue/10',
      amount: Math.floor(userBalance * 0.5),
      disabled: userBalance < 1000
    }
  ];

  const statsCards = [
    {
      title: 'Pending',
      value: pendingWithdrawals,
      subtitle: 'withdrawals',
      icon: Clock,
      color: 'text-warning'
    },
    {
      title: 'Available',
      value: `₦${userBalance.toLocaleString()}`,
      subtitle: 'balance',
      icon: TrendingUp,
      color: 'text-brand-success'
    }
  ];

  return (
    <div className="grid gap-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        {statsCards.map((stat, index) => (
          <Card key={index} className="bg-card/60 backdrop-blur-sm border-border/30 hover:border-primary/20 transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.subtitle}</div>
                </div>
                <div className={`p-2 rounded-lg bg-muted/20 ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="bg-card/80 backdrop-blur-sm border-border/50">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Quick Actions</h3>
            </div>

            <div className="grid gap-3">
              {quickActions.map((action) => {
                const Icon = action.icon;
                
                return (
                  <div
                    key={action.id}
                    className={`group relative overflow-hidden rounded-xl border transition-all duration-300 ${
                      action.disabled 
                        ? 'border-border/30 opacity-50 cursor-not-allowed' 
                        : 'border-border/50 hover:border-primary/30 hover:shadow-md cursor-pointer'
                    }`}
                    onClick={() => !action.disabled && onQuickWithdraw(action.id)}
                  >
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${action.bgColor}`}>
                            <Icon className={`w-5 h-5 ${action.iconColor}`} />
                          </div>
                          <div className="space-y-1">
                            <div className="font-medium">{action.title}</div>
                            <div className="text-sm text-muted-foreground">{action.subtitle}</div>
                            <div className="text-xs text-muted-foreground">{action.description}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {!action.disabled && (
                            <Badge variant="outline" className="text-xs">
                              ₦{action.amount.toLocaleString()}
                            </Badge>
                          )}
                          <ArrowRight className={`w-4 h-4 transition-transform duration-300 ${
                            !action.disabled ? 'group-hover:translate-x-1' : ''
                          }`} />
                        </div>
                      </div>
                    </div>
                    
                    {/* Hover gradient effect */}
                    {!action.disabled && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Additional Actions */}
            <div className="pt-4 border-t border-border/30">
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="justify-start">
                  <History className="w-4 h-4 mr-2" />
                  View History
                </Button>
                <Button variant="outline" size="sm" className="justify-start">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pro Tip */}
      <Card className="bg-accent/20 border-accent/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-accent/20 rounded-lg">
              <TrendingUp className="w-4 h-4 text-accent-foreground" />
            </div>
            <div className="space-y-1">
              <h5 className="font-medium text-sm">Pro Tip</h5>
              <p className="text-xs text-muted-foreground">
                Transfer to your Yield Wallet to earn compound interest on your points. 
                No fees and instant processing!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};