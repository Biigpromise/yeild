import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Zap, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Campaign {
  id: string;
  title: string;
  description: string;
  budget: number;
  brand_id: string;
  logo_url?: string;
  converted_to_tasks: boolean;
  auto_convert_enabled: boolean;
}

interface CampaignToTaskConverterProps {
  campaign: Campaign;
  onConversionComplete: () => void;
}

export const CampaignToTaskConverter: React.FC<CampaignToTaskConverterProps> = ({
  campaign,
  onConversionComplete,
}) => {
  const [isConverting, setIsConverting] = useState(false);
  const [taskData, setTaskData] = useState({
    title: campaign.title,
    description: campaign.description,
    category: "Social Media",
    points: Math.min(Math.floor(campaign.budget), 100),
    estimated_time: "30 minutes",
    difficulty: "Medium"
  });

  const handleManualConversion = async () => {
    setIsConverting(true);
    try {
      const { data, error } = await supabase.rpc('auto_convert_campaign_to_tasks', {
        p_campaign_id: campaign.id,
        p_admin_id: (await supabase.auth.getUser()).data.user?.id,
        p_task_data: taskData
      });

      if (error) throw error;

      if (data && data.length > 0 && data[0].success) {
        toast.success("Campaign successfully converted to task!");
        onConversionComplete();
      } else {
        toast.error(data?.[0]?.message || "Conversion failed");
      }
    } catch (error) {
      console.error("Manual conversion error:", error);
      toast.error("Failed to convert campaign to task");
    } finally {
      setIsConverting(false);
    }
  };

  if (campaign.converted_to_tasks) {
    return (
      <Card className="border-success">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-success">
            <Zap className="h-5 w-5" />
            Already Converted to Task
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This campaign has already been converted to an active task.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Convert Campaign to Task
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant={campaign.auto_convert_enabled ? "default" : "secondary"}>
            {campaign.auto_convert_enabled ? "Auto-Convert Enabled" : "Manual Convert Only"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Task Title</Label>
            <Input
              id="title"
              value={taskData.title}
              onChange={(e) => setTaskData({...taskData, title: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select 
              value={taskData.category} 
              onValueChange={(value) => setTaskData({...taskData, category: value})}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Social Media">Social Media</SelectItem>
                <SelectItem value="Content Creation">Content Creation</SelectItem>
                <SelectItem value="Marketing">Marketing</SelectItem>
                <SelectItem value="Review">Review</SelectItem>
                <SelectItem value="Survey">Survey</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Task Description</Label>
          <Textarea
            id="description"
            value={taskData.description}
            onChange={(e) => setTaskData({...taskData, description: e.target.value})}
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="points">Points Award</Label>
            <Input
              id="points"
              type="number"
              min="1"
              max="500"
              value={taskData.points}
              onChange={(e) => setTaskData({...taskData, points: parseInt(e.target.value) || 0})}
            />
            <p className="text-xs text-muted-foreground">
              Campaign Budget: ₦{campaign.budget}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="time">Estimated Time</Label>
            <Select 
              value={taskData.estimated_time} 
              onValueChange={(value) => setTaskData({...taskData, estimated_time: value})}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15 minutes">15 minutes</SelectItem>
                <SelectItem value="30 minutes">30 minutes</SelectItem>
                <SelectItem value="1 hour">1 hour</SelectItem>
                <SelectItem value="2 hours">2 hours</SelectItem>
                <SelectItem value="1 day">1 day</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="difficulty">Difficulty</Label>
            <Select 
              value={taskData.difficulty} 
              onValueChange={(value) => setTaskData({...taskData, difficulty: value})}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Easy">Easy</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            This will create a live task that users can complete
          </div>
          <Button 
            onClick={handleManualConversion}
            disabled={isConverting}
            className="flex items-center gap-2"
          >
            {isConverting ? "Converting..." : "Convert to Task"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};