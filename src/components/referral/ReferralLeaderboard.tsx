import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Medal, Award, Crown, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface LeaderboardEntry {
  id: string;
  name: string;
  avatar_url?: string;
  referral_count: number;
  rank: number;
}

export const ReferralLeaderboard: React.FC = () => {
  const { user } = useAuth();
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, [user?.id]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      
      // Get top 10 referrers using total_referrals_count column
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, profile_picture_url, total_referrals_count')
        .gt('total_referrals_count', 0)
        .order('total_referrals_count', { ascending: false })
        .limit(10);

      if (error) throw error;

      const leaderboardData: LeaderboardEntry[] = (data || []).map((entry, index) => ({
        id: entry.id,
        name: entry.name || 'Anonymous',
        avatar_url: entry.profile_picture_url,
        referral_count: entry.total_referrals_count || 0,
        rank: index + 1
      }));

      setLeaders(leaderboardData);

      // Find user's rank
      if (user?.id) {
        const userEntry = leaderboardData.find(l => l.id === user.id);
        if (userEntry) {
          setUserRank(userEntry.rank);
        } else {
          // User not in top 10, calculate their rank
          const { data: userData } = await supabase
            .from('profiles')
            .select('total_referrals_count')
            .eq('id', user.id)
            .single();
          
          if (userData && userData.total_referrals_count > 0) {
            const { count: higherCount } = await supabase
              .from('profiles')
              .select('*', { count: 'exact', head: true })
              .gt('total_referrals_count', userData.total_referrals_count);
            
            setUserRank((higherCount || 0) + 1);
          }
        }
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Medal className="h-5 w-5 text-amber-600" />;
      default:
        return <Award className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white';
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800';
      case 3:
        return 'bg-gradient-to-r from-amber-500 to-orange-600 text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-muted" />
                <div className="flex-1 h-4 bg-muted rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Top Referrers
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {leaders.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Trophy className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p>Be the first on the leaderboard!</p>
            <p className="text-sm">Start inviting friends to climb the ranks.</p>
          </div>
        ) : (
          <>
            {leaders.map((leader) => {
              const isCurrentUser = leader.id === user?.id;
              return (
                <div
                  key={leader.id}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                    isCurrentUser 
                      ? 'bg-primary/10 border border-primary/30' 
                      : 'bg-muted/50 hover:bg-muted'
                  }`}
                >
                  <div className={`w-8 h-8 flex items-center justify-center rounded-full ${getRankBadgeColor(leader.rank)}`}>
                    {leader.rank <= 3 ? getRankIcon(leader.rank) : <span className="text-sm font-bold">{leader.rank}</span>}
                  </div>
                  
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={leader.avatar_url} />
                    <AvatarFallback>{leader.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium truncate ${isCurrentUser ? 'text-primary' : ''}`}>
                      {leader.name} {isCurrentUser && '(You)'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {leader.referral_count} referral{leader.referral_count !== 1 ? 's' : ''}
                    </p>
                  </div>
                  
                  {leader.rank <= 3 && (
                    <Badge className={getRankBadgeColor(leader.rank)}>
                      #{leader.rank}
                    </Badge>
                  )}
                </div>
              );
            })}
            
            {/* Show user's rank if not in top 10 */}
            {userRank && userRank > 10 && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/30">
                  <div className="w-8 h-8 flex items-center justify-center rounded-full bg-muted">
                    <span className="text-sm font-bold">{userRank}</span>
                  </div>
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <p className="font-medium text-primary">Your Rank</p>
                    <p className="text-xs text-muted-foreground">
                      Keep inviting to climb the leaderboard!
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
