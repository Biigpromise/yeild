
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnnouncementManager } from "./content/AnnouncementManager";
import { PlatformConfigManager } from "./content/PlatformConfigManager";
import { ContentModerationQueue } from "./content/ContentModerationQueue";
import { Settings, Megaphone, Eye } from "lucide-react";

export const AdminContentManagement = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Content Management</h1>
          <p className="text-muted-foreground">
            Manage announcements, platform settings, and content moderation
          </p>
        </div>
      </div>

      <Tabs defaultValue="announcements" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="announcements" className="flex items-center gap-2">
            <Megaphone className="h-4 w-4" />
            Announcements
          </TabsTrigger>
          <TabsTrigger value="platform-config" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Platform Settings
          </TabsTrigger>
          <TabsTrigger value="moderation" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Content Moderation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="announcements">
          <AnnouncementManager />
        </TabsContent>

        <TabsContent value="platform-config">
          <PlatformConfigManager />
        </TabsContent>

        <TabsContent value="moderation">
          <ContentModerationQueue />
        </TabsContent>
      </Tabs>
    </div>
  );
};
