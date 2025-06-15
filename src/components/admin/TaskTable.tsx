import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Edit, Trash2 } from "lucide-react";
import { Task } from "@/services/taskService";

interface TaskTableProps {
  tasks: Task[];
  getDifficultyColor: (difficulty: string) => string;
  getStatusColor: (status: string) => string;
  onDeleteTask: (taskId: string) => void;
  deleteLoading?: string | null;
  onEditTask: (task: Task) => void;
}

export const TaskTable: React.FC<TaskTableProps> = ({
  tasks,
  getDifficultyColor,
  getStatusColor,
  onDeleteTask,
  deleteLoading,
  onEditTask
}) => (
  <div className="overflow-x-auto border rounded-md">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Task</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Points</TableHead>
          <TableHead>Difficulty</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tasks.map((task) => (
          <TableRow key={task.id}>
            <TableCell className="font-medium">{task.title}</TableCell>
            <TableCell>{task.category}</TableCell>
            <TableCell>{task.points} pts</TableCell>
            <TableCell>
              <Badge className={getDifficultyColor(task.difficulty)}>
                {task.difficulty}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge className={getStatusColor(task.status)}>
                {task.status}
              </Badge>
            </TableCell>
            <TableCell>
              {new Date(task.created_at).toLocaleDateString()}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => onEditTask(task)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onDeleteTask(task.id)}
                  disabled={deleteLoading === task.id}
                >
                  {deleteLoading === task.id ? (
                    <span className="animate-spin inline-block mr-1 w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);
