import React, { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { CreatePost } from './CreatePost';
import { PostItem } from './PostItem';

interface Post {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  media_url?: string;
  likes_count: number;
  reply_count: number;
  view_count: number;
  profiles: {
    name: string;
    profile_picture_url?: string;
  };
}

export const SocialFeed: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPosts();
    setupRealtimeSubscription();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          content,
          user_id,
          created_at,
          media_url,
          likes_count,
          reply_count,
          view_count,
          profiles:user_id (
            name,
            profile_picture_url
          )
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('social_posts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'posts'
        },
        async (payload) => {
          // Fetch the complete post with profile data
          const { data } = await supabase
            .from('posts')
            .select(`
              id,
              content,
              user_id,
              created_at,
              media_url,
              likes_count,
              reply_count,
              view_count,
              profiles:user_id (
                name,
                profile_picture_url
              )
            `)
            .eq('id', payload.new.id)
            .single();

          if (data) {
            setPosts(prev => [data, ...prev]);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'posts'
        },
        (payload) => {
          setPosts(prev => prev.map(post => 
            post.id === payload.new.id 
              ? { ...post, ...payload.new }
              : post
          ));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPosts();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading posts...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold mb-2">Join the Community</h3>
        <p className="text-muted-foreground">Sign in to share and interact with posts</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Create Post */}
      <CreatePost onPostCreated={fetchPosts} />

      {/* Refresh Button */}
      <div className="flex justify-center mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh Feed
        </Button>
      </div>

      {/* Posts Feed */}
      {posts.length === 0 ? (
        <Alert>
          <AlertDescription>
            No posts yet. Be the first to share something with the community!
          </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-0">
          {posts.map((post) => (
            <PostItem
              key={post.id}
              post={post}
              onPostUpdate={fetchPosts}
            />
          ))}
        </div>
      )}
    </div>
  );
};