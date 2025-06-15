
import React, { useState, useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PublicProfileModal } from "@/components/PublicProfileModal";
import { usePosts } from '@/hooks/use-posts';
import { PostForm } from './PostForm';
import { PostItem } from './PostItem';

export const PostFeed: React.FC = () => {
  const {
    posts,
    loading,
    newPost,
    setNewPost,
    userId,
    handlePostSubmit,
    handleLikePost,
    incrementViewCount
  } = usePosts();
  
  const [profileModalUserId, setProfileModalUserId] = useState<string | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

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

  return (
    <div className="flex flex-col h-[600px] border rounded-lg">
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
                handleLikePost={handleLikePost}
                openProfile={openProfile}
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
