
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Post } from '@/types/post';

const OFFENSIVE_WORDS = [
  'sex', 'fuck', 'shit', 'bitch', 'asshole', 'dick', 'pussy', 'cunt', 'nigger', 'fag', 'slut'
];

function containsProfanity(text: string) {
  const lowerText = text.toLowerCase();
  return OFFENSIVE_WORDS.some(word => lowerText.includes(word));
}

export const usePosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();
  const viewedPostsRef = useRef(new Set<string>());

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) console.error("usePosts: Error getting user:", error.message);
      setUserId(data?.user?.id ?? null);
    })();
  }, []);

  const fetchPosts = useCallback(async () => {
    const { data, error } = await supabase
      .from("posts")
      .select(`
        *, 
        profile:profiles(id, name, profile_picture_url), 
        post_likes(user_id),
        post_replies(id, post_id, user_id, content, created_at, profile:profiles(id, name, profile_picture_url))
      `)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setPosts(data as Post[]);
    } else {
      if (error) console.error("Error fetching posts:", error);
      toast({
        title: "Error",
        description: "Could not load posts.",
        variant: "destructive",
      });
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchPosts();
    const channel = supabase
      .channel("public-posts-feed-refactored")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "posts" },
        () => fetchPosts()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "post_likes" },
        () => fetchPosts()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "post_replies" },
        () => fetchPosts()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchPosts]);

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || newPost.trim() === "") return;
    if (containsProfanity(newPost)) {
      toast({
        title: "Post Blocked",
        description: "Your post contains inappropriate language and cannot be published.",
        variant: "destructive"
      });
      return;
    }
    const { error } = await supabase
      .from("posts")
      .insert({ user_id: userId, content: newPost });
    if (error) {
      console.error("Error publishing post:", error);
      toast({
        title: "Error",
        description: `Failed to publish your post: ${error.message}`,
        variant: "destructive"
      });
    } else {
      setNewPost("");
    }
  };
  
  const handleLikePost = async (post: Post) => {
    if (!userId) {
      toast({ description: "You need to be logged in to like a post." });
      return;
    }
    const hasLiked = post.post_likes?.some(like => like.user_id === userId);
  
    const originalPosts = posts;
    setPosts(currentPosts => 
      currentPosts.map(p => {
        if (p.id === post.id) {
          return {
            ...p,
            likes_count: hasLiked ? p.likes_count - 1 : p.likes_count + 1,
            post_likes: hasLiked 
              ? p.post_likes.filter(like => like.user_id !== userId)
              : [...(p.post_likes || []), { user_id: userId }]
          };
        }
        return p;
      })
    );
  
    if (hasLiked) {
      const { error } = await supabase
        .from('post_likes')
        .delete()
        .match({ post_id: post.id, user_id: userId });
      if (error) {
        toast({ variant: 'destructive', description: "Couldn't unlike post. " + error.message });
        setPosts(originalPosts);
      }
    } else {
      const { error } = await supabase
        .from('post_likes')
        .insert({ post_id: post.id, user_id: userId });
      if (error) {
        toast({ variant: 'destructive', description: "Couldn't like post. " + error.message });
        setPosts(originalPosts);
      }
    }
  };

  const incrementViewCount = useCallback(async (postId: string) => {
    if (viewedPostsRef.current.has(postId) || !userId) return;
    viewedPostsRef.current.add(postId);
    
    const { error } = await supabase.rpc('increment_post_view', { 
      post_id_to_inc: postId, 
      user_id_param: userId 
    });
    if (error) {
      console.error('Failed to increment view count:', error.message);
    } else {
      // Refresh posts to get updated view count
      fetchPosts();
    }
  }, [userId, fetchPosts]);

  return {
    posts,
    loading,
    newPost,
    setNewPost,
    userId,
    handlePostSubmit,
    handleLikePost,
    incrementViewCount
  };
};
