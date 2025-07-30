import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Wallet, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ModernWithdrawalHeaderProps {
  userBalance: number;
  totalEarned?: number;
  userName?: string;
}

export const ModernWithdrawalHeader: React.FC<ModernWithdrawalHeaderProps> = ({
  userBalance,
  totalEarned = 0,
  userName = "User"
}) => {
  const navigate = useNavigate();

  return (
    <div className="relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
      
      {/* Floating Elements */}
      <div className="absolute top-4 right-4 w-32 h-32 bg-primary/5 rounded-full blur-xl animate-float" />
      <div className="absolute bottom-4 left-4 w-24 h-24 bg-accent/10 rounded-full blur-lg animate-float" style={{ animationDelay: '2s' }} />
      
      <div className="relative z-10 p-8">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="outline"
            onClick={() => navigate('/dashboard')}
            className="bg-card/80 backdrop-blur-sm border-border/50 hover:bg-accent/50 transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        {/* Hero Content */}
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm font-medium">Welcome back,</p>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                {userName}
              </h1>
            </div>
            
            <p className="text-muted-foreground text-lg max-w-md">
              Withdraw your earnings or transfer points to your yield wallet with just a few clicks.
            </p>
          </div>

          {/* Balance Cards */}
          <div className="grid gap-4">
            {/* Main Balance Card */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-6 hover:border-primary/30 transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Wallet className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-muted-foreground text-sm font-medium">Available Balance</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-bold text-foreground">
                    ₦{userBalance.toLocaleString()}
                  </div>
                  <p className="text-muted-foreground text-sm">Ready for withdrawal</p>
                </div>
              </div>
            </div>

            {/* Total Earned Card */}
            <div className="bg-card/60 backdrop-blur-sm border border-border/30 rounded-xl p-4 hover:border-primary/20 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-accent/20 rounded-md">
                    <TrendingUp className="w-4 h-4 text-accent-foreground" />
                  </div>
                  <span className="text-muted-foreground text-sm">Total Earned</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-foreground">₦{totalEarned.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};