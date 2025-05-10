
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

type Task = {
  id: string;
  title: string;
  description: string;
  reward: number;
  deadlineDate: Date;
  status: "active" | "completed" | "expired";
  submissions: number;
};

const mockTasks: Task[] = [
  {
    id: "1",
    title: "Complete Survey",
    description: "Fill out a 5-minute survey about your experience",
    reward: 5,
    deadlineDate: new Date(2025, 5, 15),
    status: "active",
    submissions: 120,
  },
  {
    id: "2",
    title: "Share on Twitter",
    description: "Share our latest post on Twitter with the hashtag #Yeild",
    reward: 10,
    deadlineDate: new Date(2025, 5, 20),
    status: "active",
    submissions: 45,
  },
  {
    id: "3",
    title: "Watch Demo Video",
    description: "Watch our 2-minute demo video and complete a quiz",
    reward: 15,
    deadlineDate: new Date(2025, 4, 10),
    status: "expired",
    submissions: 210,
  },
];

export const AdminTasks = () => {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    reward: 0,
    deadlineDate: new Date(),
  });
  const [isCreating, setIsCreating] = useState(false);
  const [date, setDate] = useState<Date>();

  const handleCreateTask = () => {
    if (!newTask.title || !newTask.description || newTask.reward <= 0) {
      alert("Please fill out all fields");
      return;
    }
    
    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      description: newTask.description,
      reward: newTask.reward,
      deadlineDate: date || new Date(),
      status: "active",
      submissions: 0,
    };
    
    setTasks([task, ...tasks]);
    setNewTask({ title: "", description: "", reward: 0, deadlineDate: new Date() });
    setIsCreating(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Task Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between">
            <Button onClick={() => setIsCreating(!isCreating)}>
              {isCreating ? "Cancel" : "Create New Task"}
            </Button>
          </div>

          {isCreating && (
            <Card className="border border-border">
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Task Title</label>
                    <Input
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                      placeholder="Enter task title"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Reward (points)</label>
                    <Input
                      type="number"
                      value={newTask.reward || ""}
                      onChange={(e) => setNewTask({ ...newTask, reward: Number(e.target.value) })}
                      placeholder="Enter reward points"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Task Description</label>
                  <Textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    placeholder="Enter task description"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Deadline</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : "Select deadline date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleCreateTask}>Create Task</Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="overflow-x-auto border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Reward</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submissions</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium">{task.title}</TableCell>
                    <TableCell className="max-w-xs truncate">{task.description}</TableCell>
                    <TableCell>{task.reward} pts</TableCell>
                    <TableCell>{format(task.deadlineDate, "PPP")}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        task.status === "active" ? "bg-green-100 text-green-800" :
                        task.status === "completed" ? "bg-blue-100 text-blue-800" :
                        "bg-red-100 text-red-800"
                      }`}>
                        {task.status}
                      </span>
                    </TableCell>
                    <TableCell>{task.submissions}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          Edit
                        </Button>
                        <Button size="sm" variant="outline">
                          View
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Task Submissions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between">
            <Input placeholder="Search submissions" className="max-w-sm" />
          </div>
          
          <div className="overflow-x-auto border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Task</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[1, 2, 3].map((item) => (
                  <TableRow key={item}>
                    <TableCell>User {item}</TableCell>
                    <TableCell>Task {item}</TableCell>
                    <TableCell>{format(new Date(), "PPP")}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Pending
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" className="bg-green-50 hover:bg-green-100 text-green-600 border-green-200">
                          Approve
                        </Button>
                        <Button size="sm" variant="outline" className="bg-red-50 hover:bg-red-100 text-red-600 border-red-200">
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
