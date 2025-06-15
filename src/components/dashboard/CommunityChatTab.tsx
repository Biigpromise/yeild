import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CommunityChat } from "@/components/community/CommunityChat";
import { PostFeed } from "@/components/posts/PostFeed";
import { MessageCircle } from "lucide-react";

export const CommunityChatTab = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Community Feed
        </CardTitle>
      </CardHeader>
      <CardContent>
        <PostFeed />
      </CardContent>
    </Card>
  );
};
