
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Post } from '@/types/post';
import { toast } from 'sonner';

export const usePosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        console.log('User found:', user.id);
      }
    };
    fetchUser();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      console.log('Fetching posts...');
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles!posts_user_id_fkey (
            id,
            name,
            profile_picture_url
          ),
          post_likes (
            user_id
          ),
          post_reactions (
            user_id,
            reaction_type
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching posts:', error);
        throw error;
      }
      
      console.log('Fetched posts successfully:', data);
      
      // Ensure all posts have proper profile data and reaction counts
      const postsWithData = data?.map(post => ({
        ...post,
        profiles: post.profiles ? {
          id: post.profiles.id || post.user_id,
          name: post.profiles.name || 'User',
          profile_picture_url: post.profiles.profile_picture_url || null
        } : {
          id: post.user_id,
          name: 'User',
          profile_picture_url: null
        },
        // Calculate reaction counts
        likes_from_reactions: post.post_reactions?.filter(r => r.reaction_type === 'like').length || 0,
        dislikes_from_reactions: post.post_reactions?.filter(r => r.reaction_type === 'dislike').length || 0
      })) || [];
      
      setPosts(postsWithData);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handlePostSubmit = async (e: React.FormEvent, mediaUrl?: string): Promise<void> => {
    e.preventDefault();
    console.log('handlePostSubmit called', { newPost: newPost.trim(), mediaUrl, userId });
    
    if (!newPost.trim() && !mediaUrl) {
      toast.error('Please write something or add media');
      throw new Error('No content provided');
    }
    
    if (!userId) {
      toast.error('Please log in to post');
      throw new Error('User not authenticated');
    }

    try {
      console.log('Inserting post into database...');
      const postData = {
        content: newPost.trim(),
        user_id: userId,
        media_url: mediaUrl || null
      };
      
      console.log('Post data to insert:', postData);

      const { data, error } = await supabase
        .from('posts')
        .insert([postData])
        .select();

      if (error) {
        console.error('Error creating post:', error);
        throw error;
      }

      console.log('Post created successfully:', data);
      setNewPost('');
      await fetchPosts();
      toast.success('Post created successfully!');
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
      throw error;
    }
  };

  const handleLikePost = async (post: Post) => {
    if (!userId) return;

    const existingLike = post.post_likes?.find(like => like.user_id === userId);

    try {
      if (existingLike) {
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', userId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('post_likes')
          .insert([
            {
              post_id: post.id,
              user_id: userId
            }
          ]);

        if (error) throw error;
      }

      await fetchPosts();
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like');
    }
  };

  const incrementViewCount = async (postId: string) => {
    if (!userId) return;
    
    try {
      console.log('Incrementing view count for post:', postId);
      
      // Use the updated function that prevents duplicate views
      const { error } = await supabase.rpc('increment_post_view', {
        post_id_to_inc: postId,
        user_id_param: userId
      });

      if (error) {
        console.error('Error incrementing view count:', error);
      } else {
        console.log('View count incremented successfully for post:', postId);
        // Refresh posts to show updated view count
        await fetchPosts();
      }
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  };

  const refreshPosts = async () => {
    await fetchPosts();
  };

  return {
    posts,
    loading,
    newPost,
    setNewPost,
    userId,
    handlePostSubmit,
    handleLikePost,
    incrementViewCount,
    refreshPosts
  };
};
