
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Flame, Trophy, Star } from 'lucide-react';
import { AnimatedPhoenixBadge } from './AnimatedPhoenixBadge';

export const PhoenixBirdDisplay = () => {
  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 border-2 border-red-200 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-100/50 via-orange-100/50 to-yellow-100/50" />
        <div className="absolute top-4 left-4 w-32 h-32 bg-orange-400/10 rounded-full blur-xl" />
        <div className="absolute bottom-4 right-4 w-24 h-24 bg-red-400/10 rounded-full blur-lg" />
        
        <CardHeader className="text-center relative z-10">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <Crown className="h-8 w-8 text-red-600 animate-pulse" />
            Phoenix Bird Badge
            <Crown className="h-8 w-8 text-red-600 animate-pulse" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 relative z-10">
          {/* Phoenix Badge Showcase */}
          <div className="flex justify-center">
            <div className="p-8">
              <AnimatedPhoenixBadge 
                size="xl"
                showName={true}
                referralCount={1000}
                isIdle={true}
              />
            </div>
          </div>

          {/* Badge Details */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              PHOENIX YEILDER
            </h2>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              The ultimate referral achievement - rare, powerful, and legendary. Only for elite YEILD members.
            </p>
          </div>

          {/* Requirements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-center p-6 bg-white/80 rounded-lg border border-red-200 backdrop-blur-sm">
              <Trophy className="h-8 w-8 mx-auto mb-3 text-red-600" />
              <div className="text-3xl font-bold text-red-600">1,000+</div>
              <div className="text-sm text-muted-foreground">Active Referrals</div>
            </div>
            <div className="text-center p-6 bg-white/80 rounded-lg border border-orange-200 backdrop-blur-sm">
              <Star className="h-8 w-8 mx-auto mb-3 text-orange-600" />
              <div className="text-3xl font-bold text-orange-600">Elite</div>
              <div className="text-sm text-muted-foreground">Status Unlocked</div>
            </div>
          </div>

          {/* Special Features */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-center">Phoenix Features</h3>
            <div className="grid grid-cols-1 gap-2">
              <Badge className="bg-red-100 text-red-800 hover:bg-red-200 justify-center py-2 backdrop-blur-sm">
                🔥 Continuous Flame Animation
              </Badge>
              <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200 justify-center py-2 backdrop-blur-sm">
                ✨ Interactive Hover Effects
              </Badge>
              <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 justify-center py-2 backdrop-blur-sm">
                👑 Elite Status Recognition
              </Badge>
              <Badge className="bg-red-100 text-red-800 hover:bg-red-200 justify-center py-2 backdrop-blur-sm">
                🎯 Exclusive Phoenix Rewards
              </Badge>
            </div>
          </div>

          {/* Rarity Indicator */}
          <div className="text-center">
            <Badge className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-8 py-3 text-lg shadow-xl">
              ⭐ LEGENDARY RARITY ⭐
            </Badge>
            <p className="text-xs text-muted-foreground mt-2">
              Less than 0.1% of users achieve Phoenix status
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
