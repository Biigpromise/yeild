import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Hash, MessageSquare } from "lucide-react";
import { ModernChatInterface } from "../chat/ModernChatInterface";
import { DirectMessagesInterface } from "./DirectMessagesInterface";

export const MessagingHub = () => {
  const [activeTab, setActiveTab] = useState("community");

  return (
    <div className="h-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
        <div className="px-4 pt-4 pb-0 border-b">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="community" className="flex items-center gap-2">
              <Hash className="h-4 w-4" />
              Community Chat
            </TabsTrigger>
            <TabsTrigger value="direct" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Direct Messages
            </TabsTrigger>
          </TabsList>
        </div>
        
        <div className="flex-1 overflow-hidden">
          <TabsContent value="community" className="h-full mt-0">
            <ModernChatInterface />
          </TabsContent>
          
          <TabsContent value="direct" className="h-full mt-0">
            <DirectMessagesInterface />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};