
import React, { useState, useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { PublicProfileModal } from "@/components/PublicProfileModal";
import { usePosts } from '@/hooks/use-posts';
import { PostForm } from './PostForm';
import { PostItem } from './PostItem';
import { RefreshCw } from "lucide-react";

export const PostFeed: React.FC = () => {
  const {
    posts,
    loading,
    newPost,
    setNewPost,
    userId,
    handlePostSubmit,
    handleLikePost,
    incrementViewCount,
    refreshPosts
  } = usePosts();
  
  const [profileModalUserId, setProfileModalUserId] = useState<string | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const postRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    // Reset refs when posts change to avoid observing detached elements
    postRefs.current = postRefs.current.slice(0, posts.length);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const postId = (entry.target as HTMLDivElement).dataset.postId;
            if (postId) {
              incrementViewCount(postId);
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    const currentRefs = postRefs.current;
    currentRefs.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      currentRefs.forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, [posts, incrementViewCount]);

  const openProfile = (uId: string | null) => {
    if (!uId) return;
    setProfileModalUserId(uId);
    setProfileModalOpen(true);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshPosts();
    setRefreshing(false);
  };

  return (
    <div className="flex flex-col h-[600px] border rounded-lg">
      <div className="p-3 border-b bg-background flex items-center justify-between">
        <h3 className="font-semibold">Community Feed</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      
      <PostForm
        newPost={newPost}
        setNewPost={setNewPost}
        handlePostSubmit={handlePostSubmit}
        userId={userId}
      />
      <ScrollArea className="flex-1 p-4">
        {loading ? (
          <div className="flex justify-center p-8 text-muted-foreground">Loading feed...</div>
        ) : (
          <div className="space-y-6">
            {posts.map((post, index) => (
              <PostItem
                key={post.id}
                ref={el => { postRefs.current[index] = el; }}
                post={post}
                userId={userId}
                onLike={handleLikePost}
                onView={incrementViewCount}
                onProfileClick={openProfile}
              />
            ))}
            {posts.length === 0 && !loading && (
              <div className="text-center text-muted-foreground pt-12">No posts yet.</div>
            )}
          </div>
        )}
      </ScrollArea>
      <PublicProfileModal
        userId={profileModalUserId}
        isOpen={profileModalOpen}
        onOpenChange={setProfileModalOpen}
      />
    </div>
  );
};
