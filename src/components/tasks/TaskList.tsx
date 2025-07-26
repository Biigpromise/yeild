
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Award, Users } from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
  timeEstimate: string;
  category: string;
  participantCount?: number;
}

interface TaskListProps {
  tasks: Task[];
  onTaskSelect: (task: Task) => void;
}

export const TaskList: React.FC<TaskListProps> = ({ tasks, onTaskSelect }) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'hard':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  return (
    <div className="grid gap-4">
      {tasks.map((task) => (
        <Card key={task.id} className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-all duration-200">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg font-semibold text-white">{task.title}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge className={getDifficultyColor(task.difficulty)}>
                  {task.difficulty}
                </Badge>
                <Badge variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                  {task.category}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 mb-4 line-clamp-2">{task.description}</p>
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-1">
                  <Award className="h-4 w-4 text-yellow-500" />
                  <span className="text-yellow-400 font-medium">{task.points} points</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{task.timeEstimate}</span>
                </div>
                {task.participantCount && (
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{task.participantCount} participating</span>
                  </div>
                )}
              </div>
            </div>
            
            <Button 
              onClick={() => onTaskSelect(task)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              Start Task
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
