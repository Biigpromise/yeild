
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Award, Building2, Calendar } from "lucide-react";
import { TaskSocialMediaDisplay } from "./TaskSocialMediaDisplay";

interface Task {
  id: string;
  title: string;
  description: string;
  points: number;
  category: string;
  difficulty: string;
  estimated_time?: string;
  brand_name?: string;
  brand_logo_url?: string;
  expires_at?: string;
  social_media_links?: Record<string, string> | null;
}

interface TaskCardProps {
  task: Task;
  onTaskClick?: (task: Task) => void;
  hasSubmitted?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  onTaskClick,
  hasSubmitted = false 
}) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatExpiryDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-200 cursor-pointer group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg font-semibold group-hover:text-blue-600 transition-colors">
            {task.title}
          </CardTitle>
          <div className="flex items-center gap-1 text-yellow-600 font-semibold">
            <Award className="h-4 w-4" />
            <span>{task.points}</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-2">
          <Badge variant="secondary" className="text-xs">
            {task.category}
          </Badge>
          <Badge className={`text-xs ${getDifficultyColor(task.difficulty)}`}>
            {task.difficulty}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600 line-clamp-3">
          {task.description}
        </p>

        <div className="space-y-2 text-xs text-gray-500">
          {task.estimated_time && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{task.estimated_time}</span>
            </div>
          )}
          
          {task.brand_name && (
            <div className="flex items-center gap-1">
              <Building2 className="h-3 w-3" />
              <span>{task.brand_name}</span>
            </div>
          )}
          
          {task.expires_at && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>Expires: {formatExpiryDate(task.expires_at)}</span>
            </div>
          )}
        </div>

        {/* Social Media Links - Make sure they're always visible */}
        <TaskSocialMediaDisplay 
          socialLinks={task.social_media_links}
          taskTitle={task.title}
        />

        <div className="pt-2">
          <Button 
            onClick={() => onTaskClick?.(task)}
            className="w-full"
            disabled={hasSubmitted}
            variant={hasSubmitted ? "secondary" : "default"}
          >
            {hasSubmitted ? "Submitted" : "Start Task"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
