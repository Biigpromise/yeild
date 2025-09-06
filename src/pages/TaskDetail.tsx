
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, DollarSign, Users, Target, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { taskService } from '@/services/taskService';
import { simplifiedTaskSubmissionService as taskSubmissionService } from "@/services/tasks/simplifiedTaskSubmissionService";
import { TaskSocialMediaDisplay } from '@/components/tasks/TaskSocialMediaDisplay';
import { TaskSubmissionModal } from '@/components/TaskSubmissionModal';
import { toast } from 'sonner';

const TaskDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);
  const [checkingSubmission, setCheckingSubmission] = useState(false);

  useEffect(() => {
    const loadTaskData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const [taskData, submissionStatus] = await Promise.all([
          taskService.getTaskById(id),
          taskSubmissionService.hasUserSubmittedTask(id)
        ]);
        
        setTask(taskData);
        setHasSubmitted(submissionStatus);
      } catch (error) {
        console.error('Error loading task:', error);
        toast.error('Failed to load task details');
      } finally {
        setLoading(false);
      }
    };

    loadTaskData();
  }, [id]);

  const handleSubmitTask = () => {
    if (!task) return;
    setIsSubmissionModalOpen(true);
  };

  const handleTaskSubmitted = async () => {
    setHasSubmitted(true);
    setIsSubmissionModalOpen(false);
    toast.success('Task submitted successfully!');
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="max-w-4xl mx-auto p-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-1/4 mb-6"></div>
            <div className="h-64 bg-gray-700 rounded mb-4"></div>
            <div className="h-32 bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="max-w-4xl mx-auto p-4">
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-semibold mb-2">Task Not Found</h3>
            <p className="text-gray-400 mb-4">The task you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => navigate('/tasks')} variant="outline">
              Back to Tasks
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/tasks')}
            className="text-white hover:bg-gray-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tasks
          </Button>
        </div>

        {/* Main Task Card */}
        <Card className="bg-gray-900 border-gray-700 mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl text-white mb-2">
                  {task.title}
                </CardTitle>
                {task.brand_name && (
                  <p className="text-gray-400 mb-3">
                    by {task.brand_name}
                  </p>
                )}
                <div className="flex items-center gap-3 mb-4">
                  <Badge className={`${getDifficultyColor(task.difficulty)} text-sm`}>
                    {task.difficulty}
                  </Badge>
                  <Badge variant="outline" className="text-sm">
                    {task.category}
                  </Badge>
                  {task.estimated_time && (
                    <div className="flex items-center gap-1 text-gray-400 text-sm">
                      <Clock className="h-3 w-3" />
                      {task.estimated_time}
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 text-yeild-yellow text-xl font-bold mb-2">
                  <DollarSign className="h-5 w-5" />
                  {task.points} points
                </div>
                {task.expires_at && (
                  <div className="text-sm text-gray-400">
                    Expires: {new Date(task.expires_at).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Task Description */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Task Description</h3>
              <p className="text-gray-300 leading-relaxed">
                {task.description}
              </p>
            </div>

            <Separator className="bg-gray-700" />

            {/* Social Media Links */}
            <TaskSocialMediaDisplay 
              socialLinks={task.social_media_links}
              taskTitle={task.title}
            />

            {/* Task Requirements */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Requirements</h3>
              <div className="bg-gray-800 rounded-lg p-4">
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-start gap-2">
                    <Target className="h-4 w-4 text-yeild-yellow mt-1 flex-shrink-0" />
                    Complete the task as described above
                  </li>
                  <li className="flex items-start gap-2">
                    <Target className="h-4 w-4 text-yeild-yellow mt-1 flex-shrink-0" />
                    Upload screenshots or videos as proof of completion
                  </li>
                  <li className="flex items-start gap-2">
                    <Target className="h-4 w-4 text-yeild-yellow mt-1 flex-shrink-0" />
                    Provide accurate and genuine evidence
                  </li>
                  <li className="flex items-start gap-2">
                    <Target className="h-4 w-4 text-yeild-yellow mt-1 flex-shrink-0" />
                    Wait for admin approval to receive points
                  </li>
                </ul>
              </div>
            </div>

            <Separator className="bg-gray-700" />

            {/* Submission Section */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Submit Your Work</h3>
              
              {hasSubmitted ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="h-8 w-8 text-green-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">Task Submitted!</h4>
                  <p className="text-gray-400 mb-4">
                    Your submission is being reviewed by our team. You'll be notified once it's approved.
                  </p>
                  <Button 
                    onClick={() => navigate('/tasks')}
                    variant="outline"
                  >
                    Browse More Tasks
                  </Button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-yeild-yellow/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-yeild-yellow" />
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">Ready to Submit?</h4>
                  <p className="text-gray-400 mb-6">
                    Make sure you've completed all requirements before submitting your evidence.
                  </p>
                  <Button 
                    onClick={handleSubmitTask}
                    className="bg-yeild-yellow hover:bg-yeild-yellow/90 text-black font-semibold px-8"
                    disabled={checkingSubmission}
                  >
                    {checkingSubmission ? 'Checking...' : 'Submit Task'}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Task Submission Modal */}
        <TaskSubmissionModal
          task={task}
          isOpen={isSubmissionModalOpen}
          onClose={() => setIsSubmissionModalOpen(false)}
          onSubmitted={handleTaskSubmitted}
        />
      </div>
    </div>
  );
};

export default TaskDetail;
