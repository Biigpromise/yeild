
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Star, Users } from "lucide-react";
import { Task } from "@/services/taskService";

interface TaskCardProps {
  task: Task;
  onSubmit: (task: Task) => void;
  isSubmitted?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onSubmit, isSubmitted = false }) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "hard":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case "survey":
        return "text-blue-400";
      case "app_testing":
        return "text-green-400";
      case "content_creation":
        return "text-purple-400";
      case "social_media":
        return "text-pink-400";
      case "research":
        return "text-yellow-400";
      default:
        return "text-gray-400";
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold mb-2">{task.title}</CardTitle>
            <div className="flex items-center gap-2 mb-2">
              <Badge className={getDifficultyColor(task.difficulty)}>
                {task.difficulty}
              </Badge>
              <Badge variant="outline" className={getCategoryColor(task.category)}>
                {task.category}
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">{task.points}</div>
            <div className="text-xs text-muted-foreground">points</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {task.description}
        </p>
        
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {task.estimated_time && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {task.estimated_time}
            </div>
          )}
          {task.brand_name && (
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {task.brand_name}
            </div>
          )}
        </div>
        
        <div className="pt-2">
          <Button 
            onClick={() => onSubmit(task)} 
            className="w-full"
            disabled={isSubmitted}
          >
            {isSubmitted ? (
              <>
                <Star className="h-4 w-4 mr-2" />
                Submitted
              </>
            ) : (
              "Start Task"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
