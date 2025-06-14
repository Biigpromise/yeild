
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Star, Users, CheckCircle, AlertCircle } from "lucide-react";
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
        return "bg-green-100 text-green-800 border-green-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "hard":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case "survey":
        return "text-blue-500 bg-blue-50 border-blue-200";
      case "app_testing":
        return "text-green-500 bg-green-50 border-green-200";
      case "content_creation":
        return "text-purple-500 bg-purple-50 border-purple-200";
      case "social_media":
        return "text-pink-500 bg-pink-50 border-pink-200";
      case "research":
        return "text-yellow-500 bg-yellow-50 border-yellow-200";
      default:
        return "text-gray-500 bg-gray-50 border-gray-200";
    }
  };

  const isExpired = task.expires_at && new Date(task.expires_at) < new Date();
  const isInactive = task.status !== 'active';

  return (
    <Card className={`hover:shadow-lg transition-all ${
      isSubmitted ? 'bg-green-50/50 border-green-200' : 
      isExpired || isInactive ? 'bg-gray-50 border-gray-200 opacity-60' : 
      'hover:shadow-lg'
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold mb-2 flex items-center gap-2">
              {task.title}
              {isSubmitted && <CheckCircle className="h-4 w-4 text-green-600" />}
            </CardTitle>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge className={getDifficultyColor(task.difficulty)}>
                {task.difficulty}
              </Badge>
              <Badge variant="outline" className={getCategoryColor(task.category)}>
                {task.category}
              </Badge>
              {isExpired && (
                <Badge variant="outline" className="text-red-600 bg-red-50 border-red-200">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Expired
                </Badge>
              )}
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
        
        <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
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
          {task.expires_at && !isExpired && (
            <div className="flex items-center gap-1 text-orange-600">
              <AlertCircle className="h-3 w-3" />
              Expires: {new Date(task.expires_at).toLocaleDateString()}
            </div>
          )}
        </div>
        
        <div className="pt-2">
          <Button 
            onClick={() => onSubmit(task)} 
            className="w-full"
            disabled={isSubmitted || isExpired || isInactive}
            variant={isSubmitted ? "outline" : "default"}
          >
            {isSubmitted ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Task Submitted
              </>
            ) : isExpired ? (
              <>
                <AlertCircle className="h-4 w-4 mr-2" />
                Expired
              </>
            ) : isInactive ? (
              <>
                <AlertCircle className="h-4 w-4 mr-2" />
                Inactive
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
