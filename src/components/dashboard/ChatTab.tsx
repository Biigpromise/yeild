
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Clock } from "lucide-react";

export const ChatTab = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Messages</h2>
        <p className="text-muted-foreground">
          Stay connected with your network through real-time messaging and group chats.
        </p>
      </div>
      
      <Card className="h-[400px] flex items-center justify-center">
        <CardContent className="text-center">
          <Clock className="h-16 w-16 mx-auto mb-4 text-yeild-yellow" />
          <h3 className="text-2xl font-bold mb-2">Coming Soon</h3>
          <p className="text-muted-foreground mb-4">
            We're working hard to bring you an amazing messaging experience.
          </p>
          <p className="text-sm text-muted-foreground">
            Stay tuned for updates!
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
