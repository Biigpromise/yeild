import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Clock, DollarSign, Users, CalendarDays, Briefcase } from 'lucide-react';
import { format, isAfter } from 'date-fns';
import { toast } from 'sonner';

interface TaskAnnouncement {
  id: string;
  title: string;
  description: string;
  task_category: string | null;
  estimated_launch_date: string | null;
  estimated_budget: number | null;
  target_audience: any;
  interest_count: number;
  brand_id: string;
  brand_profiles?: {
    company_name: string;
    logo_url: string | null;
  } | null;
  user_task_interests?: {
    id: string;
    interest_level: string;
  }[];
}

export const UpcomingTasksTab: React.FC = () => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<TaskAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showingInterest, setShowingInterest] = useState<string | null>(null);

  useEffect(() => {
    fetchAnnouncements();
  }, [user]);

  const fetchAnnouncements = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('brand_task_announcements')
        .select(`
          *,
          brand_profiles!inner(company_name, logo_url),
          user_task_interests(id, interest_level)
        `)
        .eq('status', 'published')
        .eq('is_active', true)
        .order('estimated_launch_date', { ascending: true, nullsFirst: false });

      if (error) throw error;

      setAnnouncements((data as any) || []);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      toast.error('Failed to load upcoming tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleShowInterest = async (announcementId: string, interestLevel: string = 'interested') => {
    if (!user) return;

    setShowingInterest(announcementId);

    try {
      const { error } = await supabase
        .from('user_task_interests')
        .insert({
          user_id: user.id,
          announcement_id: announcementId,
          interest_level: interestLevel
        });

      if (error) throw error;

      toast.success('Interest recorded! We\'ll notify you when this task launches.');
      await fetchAnnouncements(); // Refresh to show updated interest count
    } catch (error: any) {
      if (error.code === '23505') {
        toast.info('You\'ve already shown interest in this task');
      } else {
        console.error('Error showing interest:', error);
        toast.error('Failed to record interest');
      }
    } finally {
      setShowingInterest(null);
    }
  };

  const hasUserShownInterest = (announcement: TaskAnnouncement) => {
    return announcement.user_task_interests && announcement.user_task_interests.length > 0;
  };

  const getCategoryColor = (category: string | null) => {
    switch (category) {
      case 'social_media': return 'bg-blue-500/20 text-blue-400';
      case 'content_creation': return 'bg-purple-500/20 text-purple-400';
      case 'testing': return 'bg-green-500/20 text-green-400';
      case 'research': return 'bg-yellow-500/20 text-yellow-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-background/50 border-border animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded mb-4"></div>
              <div className="h-3 bg-muted rounded mb-2"></div>
              <div className="h-3 bg-muted rounded w-3/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (announcements.length === 0) {
    return (
      <Card className="bg-background/50 border-border">
        <CardContent className="p-8 text-center">
          <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Upcoming Tasks</h3>
          <p className="text-muted-foreground">
            Brands haven't announced any upcoming tasks yet. Check back soon!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Upcoming Tasks</h2>
          <p className="text-sm text-muted-foreground">
            Show interest in tasks before they launch
          </p>
        </div>
        <Badge variant="secondary" className="bg-primary/20 text-primary">
          {announcements.length} announcements
        </Badge>
      </div>

      <div className="space-y-4">
        {announcements.map((announcement) => (
          <Card key={announcement.id} className="bg-background/50 border-border hover:border-primary/30 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  {announcement.brand_profiles?.logo_url ? (
                    <img 
                      src={announcement.brand_profiles.logo_url} 
                      alt={announcement.brand_profiles.company_name}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                      <Briefcase className="h-5 w-5 text-primary" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold text-foreground">{announcement.title}</h3>
                      {announcement.task_category && (
                        <Badge className={getCategoryColor(announcement.task_category)}>
                          {announcement.task_category.replace('_', ' ')}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      by {announcement.brand_profiles?.company_name || 'Brand'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                  <Heart className="h-4 w-4" />
                  <span>{announcement.interest_count}</span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <p className="text-foreground mb-4 line-clamp-2">
                {announcement.description}
              </p>

              <div className="flex flex-wrap gap-4 mb-4 text-sm text-muted-foreground">
                {announcement.estimated_launch_date && (
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>
                      Launching {format(new Date(announcement.estimated_launch_date), 'MMM d, yyyy')}
                    </span>
                  </div>
                )}
                {announcement.estimated_budget && (
                  <div className="flex items-center space-x-1">
                    <DollarSign className="h-4 w-4" />
                    <span>~${announcement.estimated_budget}</span>
                  </div>
                )}
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{announcement.interest_count} interested</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  {hasUserShownInterest(announcement) ? (
                    <Badge variant="secondary" className="bg-primary/20 text-primary">
                      ✓ Interested
                    </Badge>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleShowInterest(announcement.id, 'interested')}
                        disabled={showingInterest === announcement.id}
                        className="text-xs"
                      >
                        {showingInterest === announcement.id ? 'Adding...' : 'Show Interest'}
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleShowInterest(announcement.id, 'very_interested')}
                        disabled={showingInterest === announcement.id}
                        className="text-xs bg-primary/20 hover:bg-primary/30 text-primary border-primary/30"
                      >
                        Very Interested
                      </Button>
                    </>
                  )}
                </div>
                
                {announcement.estimated_launch_date && isAfter(new Date(announcement.estimated_launch_date), new Date()) && (
                  <Badge variant="outline" className="text-xs border-yellow-500/30 text-yellow-400">
                    Coming Soon
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};