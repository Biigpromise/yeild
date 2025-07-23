
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Search, TrendingUp, Users, Calendar, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { SocialFeed } from './SocialFeed';
import { UserCard } from './UserCard';

interface UserProfile {
  id: string;
  name: string;
  profile_picture_url?: string;
  followers_count: number;
  following_count: number;
  tasks_completed: number;
  points: number;
  isFollowing?: boolean;
}

export const SocialHub: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('feed');
  const [searchQuery, setSearchQuery] = useState('');
  const [discoveryUsers, setDiscoveryUsers] = useState<UserProfile[]>([]);
  const [followingUsers, setFollowingUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === 'discover') {
      fetchDiscoveryUsers();
    } else if (activeTab === 'following') {
      fetchFollowingUsers();
    }
  }, [activeTab]);

  const fetchDiscoveryUsers = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Get users with most followers and activity
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, profile_picture_url, followers_count, following_count, tasks_completed, points')
        .neq('id', user.id)
        .order('followers_count', { ascending: false })
        .order('points', { ascending: false })
        .limit(20);

      if (error) throw error;

      // Check follow status for each user
      if (data) {
        const userIds = data.map(u => u.id);
        const { data: followData } = await supabase
          .from('user_followers')
          .select('following_id')
          .eq('follower_id', user.id)
          .in('following_id', userIds);

        const followingIds = new Set(followData?.map(f => f.following_id) || []);
        
        const usersWithFollowStatus = data.map(user => ({
          ...user,
          isFollowing: followingIds.has(user.id)
        }));

        setDiscoveryUsers(usersWithFollowStatus);
      } else {
        setDiscoveryUsers([]);
      }
    } catch (error) {
      console.error('Error fetching discovery users:', error);
      setError('Failed to load discovery users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowingUsers = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);
    
    try {
      // First get following relationships
      const { data: followData, error: followError } = await supabase
        .from('user_followers')
        .select('following_id')
        .eq('follower_id', user.id);

      if (followError) throw followError;

      if (!followData || followData.length === 0) {
        setFollowingUsers([]);
        setLoading(false);
        return;
      }

      // Then get profile data for followed users
      const followingIds = followData.map(f => f.following_id);
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, profile_picture_url, followers_count, following_count, tasks_completed, points')
        .in('id', followingIds);

      if (profilesError) throw profilesError;

      const followingUsersData = profilesData?.map(profile => ({
        ...profile,
        isFollowing: true
      })) || [];

      setFollowingUsers(followingUsersData);
    } catch (error) {
      console.error('Error fetching following users:', error);
      setError('Failed to load following users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFollowUpdate = () => {
    if (activeTab === 'discover') {
      fetchDiscoveryUsers();
    } else if (activeTab === 'following') {
      fetchFollowingUsers();
    }
  };

  const handleRetry = () => {
    setError(null);
    if (activeTab === 'discover') {
      fetchDiscoveryUsers();
    } else if (activeTab === 'following') {
      fetchFollowingUsers();
    }
  };

  // Show error state
  if (error) {
    return (
      <div className="h-full bg-background p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={handleRetry}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="h-full bg-background">
      <div className="max-w-6xl mx-auto h-full">
        <div className="p-3 md:p-6">
          <div className="mb-4 md:mb-6">
            <h1 className="text-xl md:text-2xl font-bold mb-2">Social Hub</h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Connect with the community, share your journey, and discover amazing content.
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 mb-4 md:mb-6">
              <TabsTrigger value="feed" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
                <Calendar className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Feed</span>
              </TabsTrigger>
              <TabsTrigger value="discover" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
                <TrendingUp className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Discover</span>
              </TabsTrigger>
              <TabsTrigger value="following" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
                <Users className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Following</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="feed" className="mt-0">
              <SocialFeed />
            </TabsContent>

            <TabsContent value="discover" className="mt-0">
              <div className="space-y-4">
                {/* Search Bar */}
                <div className="p-3 md:p-4 bg-card rounded-lg border">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Discovery Grid */}
                <div className="grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-2">
                  {loading ? (
                    <div className="col-span-full text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-muted-foreground">Finding amazing users...</p>
                    </div>
                  ) : discoveryUsers.length === 0 ? (
                    <div className="col-span-full text-center py-8">
                      <p className="text-muted-foreground">No users found</p>
                    </div>
                  ) : (
                    discoveryUsers
                      .filter(u => 
                        !searchQuery || 
                        u.name?.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map(userProfile => (
                        <UserCard
                          key={userProfile.id}
                          profile={userProfile}
                          isFollowing={userProfile.isFollowing}
                          onFollowUpdate={handleFollowUpdate}
                        />
                      ))
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="following" className="mt-0">
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading your following...</p>
                  </div>
                ) : followingUsers.length === 0 ? (
                  <div className="p-6 md:p-8 text-center bg-card rounded-lg border">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Following Yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start following users to see their updates here.
                    </p>
                    <Button onClick={() => setActiveTab('discover')}>
                      Discover Users
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-2">
                    {followingUsers.map(userProfile => (
                      <UserCard
                        key={userProfile.id}
                        profile={userProfile}
                        isFollowing={true}
                        onFollowUpdate={handleFollowUpdate}
                      />
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};
