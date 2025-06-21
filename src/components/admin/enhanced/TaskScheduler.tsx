
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Calendar, Clock, Play, Pause } from "lucide-react";

interface ScheduledTask {
  id: string;
  task_id: string;
  scheduled_for: string;
  action: 'activate' | 'deactivate' | 'expire';
  status: 'pending' | 'completed' | 'cancelled';
  task_title: string;
}

interface TaskSchedulerProps {
  tasks: any[];
  onTasksUpdated: () => void;
}

export const TaskScheduler: React.FC<TaskSchedulerProps> = ({
  tasks,
  onTasksUpdated
}) => {
  const [selectedTask, setSelectedTask] = useState<string>("");
  const [scheduledAction, setScheduledAction] = useState<string>("");
  const [scheduledDateTime, setScheduledDateTime] = useState<string>("");
  const [scheduledTasks, setScheduledTasks] = useState<ScheduledTask[]>([]);
  const [isScheduling, setIsScheduling] = useState(false);

  const handleScheduleTask = async () => {
    if (!selectedTask || !scheduledAction || !scheduledDateTime) {
      toast.error("Please fill in all fields");
      return;
    }

    const scheduledDate = new Date(scheduledDateTime);
    if (scheduledDate <= new Date()) {
      toast.error("Scheduled time must be in the future");
      return;
    }

    setIsScheduling(true);
    try {
      const task = tasks.find(t => t.id === selectedTask);
      const newScheduledTask: ScheduledTask = {
        id: `scheduled-${Date.now()}`,
        task_id: selectedTask,
        scheduled_for: scheduledDateTime,
        action: scheduledAction as any,
        status: 'pending',
        task_title: task?.title || 'Unknown Task'
      };

      setScheduledTasks(prev => [...prev, newScheduledTask]);
      
      // In a real application, this would be saved to the database
      // and processed by a background job scheduler
      
      setSelectedTask("");
      setScheduledAction("");
      setScheduledDateTime("");
      
      toast.success("Task scheduled successfully!");
    } catch (error) {
      console.error("Error scheduling task:", error);
      toast.error("Failed to schedule task");
    } finally {
      setIsScheduling(false);
    }
  };

  const handleCancelScheduled = (scheduledId: string) => {
    setScheduledTasks(prev => 
      prev.map(st => 
        st.id === scheduledId 
          ? { ...st, status: 'cancelled' as const }
          : st
      )
    );
    toast.success("Scheduled task cancelled");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'activate': return <Play className="h-3 w-3" />;
      case 'deactivate': return <Pause className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Schedule Task Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="task-select">Select Task</Label>
              <Select value={selectedTask} onValueChange={setSelectedTask}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a task" />
                </SelectTrigger>
                <SelectContent>
                  {tasks.map((task) => (
                    <SelectItem key={task.id} value={task.id}>
                      <div className="flex items-center justify-between w-full">
                        <span className="truncate">{task.title}</span>
                        <Badge variant="outline" className="ml-2 text-xs">
                          {task.status}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="action-select">Action</Label>
              <Select value={scheduledAction} onValueChange={setScheduledAction}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activate">
                    <div className="flex items-center gap-2">
                      <Play className="h-4 w-4" />
                      Activate Task
                    </div>
                  </SelectItem>
                  <SelectItem value="deactivate">
                    <div className="flex items-center gap-2">
                      <Pause className="h-4 w-4" />
                      Deactivate Task
                    </div>
                  </SelectItem>
                  <SelectItem value="expire">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Expire Task
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="schedule-datetime">Schedule Date & Time</Label>
              <Input
                id="schedule-datetime"
                type="datetime-local"
                value={scheduledDateTime}
                onChange={(e) => setScheduledDateTime(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>
          </div>

          <Button 
            onClick={handleScheduleTask}
            disabled={!selectedTask || !scheduledAction || !scheduledDateTime || isScheduling}
            className="w-full"
          >
            {isScheduling ? "Scheduling..." : "Schedule Task Action"}
          </Button>
        </CardContent>
      </Card>

      {scheduledTasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Scheduled Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {scheduledTasks.map((scheduledTask) => (
                <div key={scheduledTask.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getActionIcon(scheduledTask.action)}
                    <div>
                      <p className="font-medium">{scheduledTask.task_title}</p>
                      <p className="text-sm text-muted-foreground">
                        {scheduledTask.action} on {new Date(scheduledTask.scheduled_for).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(scheduledTask.status)}>
                      {scheduledTask.status}
                    </Badge>
                    {scheduledTask.status === 'pending' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCancelScheduled(scheduledTask.id)}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
