import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Task } from "@/services/taskService";
import { TaskSourceBadgeEnhanced } from "./TaskSourceBadgeEnhanced";
import { 
  Trophy, 
  Clock, 
  Users, 
  Target, 
  Briefcase,
  Star,
  Calendar,
  ExternalLink
} from "lucide-react";

interface TaskCardEnhancedProps {
  task: Task;
  isSubmitted: boolean;
  onTaskClick: (task: Task) => void;
}

export const TaskCardEnhanced: React.FC<TaskCardEnhancedProps> = ({
  task,
  isSubmitted,
  onTaskClick
}) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'bg-green-500/10 text-green-600 border border-green-500/20';
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-600 border border-yellow-500/20';
      case 'hard':
        return 'bg-red-500/10 text-red-600 border border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-600 border border-gray-500/20';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'social_media':
      case 'social media':
        return <Star className="h-4 w-4" />;
      case 'content_creation':
        return <Trophy className="h-4 w-4" />;
      case 'engagement':
        return <Target className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const hasSocialMediaLinks = task.social_media_links && 
    typeof task.social_media_links === 'object' && 
    Object.keys(task.social_media_links).length > 0;

  return (
    <Card 
      className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 border-2 hover:border-primary/50" 
      onClick={() => !isSubmitted && onTaskClick(task)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2 flex-1">
            {getCategoryIcon(task.category)}
            <Badge className={getDifficultyColor(task.difficulty)}>
              {task.difficulty}
            </Badge>
          </div>
          <div className="flex items-center gap-1 text-primary">
            <Trophy className="h-4 w-4" />
            <span className="font-bold text-sm">{task.points}</span>
          </div>
        </div>
        
        {/* Task Source Badge */}
        <div className="mb-2">
          <TaskSourceBadgeEnhanced 
            taskSource={task.task_source || 'platform'} 
            brandName={task.brand_name} 
            brandLogo={task.brand_logo_url} 
            originalBudget={task.original_budget} 
            points={task.points} 
            size="sm" 
            showBudget={task.task_source === 'brand_campaign'} 
          />
        </div>
        
        <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors line-clamp-2">
          {task.title}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm line-clamp-3 text-muted-foreground">
          {task.description}
        </p>
        
        {/* Social Media Links Preview */}
        {hasSocialMediaLinks && (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
            <p className="text-xs text-primary font-medium mb-1 flex items-center gap-1">
              <ExternalLink className="h-3 w-3" />
              Social Media Tasks Required
            </p>
            <p className="text-xs text-muted-foreground">
              Visit required social media pages. Click to see details.
            </p>
          </div>
        )}
        
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{task.estimated_time || 'Est. 10 min'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            <span>Open to all</span>
          </div>
        </div>
        
        <Button 
          className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
          disabled={isSubmitted}
        >
          {isSubmitted ? 'Completed' : 'Start Task'}
          {!isSubmitted && <Target className="h-4 w-4 ml-2" />}
        </Button>
      </CardContent>
    </Card>
  );
};