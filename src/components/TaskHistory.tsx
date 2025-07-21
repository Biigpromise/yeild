
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, Star, Calendar, AlertCircle, Edit, RefreshCw } from "lucide-react";
import { TaskResubmissionModal } from "@/components/tasks/TaskResubmissionModal";
import { useDeclinedTaskEdit } from "@/hooks/useDeclinedTaskEdit";

interface CompletedTask {
  id: string;
  title: string;
  description: string | null;
  points: number;
  category: string | null;
  difficulty: string | null;
  brand_name?: string | null;
  brand_logo_url?: string | null;
  completed_at: string;
  points_earned: number;
  // Task submission data
  submission?: {
    id: string;
    status: string;
    rejection_reason?: string;
    evidence?: string;
    file_urls?: string[];
  };
}

interface TaskHistoryProps {
  completedTasks: CompletedTask[];
  totalPointsEarned: number;
  totalTasksCompleted: number;
  onTaskUpdate?: () => void;
}

const TaskHistory: React.FC<TaskHistoryProps> = ({
  completedTasks,
  totalPointsEarned,
  totalTasksCompleted,
  onTaskUpdate
}) => {
  const [selectedTask, setSelectedTask] = useState<CompletedTask | null>(null);
  const [showResubmissionModal, setShowResubmissionModal] = useState(false);
  
  const { canEditTask } = useDeclinedTaskEdit();

  const getDifficultyColor = (difficulty: string | null) => {
    switch (difficulty) {
      case "easy": return "bg-green-500/20 text-green-400";
      case "medium": return "bg-blue-500/20 text-blue-400";
      case "hard": return "bg-purple-500/20 text-purple-400";
      default: return "bg-gray-500/20 text-gray-400";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-500 text-white";
      case "rejected": return "bg-red-500 text-white";
      case "pending": return "bg-yellow-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved": return <CheckCircle className="w-4 h-4" />;
      case "rejected": return <AlertCircle className="w-4 h-4" />;
      case "pending": return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleEditTask = (task: CompletedTask) => {
    setSelectedTask(task);
    setShowResubmissionModal(true);
  };

  const handleResubmissionSuccess = () => {
    onTaskUpdate?.();
    setSelectedTask(null);
    setShowResubmissionModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-400">Total Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTasksCompleted}</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-400">Points Earned</CardTitle>
              <Star className="h-4 w-4 text-yeild-yellow" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yeild-yellow">{totalPointsEarned}</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-400">Average Points</CardTitle>
              <Star className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalTasksCompleted > 0 ? Math.round(totalPointsEarned / totalTasksCompleted) : 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Task History List */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold mb-4">Task History</h3>
        
        {completedTasks.length === 0 ? (
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6 text-center">
              <CheckCircle className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No completed tasks yet. Complete your first task to see it here!</p>
            </CardContent>
          </Card>
        ) : (
          completedTasks.map((task) => (
            <Card key={task.id} className="bg-gray-900 border-gray-800 hover:border-gray-700 transition-colors">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex gap-2 mb-2 flex-wrap">
                      {task.submission && (
                        <Badge className={`${getStatusColor(task.submission.status)} flex items-center gap-1`}>
                          {getStatusIcon(task.submission.status)}
                          {task.submission.status.charAt(0).toUpperCase() + task.submission.status.slice(1)}
                        </Badge>
                      )}
                      {task.difficulty && (
                        <Badge variant="outline" className={getDifficultyColor(task.difficulty)}>
                          {task.difficulty.charAt(0).toUpperCase() + task.difficulty.slice(1)}
                        </Badge>
                      )}
                      {task.category && (
                        <Badge variant="outline" className="text-gray-400 border-gray-600">
                          {task.category.replace('_', ' ').toUpperCase()}
                        </Badge>
                      )}
                    </div>
                    <h4 className="font-semibold text-lg mb-1">{task.title}</h4>
                    {task.description && (
                      <p className="text-gray-400 text-sm mb-3">{task.description}</p>
                    )}
                    
                    {/* Show rejection reason if task was declined */}
                    {task.submission?.status === 'rejected' && task.submission.rejection_reason && (
                      <div className="bg-red-900/20 border border-red-800 rounded-lg p-3 mb-3">
                        <div className="flex items-start">
                          <AlertCircle className="w-4 h-4 text-red-400 mr-2 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-red-400 text-sm font-medium">Decline Reason:</p>
                            <p className="text-red-300 text-sm">{task.submission.rejection_reason}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-right ml-4 flex flex-col items-end gap-2">
                    {task.submission?.status === 'approved' && (
                      <div className="bg-yeild-yellow text-yeild-black font-bold px-3 py-1 rounded-lg text-sm">
                        +{task.points_earned} pts
                      </div>
                    )}
                    
                    {/* Edit button for declined tasks */}
                    {task.submission && canEditTask(task.submission) && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditTask(task)}
                        className="text-xs border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Edit & Resubmit
                      </Button>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center text-sm text-gray-400">
                  <div className="flex items-center gap-4">
                    {task.brand_name && (
                      <div className="flex items-center">
                        <div className="h-4 w-4 bg-gray-800 rounded-full overflow-hidden mr-2">
                          <img src={task.brand_logo_url || ''} alt={task.brand_name} className="w-full h-full object-cover" />
                        </div>
                        <span>{task.brand_name}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>Submitted {formatDate(task.completed_at)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Resubmission Modal */}
      {selectedTask && (
        <TaskResubmissionModal
          isOpen={showResubmissionModal}
          onClose={() => {
            setShowResubmissionModal(false);
            setSelectedTask(null);
          }}
          task={selectedTask}
          submission={selectedTask.submission}
          onResubmitSuccess={handleResubmissionSuccess}
        />
      )}
    </div>
  );
};

export default TaskHistory;
