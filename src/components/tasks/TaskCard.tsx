
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, DollarSign, Users, CheckCircle } from "lucide-react";

interface TaskCardProps {
  title: string;
  description: string;
  points: number;
  timeEstimate: string;
  participants: number;
  status: 'available' | 'in_progress' | 'completed';
  onViewTask: () => void;
}

const TaskCard = ({ 
  title, 
  description, 
  points, 
  timeEstimate, 
  participants, 
  status, 
  onViewTask 
}: TaskCardProps) => {
  const getStatusColor = () => {
    switch (status) {
      case 'available':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'in_progress':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'completed':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'available':
        return 'Available';
      case 'in_progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      default:
        return 'Unknown';
    }
  };

  return (
    <Card className="bg-slate-900 border-slate-700 hover:border-slate-600 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold text-white line-clamp-2">
            {title}
          </CardTitle>
          <Badge className={getStatusColor()}>
            {status === 'completed' && <CheckCircle className="w-3 h-3 mr-1" />}
            {getStatusText()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-slate-300 text-sm line-clamp-3">
          {description}
        </p>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-green-400">
              <DollarSign className="w-4 h-4 mr-1" />
              <span className="font-medium">{points} pts</span>
            </div>
            
            <div className="flex items-center text-slate-400">
              <Clock className="w-4 h-4 mr-1" />
              <span>{timeEstimate}</span>
            </div>
            
            <div className="flex items-center text-slate-400">
              <Users className="w-4 h-4 mr-1" />
              <span>{participants}</span>
            </div>
          </div>
        </div>

        <Button 
          onClick={onViewTask}
          className="w-full bg-yeild-yellow text-black hover:bg-yeild-yellow/90"
          disabled={status === 'completed'}
        >
          {status === 'completed' ? 'Completed' : 'View Task'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default TaskCard;
