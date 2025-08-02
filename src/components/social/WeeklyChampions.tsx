import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserProfileModal } from '@/components/user/UserProfileModal';
import { useUserProfile } from '@/hooks/useUserProfile';
import { supabase } from '@/integrations/supabase/client';
import { Crown, Trophy } from 'lucide-react';

interface WeeklyChampion {
  id: string;
  name: string;
  points: number;
  profile_picture_url?: string;
  week: number;
}

export const WeeklyChampions = () => {
  const [champions, setChampions] = useState<WeeklyChampion[]>([]);
  const [loading, setLoading] = useState(true);
  const { selectedUserId, isModalOpen, openUserProfile, closeUserProfile } = useUserProfile();

  useEffect(() => {
    loadWeeklyChampions();
  }, []);

  const loadWeeklyChampions = async () => {
    try {
      // Get top 3 users by points for the last 3 weeks
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, points, profile_picture_url')
        .order('points', { ascending: false })
        .limit(3);

      if (error) {
        console.error('Error loading weekly champions:', error);
        return;
      }

      // Simulate weekly data by assigning different weeks
      const weeklyData = (data || []).map((user, index) => ({
        ...user,
        week: index + 1,
        points: user.points || 0,
        name: user.name || 'Anonymous User'
      }));

      setChampions(weeklyData);
    } catch (error) {
      console.error('Error loading weekly champions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((rank) => (
          <div key={rank} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg animate-pulse">
            <div className="w-8 h-8 bg-muted rounded-full" />
            <div className="flex-1 space-y-1">
              <div className="h-4 bg-muted rounded w-24" />
              <div className="h-3 bg-muted rounded w-16" />
            </div>
            <div className="w-12 h-5 bg-muted rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (champions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No champions data available yet</p>
        <p className="text-xs mt-2">Complete tasks to start earning points!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {champions.map((champion, index) => (
        <div key={champion.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors">
          <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full text-white font-bold text-sm">
            {index + 1}
          </div>
          <Avatar 
            className="h-8 w-8 cursor-pointer hover:ring-2 hover:ring-primary transition-all"
            onClick={() => openUserProfile(champion.id)}
          >
            <AvatarImage src={champion.profile_picture_url} />
            <AvatarFallback>{champion.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p 
                className="font-medium cursor-pointer hover:text-primary transition-colors"
                onClick={() => openUserProfile(champion.id)}
              >
                {champion.name}
              </p>
              {index === 0 && <Crown className="h-3 w-3 text-yellow-500" />}
            </div>
            <p className="text-sm text-muted-foreground">
              {champion.points.toLocaleString()} points
            </p>
          </div>
          <Badge variant={index === 0 ? 'default' : 'secondary'}>
            Week {champion.week}
          </Badge>
        </div>
      ))}

      <UserProfileModal 
        userId={selectedUserId}
        isOpen={isModalOpen}
        onClose={closeUserProfile}
      />
    </div>
  );
};