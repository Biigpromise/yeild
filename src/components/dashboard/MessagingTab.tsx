
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Clock } from "lucide-react";

export const MessagingTab = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Messages</h2>
        <p className="text-muted-foreground">
          Stay connected with your network through real-time messaging.
        </p>
      </div>
      
      <Card className="text-center py-12">
        <CardHeader>
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <MessageCircle className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-xl">Messages Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center gap-2 text-muted-foreground mb-4">
            <Clock className="w-4 h-4" />
            <span>This feature is under development</span>
          </div>
          <p className="text-muted-foreground max-w-md mx-auto">
            We're working hard to bring you an amazing messaging experience. 
            Check back soon for real-time chat functionality!
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
