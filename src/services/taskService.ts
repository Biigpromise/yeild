
import { taskQueries } from "./tasks/taskQueries";
import { taskSubmissionService } from "./tasks/taskSubmissionService";
import { adminTaskService } from "./tasks/adminTaskService";

// Re-export types for backward compatibility
export { Task, TaskCategory, TaskSubmission } from "./types/taskTypes";

export const taskService = {
  // Public task operations
  getTasks: taskQueries.getTasks,
  getCategories: taskQueries.getCategories,
  getUserSubmissions: taskQueries.getUserSubmissions,
  getUserTasks: taskQueries.getUserTasks,
  
  // Task submission
  submitTask: taskSubmissionService.submitTask,

  // Admin operations
  admin: adminTaskService
};
