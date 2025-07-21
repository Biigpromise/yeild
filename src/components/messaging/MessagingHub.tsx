
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Lock } from "lucide-react";

export const MessagingHub = () => {
  return (
    <div className="flex gap-4 p-4">
      <Card className="flex-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Messages
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Lock className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
          <p className="text-muted-foreground text-center">
            Direct messaging feature is currently under development. 
            Stay tuned for updates!
          </p>
          <Button disabled className="mt-4">
            Messages Coming Soon
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
