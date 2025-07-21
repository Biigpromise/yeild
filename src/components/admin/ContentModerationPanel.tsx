import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Eye, Trash2, Flag, MessageSquare, Image, Video } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface ContentItem {
  id: string;
  type: 'post' | 'story' | 'message';
  content: string;
  media_url?: string;
  user_id: string;
  created_at: string;
  reports_count?: number;
  profiles: {
    name: string;
    email: string;
    profile_picture_url?: string;
  };
}

export const ContentModerationPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState('posts');
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'flagged' | 'recent'>('all');

  useEffect(() => {
    fetchContent();
  }, [activeTab, filter]);

  const fetchContent = async () => {
    setLoading(true);
    try {
      let query;
      
      if (activeTab === 'posts') {
        query = supabase
          .from('posts')
          .select(`
            id,
            content,
            media_url,
            user_id,
            created_at,
            profiles:user_id (
              name,
              email,
              profile_picture_url
            )
          `);
      } else if (activeTab === 'stories') {
        query = supabase
          .from('stories')
          .select(`
            id,
            caption as content,
            media_url,
            user_id,
            created_at,
            profiles:user_id (
              name,
              email,
              profile_picture_url
            )
          `);
      } else {
        query = supabase
          .from('messages')
          .select(`
            id,
            content,
            media_url,
            user_id,
            created_at,
            profiles:user_id (
              name,
              email,
              profile_picture_url
            )
          `);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const contentWithType = data?.map(item => ({
        ...item,
        type: activeTab.slice(0, -1) as 'post' | 'story' | 'message'
      })) || [];

      setContent(contentWithType);
    } catch (error) {
      console.error('Error fetching content:', error);
      toast.error('Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const deleteContent = async (item: ContentItem) => {
    try {
      const tableName = item.type === 'post' ? 'posts' : 
                       item.type === 'story' ? 'stories' : 'messages';
      
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', item.id);

      if (error) throw error;

      setContent(prev => prev.filter(c => c.id !== item.id));
      toast.success(`${item.type} deleted successfully`);
    } catch (error) {
      console.error('Error deleting content:', error);
      toast.error('Failed to delete content');
    }
  };

  const flagContent = async (item: ContentItem) => {
    try {
      const { error } = await supabase
        .from('fraud_flags')
        .insert({
          flag_type: 'inappropriate_content',
          user_id: item.user_id,
          flag_reason: `Inappropriate ${item.type} content flagged by admin`,
          evidence: {
            content_id: item.id,
            content_type: item.type,
            content: item.content,
            media_url: item.media_url
          },
          severity: 'medium'
        });

      if (error) throw error;
      toast.success('Content flagged successfully');
    } catch (error) {
      console.error('Error flagging content:', error);
      toast.error('Failed to flag content');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Content Moderation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="stories">Stories</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
          </TabsList>

          <div className="flex gap-2 my-4">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All Content
            </Button>
            <Button
              variant={filter === 'flagged' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('flagged')}
            >
              Flagged Only
            </Button>
            <Button
              variant={filter === 'recent' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('recent')}
            >
              Recent (24h)
            </Button>
          </div>

          <TabsContent value={activeTab} className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading content...</p>
              </div>
            ) : content.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No content found
              </div>
            ) : (
              content.map((item) => (
                <Card key={item.id} className="p-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex gap-3 flex-1">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={item.profiles.profile_picture_url} />
                        <AvatarFallback>
                          {item.profiles.name?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{item.profiles.name}</span>
                          <span className="text-sm text-muted-foreground">
                            {item.profiles.email}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {item.type}
                          </Badge>
                        </div>

                        <p className="text-sm text-muted-foreground mb-2">
                          {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                        </p>

                        {item.content && (
                          <p className="text-sm mb-2 whitespace-pre-wrap">
                            {item.content}
                          </p>
                        )}

                        {item.media_url && (
                          <div className="mb-2">
                            {item.media_url.includes('.mp4') || item.media_url.includes('.webm') ? (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Video className="h-4 w-4" />
                                Video attachment
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Image className="h-4 w-4" />
                                Image attachment
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => flagContent(item)}
                      >
                        <Flag className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteContent(item)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};