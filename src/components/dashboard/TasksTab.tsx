
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Star, Users } from 'lucide-react';

interface TasksTabProps {
  userTasks: any[];
}

export const TasksTab: React.FC<TasksTabProps> = ({ userTasks }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Available Tasks</h2>
        <p className="text-muted-foreground">
          Complete tasks to earn points and level up your bird status.
        </p>
      </div>

      <div className="grid gap-4">
        {userTasks.map((task) => (
          <Card key={task.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{task.title}</CardTitle>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {task.description}
                  </p>
                </div>
                <Badge variant="secondary" className="ml-2">
                  <Star className="h-3 w-3 mr-1" />
                  {task.points} pts
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {task.difficulty}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {task.completion_count || 0} completed
                  </div>
                </div>
                <Button size="sm">
                  Start Task
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {userTasks.length === 0 && (
        <Card className="text-center py-8">
          <CardContent>
            <div className="text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No tasks available</h3>
              <p>Check back later for new tasks to complete!</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
