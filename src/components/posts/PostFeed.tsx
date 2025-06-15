
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { PublicProfileModal } from "@/components/PublicProfileModal";

type Profile = {
  id: string;
  name: string | null;
  profile_picture_url?: string | null;
};

type Post = {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  profile: Profile | null;
};

const OFFENSIVE_WORDS = [
  'sex', 'fuck', 'shit', 'bitch', 'asshole', 'dick', 'pussy', 'cunt', 'nigger', 'fag', 'slut'
];

function containsProfanity(text: string) {
  const lowerText = text.toLowerCase();
  return OFFENSIVE_WORDS.some(word => lowerText.includes(word));
}

export const PostFeed: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();

  // Profile modal state
  const [profileModalUserId, setProfileModalUserId] = useState<string | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // Get current user
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("PostFeed: Error getting user:", error.message);
      }
      setUserId(data?.user?.id ?? null);
    })();
  }, []);

  // Fetch posts with user profile info
  const fetchPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("posts")
      .select("*, profile:profiles(id, name, profile_picture_url)")
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
  };

  useEffect(() => {
    fetchPosts();
    // Optionally: realtime subscription for new posts
    const channel = supabase
      .channel("public:posts")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "posts" },
        (payload) => {
          console.log("Realtime event received, refetching posts.", payload);
          fetchPosts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line
  }, []);

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
      // fetchPosts(); // Not needed if realtime enabled
    }
  };

  const openProfile = (uId: string | null) => {
    if (!uId) return;
    setProfileModalUserId(uId);
    setProfileModalOpen(true);
  };

  return (
    <div className="flex flex-col h-[600px] border rounded-lg">
      <div className="p-4 border-b bg-muted">
        <form onSubmit={handlePostSubmit} className="flex gap-2">
          <Input
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="What's on your mind?"
            disabled={!userId}
            autoComplete="off"
          />
          <Button type="submit" disabled={!userId || newPost.trim() === ""}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
      <ScrollArea className="flex-1 p-4">
        {loading ? (
          <div className="flex justify-center p-8 text-muted-foreground">Loading feed...</div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <div
                key={post.id}
                className="border-b pb-4 last:border-b-0 flex gap-3"
              >
                <button
                  type="button"
                  className="outline-none focus:ring-2 rounded-full"
                  onClick={() => openProfile(post.user_id)}
                  tabIndex={0}
                  aria-label={`View profile of ${post.profile?.name ?? "User"}`}
                >
                  <Avatar className="h-10 w-10 hover:scale-105 transition">
                    <AvatarImage
                      src={
                        post.profile?.profile_picture_url ||
                        `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(post.profile?.name || 'U')}`
                      }
                      alt={post.profile?.name || ""}
                    />
                    <AvatarFallback>
                      {(post.profile?.name || "U").charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex gap-3 items-center">
                    <button
                      type="button"
                      className="text-sm font-semibold hover:underline hover:text-primary focus:outline-none"
                      style={{ textAlign: "left" }}
                      onClick={() => openProfile(post.user_id)}
                    >
                      {post.profile?.name || "Anonymous"}
                    </button>
                    <span className="text-xs opacity-50">
                      {new Date(post.created_at).toLocaleString([], {
                        year: "2-digit",
                        month: "short",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="mt-1 text-base break-words whitespace-pre-line">
                    {post.content}
                  </div>
                </div>
              </div>
            ))}
            {posts.length === 0 && (
              <div className="text-center text-muted-foreground pt-12">No posts yet.</div>
            )}
          </div>
        )}
      </ScrollArea>
      {/* Profile Modal */}
      <PublicProfileModal
        userId={profileModalUserId}
        isOpen={profileModalOpen}
        onOpenChange={setProfileModalOpen}
      />
    </div>
  );
};
