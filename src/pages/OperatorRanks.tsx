import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useOperatorRank } from '@/hooks/useOperatorRank';
import { useAuth } from '@/contexts/AuthContext';
import { Trophy, Target, Star, Crown, Sparkles, TrendingUp, Award, Zap, Shield, ArrowLeft, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
const OperatorRanks: React.FC = () => {
  const navigate = useNavigate();
  const {
    user
  } = useAuth();
  const {
    currentRank,
    nextRank,
    operatorStats,
    allRanks,
    loading
  } = useOperatorRank();
  const calculateProgress = () => {
    if (!nextRank || !operatorStats) return 100;
    const execProgress = operatorStats.verified_executions / nextRank.min_verified_executions * 100;
    const rateProgress = operatorStats.execution_success_rate / nextRank.min_success_rate * 100;
    return Math.min((execProgress + rateProgress) / 2, 100);
  };
  const getRankIcon = (rankName: string) => {
    const icons: Record<string, React.ReactNode> = {
      'Dove': <span className="text-2xl">🕊️</span>,
      'Hawk': <span className="text-2xl">🦅</span>,
      'Eagle': <span className="text-2xl">🦅</span>,
      'Falcon': <span className="text-2xl">🦅</span>,
      'Phoenix': <span className="text-2xl">🔥</span>
    };
    return icons[rankName] || <Shield className="h-6 w-6" />;
  };
  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Sparkles className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading your operator status...</p>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary/20 via-purple-500/20 to-orange-500/20 border-b">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
        <div className="relative max-w-7xl mx-auto px-4 py-8 sm:py-12 bg-muted">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" onClick={() => navigate('/dashboard')} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>
          
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-4 mb-4">
              {currentRank && getRankIcon(currentRank.name)}
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
                Operator Rank System
              </h1>
            </div>
            <p className="text-base sm:text-lg max-w-2xl mx-auto text-muted-foreground">
              Complete verified executions to rise through the ranks and unlock higher-value orders
            </p>
            {currentRank && <div className="flex items-center justify-center gap-4 pt-4">
                <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2 text-base" style={{
              backgroundColor: currentRank.color,
              color: 'white'
            }}>
                  <span>{currentRank.emoji}</span>
                  {currentRank.name}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1 px-3 py-2">
                  <TrendingUp className="h-4 w-4" />
                  {operatorStats?.execution_success_rate.toFixed(1)}% Success Rate
                </Badge>
              </div>}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-8">
        {/* Current Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-6 w-6 text-primary" />
                  Your Operator Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-primary/5 rounded-lg">
                    <CheckCircle className="h-6 w-6 mx-auto mb-2 text-green-500" />
                    <p className="text-2xl font-bold">{operatorStats?.verified_executions || 0}</p>
                    <p className="text-xs text-muted-foreground">Verified Executions</p>
                  </div>
                  <div className="text-center p-4 bg-destructive/5 rounded-lg">
                    <AlertTriangle className="h-6 w-6 mx-auto mb-2 text-destructive" />
                    <p className="text-2xl font-bold">{operatorStats?.failed_executions || 0}</p>
                    <p className="text-xs text-muted-foreground">Failed</p>
                  </div>
                  <div className="text-center p-4 bg-accent/10 rounded-lg">
                    <Target className="h-6 w-6 mx-auto mb-2 text-accent-foreground" />
                    <p className="text-2xl font-bold">{operatorStats?.execution_success_rate.toFixed(0)}%</p>
                    <p className="text-xs text-muted-foreground">Success Rate</p>
                  </div>
                  <div className="text-center p-4 bg-yellow-500/10 rounded-lg">
                    <Zap className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
                    <p className="text-2xl font-bold">{operatorStats?.execution_credits_balance || 0}</p>
                    <p className="text-xs text-muted-foreground">Credits Balance</p>
                  </div>
                </div>

                {/* Progress to Next Rank */}
                {nextRank && <div className="space-y-3 pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Progress to {nextRank.name}</span>
                      <span className="text-sm text-muted-foreground">{Math.round(calculateProgress())}%</span>
                    </div>
                    <Progress value={calculateProgress()} className="h-3" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>
                        Executions: {operatorStats?.verified_executions || 0}/{nextRank.min_verified_executions}
                      </span>
                      <span>
                        Success Rate: {operatorStats?.execution_success_rate.toFixed(1)}%/{nextRank.min_success_rate}%
                      </span>
                    </div>
                  </div>}
              </CardContent>
            </Card>
          </div>

          {/* Current Benefits */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Current Benefits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {currentRank?.benefits?.map((benefit, index) => <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{benefit}</span>
                    </div>)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="h-5 w-5" />
                  Decay Warning
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Inactive operators may experience rank decay. Complete at least one execution every 30 days to maintain your rank.
                </p>
                {currentRank && <p className="text-xs text-destructive mt-2">
                    Decay rate: {currentRank.decay_rate_percent}% per month of inactivity
                  </p>}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* All Ranks */}
        <div>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Trophy className="h-6 w-6 text-primary" />
            All Operator Ranks
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {allRanks.map(rank => {
            const isUnlocked = operatorStats && operatorStats.verified_executions >= rank.min_verified_executions && operatorStats.execution_success_rate >= rank.min_success_rate;
            const isCurrent = currentRank?.rank_level === rank.rank_level;
            return <Card key={rank.rank_level} className={`relative transition-all duration-300 hover:scale-105 ${isCurrent ? 'ring-2 ring-primary shadow-lg' : isUnlocked ? 'opacity-100' : 'opacity-60'}`}>
                  {isCurrent && <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-bold">
                      Current
                    </div>}
                  
                  <CardContent className="p-4 text-center">
                    <div className="mb-3 flex justify-center text-4xl">
                      {rank.emoji}
                    </div>
                    <h3 className="font-bold text-lg mb-1" style={{
                  color: isUnlocked ? rank.color : undefined
                }}>
                      {rank.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                      {rank.description}
                    </p>
                    
                    <div className="space-y-2 text-xs border-t pt-3">
                      <div className="flex items-center justify-between">
                        <span>Min Executions:</span>
                        <span className="font-bold">{rank.min_verified_executions}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Min Success Rate:</span>
                        <span className="font-bold">{rank.min_success_rate}%</span>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs font-medium mb-2">Benefits:</p>
                      <div className="space-y-1">
                        {rank.benefits?.slice(0, 2).map((benefit, idx) => <div key={idx} className="flex items-center gap-1 justify-center">
                            <Zap className="h-3 w-3 text-yellow-500" />
                            <span className="text-xs">{benefit}</span>
                          </div>)}
                        {rank.benefits && rank.benefits.length > 2 && <p className="text-xs text-muted-foreground">
                            +{rank.benefits.length - 2} more
                          </p>}
                      </div>
                    </div>
                  </CardContent>
                </Card>;
          })}
          </div>
        </div>

        {/* Execution Credits Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              Credits Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-500/10 rounded-lg">
                <Zap className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <p className="font-bold text-2xl">{operatorStats?.execution_credits_balance || 0}</p>
                <p className="text-sm text-muted-foreground">Available Balance</p>
              </div>
              <div className="text-center p-4 bg-yellow-500/10 rounded-lg">
                <Clock className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                <p className="font-bold text-2xl">{operatorStats?.execution_credits_pending || 0}</p>
                <p className="text-sm text-muted-foreground">Pending (7-day hold)</p>
              </div>
              <div className="text-center p-4 bg-primary/10 rounded-lg">
                <Trophy className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="font-bold text-2xl">{operatorStats?.execution_credits_lifetime || 0}</p>
                <p className="text-sm text-muted-foreground">Lifetime Earned</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>;
};
export default OperatorRanks;