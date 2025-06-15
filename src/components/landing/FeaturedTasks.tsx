
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { taskService, Task } from "@/services/taskService";

export const FeaturedTasks = () => {
  const navigate = useNavigate();
  const [featuredTasks, setFeaturedTasks] = useState<Task[]>([]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const allTasks = await taskService.getTasks();
        const activeTasks = allTasks.filter(task => task.status === 'active').slice(0, 3);
        setFeaturedTasks(activeTasks);
      } catch (error) {
        console.error("Failed to fetch featured tasks:", error);
      }
    };
    fetchTasks();
  }, []);

  return (
    <section className="py-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-yeild-yellow">Featured Tasks</h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">Here's a taste of the tasks you can complete to earn rewards.</p>
        </div>
        {featuredTasks.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredTasks.map(task => (
              <Card key={task.id} className="bg-gray-800/50 border-gray-700 flex flex-col justify-between">
                <CardHeader>
                  <CardTitle className="text-white text-xl">{task.title}</CardTitle>
                  <CardDescription className="text-gray-400">{task.category}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 mb-4">{(task.description || '').substring(0, 100)}{task.description && task.description.length > 100 ? '...' : ''}</p>
                </CardContent>
                <CardFooter>
                  <div className="flex justify-between items-center w-full">
                    <span className="text-yeild-yellow font-bold text-lg">{task.points} Points</span>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400">Loading tasks...</div>
        )}
        <div className="text-center mt-16">
          <Button size="lg" className="bg-white text-black hover:bg-gray-200 text-lg px-8 py-6" onClick={() => navigate('/tasks')}>
            View All Tasks
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};
