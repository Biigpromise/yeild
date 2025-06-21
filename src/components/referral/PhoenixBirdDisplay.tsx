
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Flame, Trophy, Star } from 'lucide-react';

export const PhoenixBirdDisplay = () => {
  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 border-2 border-red-200">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <Crown className="h-8 w-8 text-red-600" />
            Phoenix Bird Badge
            <Crown className="h-8 w-8 text-red-600" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Phoenix Bird Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-32 h-32 bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500 rounded-full flex items-center justify-center shadow-2xl">
                <Flame className="h-16 w-16 text-white animate-pulse" />
              </div>
              <div className="absolute -top-2 -right-2">
                <Crown className="h-8 w-8 text-yellow-500" />
              </div>
              <div className="absolute -bottom-1 -left-1">
                <Star className="h-6 w-6 text-red-400" />
              </div>
              <div className="absolute -bottom-1 -right-1">
                <Star className="h-6 w-6 text-orange-400" />
              </div>
            </div>
          </div>

          {/* Badge Details */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              PHOENIX BIRD
            </h2>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              The ultimate referral achievement - rare, powerful, and legendary
            </p>
          </div>

          {/* Requirements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-center p-4 bg-white/80 rounded-lg border border-red-200">
              <Trophy className="h-6 w-6 mx-auto mb-2 text-red-600" />
              <div className="text-2xl font-bold text-red-600">100+</div>
              <div className="text-sm text-muted-foreground">Active Referrals</div>
            </div>
            <div className="text-center p-4 bg-white/80 rounded-lg border border-orange-200">
              <Star className="h-6 w-6 mx-auto mb-2 text-orange-600" />
              <div className="text-2xl font-bold text-orange-600">10,000+</div>
              <div className="text-sm text-muted-foreground">Total Points</div>
            </div>
          </div>

          {/* Special Benefits */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-center">Phoenix Privileges</h3>
            <div className="grid grid-cols-1 gap-2">
              <Badge className="bg-red-100 text-red-800 hover:bg-red-200 justify-center py-2">
                🔥 Legendary Status Recognition
              </Badge>
              <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200 justify-center py-2">
                💎 Premium Support Access
              </Badge>
              <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 justify-center py-2">
                🎯 Exclusive Phoenix Rewards
              </Badge>
              <Badge className="bg-red-100 text-red-800 hover:bg-red-200 justify-center py-2">
                👑 VIP Community Access
              </Badge>
            </div>
          </div>

          {/* Rarity Indicator */}
          <div className="text-center">
            <Badge className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-6 py-2 text-lg">
              ⭐ LEGENDARY RARITY ⭐
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
