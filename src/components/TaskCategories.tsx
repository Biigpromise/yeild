
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Smartphone, 
  PenTool, 
  Share2, 
  Search,
  ChevronRight
} from "lucide-react";

interface TaskCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  taskCount: number;
  color: string;
  averagePoints: number;
}

interface TaskCategoriesProps {
  categories: TaskCategory[];
  onCategorySelect: (categoryId: string) => void;
}

const TaskCategories: React.FC<TaskCategoriesProps> = ({
  categories,
  onCategorySelect,
}) => {
  const defaultCategories: TaskCategory[] = [
    {
      id: "survey",
      name: "Surveys",
      description: "Share your opinions and feedback on various topics",
      icon: <FileText className="h-6 w-6" />,
      taskCount: categories.find(c => c.id === "survey")?.taskCount || 0,
      color: "text-blue-400",
      averagePoints: categories.find(c => c.id === "survey")?.averagePoints || 50,
    },
    {
      id: "app_testing",
      name: "App Testing",
      description: "Test mobile apps and websites for usability issues",
      icon: <Smartphone className="h-6 w-6" />,
      taskCount: categories.find(c => c.id === "app_testing")?.taskCount || 0,
      color: "text-green-400",
      averagePoints: categories.find(c => c.id === "app_testing")?.averagePoints || 100,
    },
    {
      id: "content_creation",
      name: "Content Creation",
      description: "Create reviews, write descriptions, or generate content",
      icon: <PenTool className="h-6 w-6" />,
      taskCount: categories.find(c => c.id === "content_creation")?.taskCount || 0,
      color: "text-purple-400",
      averagePoints: categories.find(c => c.id === "content_creation")?.averagePoints || 150,
    },
    {
      id: "social_media",
      name: "Social Media",
      description: "Engage with brands on social platforms",
      icon: <Share2 className="h-6 w-6" />,
      taskCount: categories.find(c => c.id === "social_media")?.taskCount || 0,
      color: "text-pink-400",
      averagePoints: categories.find(c => c.id === "social_media")?.averagePoints || 75,
    },
    {
      id: "research",
      name: "Research",
      description: "Participate in market research and data collection",
      icon: <Search className="h-6 w-6" />,
      taskCount: categories.find(c => c.id === "research")?.taskCount || 0,
      color: "text-yellow-400",
      averagePoints: categories.find(c => c.id === "research")?.averagePoints || 200,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Task Categories</h2>
        <p className="text-gray-400">Choose a category to find tasks that match your interests</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {defaultCategories.map((category) => (
          <Card key={category.id} className="bg-gray-900 border-gray-800 hover:border-gray-700 transition-all duration-200 cursor-pointer group" onClick={() => onCategorySelect(category.id)}>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between mb-2">
                <div className={`${category.color} group-hover:scale-110 transition-transform`}>
                  {category.icon}
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-yeild-yellow transition-colors" />
              </div>
              <CardTitle className="text-lg group-hover:text-yeild-yellow transition-colors">
                {category.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                {category.description}
              </p>
              
              <div className="flex justify-between items-center mb-4">
                <Badge variant="outline" className="text-gray-300 border-gray-600">
                  {category.taskCount} {category.taskCount === 1 ? 'task' : 'tasks'}
                </Badge>
                <span className="text-sm text-yeild-yellow font-medium">
                  ~{category.averagePoints} pts avg
                </span>
              </div>

              <Button 
                className="w-full yeild-btn-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  onCategorySelect(category.id);
                }}
              >
                View Tasks
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TaskCategories;
