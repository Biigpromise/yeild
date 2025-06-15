
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CommunityChat } from "@/components/community/CommunityChat";
import { MessageCircle } from "lucide-react";

export const CommunityChatTab = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Global Community Chat
        </CardTitle>
      </CardHeader>
      <CardContent>
        <CommunityChat />
      </CardContent>
    </Card>
  );
};
