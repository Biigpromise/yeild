
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BIRD_LEVELS } from '@/services/userService';
import { DollarSign, Users, Trophy, Crown, Star } from 'lucide-react';

export const BirdProgressionOnboarding: React.FC = () => {
  const earningPotentials = [
    { level: 'Dove', earning: '$50-100', description: 'Basic tasks and referrals' },
    { level: 'Hawk', earning: '$100-250', description: 'Premium tasks unlock' },
    { level: 'Eagle', earning: '$250-500', description: 'Exclusive opportunities' },
    { level: 'Falcon', earning: '$500-1000', description: 'Elite task access' },
    { level: 'Phoenix', earning: '$1000+', description: 'Legendary earning potential' },
  ];

  const getBirdIcon = (level: string) => {
    switch (level) {
      case 'Phoenix': return <Crown className="h-6 w-6 text-red-500" />;
      case 'Falcon': return <Trophy className="h-6 w-6 text-purple-500" />;
      case 'Eagle': return <Star className="h-6 w-6 text-amber-500" />;
      default: return <Users className="h-6 w-6 text-blue-500" />;
    }
  };

  const getBirdEmoji = (level: string) => {
    switch (level) {
      case 'Phoenix': return '🔥';
      case 'Falcon': return '🦅';
      case 'Eagle': return '🦅';
      case 'Hawk': return '🦅';
      default: return '🕊️';
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          🚀 Your Journey to Higher Earnings
        </CardTitle>
        <p className="text-muted-foreground mt-2">
          Climb the YEILD ladder by completing tasks and referring friends. Higher levels unlock better earning opportunities!
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Earning Potential Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {earningPotentials.map((item, index) => (
            <div key={item.level} className="relative">
              <Card className={`transition-all duration-300 hover:shadow-lg ${
                item.level === 'Phoenix' ? 'ring-2 ring-red-400 bg-gradient-to-br from-red-50 to-orange-50' : 
                item.level === 'Falcon' ? 'ring-2 ring-purple-400 bg-gradient-to-br from-purple-50 to-blue-50' :
                'bg-gradient-to-br from-blue-50 to-indigo-50'
              }`}>
                <CardContent className="p-4 text-center">
                  <div className="text-3xl mb-2">{getBirdEmoji(item.level)}</div>
                  <div className="font-semibold text-sm mb-1">{item.level}</div>
                  <div className="text-lg font-bold text-green-600 mb-2">
                    <DollarSign className="h-4 w-4 inline mr-1" />
                    {item.earning}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {item.description}
                  </div>
                  {item.level === 'Phoenix' && (
                    <Badge className="mt-2 bg-red-500 text-white text-xs">
                      LEGENDARY
                    </Badge>
                  )}
                </CardContent>
              </Card>
              {index < earningPotentials.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-2 transform -translate-y-1/2 text-gray-400">
                  →
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Progress Path */}
        <div className="bg-muted/50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Your Path to Success
          </h3>
          <div className="space-y-4">
            {BIRD_LEVELS.map((level, index) => (
              <div key={level.name} className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-background border-2 flex items-center justify-center">
                  <span className="text-xl">{getBirdEmoji(level.name)}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{level.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {level.min_referrals} referrals • {level.min_points} points
                    </span>
                  </div>
                  <Progress value={index === 0 ? 100 : 0} className="h-2" />
                </div>
                <div className="text-right">
                  <div className="font-semibold text-green-600">
                    {earningPotentials.find(e => e.level === level.name)?.earning || '$25-50'}
                  </div>
                  <div className="text-xs text-muted-foreground">per month</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Tips */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">💡 Quick Tips to Level Up:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Complete daily tasks consistently</li>
            <li>• Refer active friends and family</li>
            <li>• Focus on high-point tasks</li>
            <li>• Maintain good task completion rates</li>
            <li>• Engage with the community</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
