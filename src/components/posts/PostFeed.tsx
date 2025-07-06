
import React, { useState } from "react";
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

  const handlePostDeleted = () => {
    refreshPosts();
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="sticky top-0 z-10 p-4 bg-background/80 backdrop-blur-md border-b flex items-center justify-between">
        <h3 className="font-semibold text-lg">Community Feed</h3>
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
      
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center p-8 text-muted-foreground">Loading feed...</div>
        ) : (
          <div className="max-w-2xl mx-auto">
            {posts.map((post) => (
              <PostItem
                key={post.id}
                post={post}
                userId={userId}
                onView={incrementViewCount}
                onProfileClick={openProfile}
                onPostDeleted={handlePostDeleted}
              />
            ))}
            {posts.length === 0 && !loading && (
              <div className="text-center text-muted-foreground pt-12">No posts yet.</div>
            )}
          </div>
        )}
      </div>
      
      <PublicProfileModal
        userId={profileModalUserId}
        isOpen={profileModalOpen}
        onOpenChange={setProfileModalOpen}
      />
    </div>
  );
};
