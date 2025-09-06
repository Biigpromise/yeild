import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { taskService } from '@/services/taskService';
import { simplifiedTaskSubmissionService as taskSubmissionService } from "@/services/tasks/simplifiedTaskSubmissionService";
import { TaskSocialMediaDisplay } from '@/components/tasks/TaskSocialMediaDisplay';
import { TaskSubmissionModal } from '@/components/TaskSubmissionModal';
import { toast } from 'sonner';
import { 
  Clock, 
  Star, 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle,
  Target,
  Briefcase,
  Users,
  Calendar
} from 'lucide-react';

const TaskDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submissionModalOpen, setSubmissionModalOpen] = useState(false);
  const [hasSubmission, setHasSubmission] = useState(false);

  useEffect(() => {
    if (id) {
      loadTask(id);
    }
  }, [id]);

  const loadTask = async (taskId: string) => {
    try {
      setLoading(true);
      const taskData = await taskService.getTaskById(taskId);
      const submissions = await taskService.getUserSubmissions();
      const hasExisting = submissions.some(sub => sub.task_id === taskId);
      
      setTask(taskData);
      setHasSubmission(hasExisting);
    } catch (error) {
      console.error('Error loading task:', error);
      toast.error('Failed to load task details');
      navigate('/tasks');
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'hard':
        return 'bg-red-500/10 text-red-600 border-red-500/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const handleStartTask = () => {
    setSubmissionModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-semibold mb-2">Task Not Found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              The task you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate('/tasks')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Tasks
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/tasks')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Tasks
        </Button>
        
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{task.title}</h1>
            <div className="flex items-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-primary" />
                <span className="font-semibold text-primary">{task.points} points</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{task.estimated_time}</span>
              </div>
              {task.brand_name && (
                <div className="flex items-center gap-1">
                  <Briefcase className="h-4 w-4" />
                  <span>{task.brand_name}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <Badge className={getDifficultyColor(task.difficulty)}>
              {task.difficulty}
            </Badge>
            {hasSubmission && (
              <Badge variant="secondary" className="bg-green-500/10 text-green-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                Submitted
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Task Content */}
      <div className="grid gap-6">
        {/* Description */}
        <Card>
          <CardHeader>
            <CardTitle>Task Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {task.description}
            </p>
          </CardContent>
        </Card>

        {/* Social Media Links */}
        <TaskSocialMediaDisplay 
          socialLinks={task.social_media_links}
          taskTitle={task.title}
        />

        {/* Task Requirements */}
        {task.requirements && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Requirements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(task.requirements).map(([key, value]) => (
                  <div key={key} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-medium capitalize">{key.replace('_', ' ')}:</span>
                      <span className="ml-2 text-muted-foreground">{String(value)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Task Details */}
        <Card>
          <CardHeader>
            <CardTitle>Task Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category:</span>
                  <span className="font-medium">{task.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Difficulty:</span>
                  <Badge className={getDifficultyColor(task.difficulty)}>
                    {task.difficulty}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Points Reward:</span>
                  <span className="font-semibold text-primary">{task.points}</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estimated Time:</span>
                  <span className="font-medium">{task.estimated_time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Task Type:</span>
                  <span className="font-medium capitalize">
                    {task.task_type?.replace('_', ' ') || 'General'}
                  </span>
                </div>
                {task.brand_name && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Brand:</span>
                    <span className="font-medium">{task.brand_name}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Button */}
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              {hasSubmission ? (
                <div className="space-y-3">
                  <CheckCircle className="h-12 w-12 mx-auto text-green-600" />
                  <h3 className="font-semibold text-green-600">Task Submitted</h3>
                  <p className="text-sm text-muted-foreground">
                    You have already submitted this task. Check your dashboard for the status.
                  </p>
                  <Button variant="outline" onClick={() => navigate('/dashboard')}>
                    Go to Dashboard
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Target className="h-12 w-12 mx-auto text-primary" />
                  <h3 className="font-semibold">Ready to Start?</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Complete this task to earn {task.points} points towards your level progression.
                  </p>
                  <Button 
                    size="lg"
                    onClick={handleStartTask}
                    className="w-full max-w-md"
                  >
                    Start Task
                    <Star className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Task Submission Modal */}
      <TaskSubmissionModal
        task={task}
        isOpen={submissionModalOpen}
        onClose={() => setSubmissionModalOpen(false)}
        onSubmitted={() => {
          setHasSubmission(true);
          setSubmissionModalOpen(false);
        }}
      />
    </div>
  );
};

export default TaskDetail;