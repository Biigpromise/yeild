
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, ExternalLink } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TaskTableProps {
  tasks: any[];
  getDifficultyColor: (difficulty: string) => string;
  getStatusColor: (status: string) => string;
  onDeleteTask: (taskId: string) => void;
  onEditTask?: (task: any) => void;
  deleteLoading: string | null;
}

export const TaskTable: React.FC<TaskTableProps> = ({
  tasks,
  getDifficultyColor,
  getStatusColor,
  onDeleteTask,
  onEditTask,
  deleteLoading
}) => {
  console.log('TaskTable rendered with tasks:', tasks.length);
  console.log('Edit function available:', !!onEditTask);

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Points</TableHead>
            <TableHead>Difficulty</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                No tasks found
              </TableCell>
            </TableRow>
          ) : (
            tasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell>
                  <div className="font-medium">{task.title}</div>
                  <div className="text-xs text-muted-foreground line-clamp-2">
                    {task.description}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{task.category || 'General'}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">{task.points}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getDifficultyColor(task.difficulty)}>
                    {task.difficulty || 'Medium'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(task.status)}>
                    {task.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-muted-foreground">
                    {new Date(task.created_at).toLocaleDateString()}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {onEditTask && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          console.log('Edit button clicked for task:', task.id);
                          onEditTask(task);
                        }}
                        className="h-8 w-8 p-0"
                        title="Edit Task"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDeleteTask(task.id)}
                      disabled={deleteLoading === task.id}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      title="Delete Task"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    {task.social_media_links && Object.values(task.social_media_links).some(link => link) && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        title="Has social media links"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
