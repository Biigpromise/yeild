import React from "react";
import { MessagingHub } from "@/components/messaging/MessagingHub";

export const MessagingTab = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Messages</h2>
        <p className="text-muted-foreground">
          Stay connected with your network through real-time messaging.
        </p>
      </div>
      
      <MessagingHub />
    </div>
  );
};