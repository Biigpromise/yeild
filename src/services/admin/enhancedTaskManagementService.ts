
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const enhancedTaskManagementService = {
  // Get all tasks with enhanced data
  async getTasks() {
    try {
      console.log('Fetching tasks from database...');
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          task_categories(name, description)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tasks:', error);
        throw error;
      }

      console.log('Tasks fetched successfully:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Error in getTasks:', error);
      return [];
    }
  },

  // Get task categories
  async getTaskCategories() {
    try {
      console.log('Fetching task categories...');
      const { data, error } = await supabase
        .from('task_categories')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching categories:', error);
        throw error;
      }

      console.log('Categories fetched:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Error in getTaskCategories:', error);
      return [];
    }
  },

  // Create a new task
  async createTask(taskData: any) {
    try {
      console.log('Creating task with data:', taskData);
      
      const { data, error } = await supabase
        .from('tasks')
        .insert([taskData])
        .select()
        .single();

      if (error) {
        console.error('Error creating task:', error);
        throw error;
      }

      console.log('Task created successfully:', data);
      return true;
    } catch (error) {
      console.error('Error in createTask:', error);
      return false;
    }
  },

  // Update an existing task
  async updateTask(taskId: string, taskData: any) {
    try {
      console.log('Updating task:', taskId, 'with data:', taskData);
      
      const { data, error } = await supabase
        .from('tasks')
        .update(taskData)
        .eq('id', taskId)
        .select()
        .single();

      if (error) {
        console.error('Error updating task:', error);
        throw error;
      }

      console.log('Task updated successfully:', data);
      return true;
    } catch (error) {
      console.error('Error in updateTask:', error);
      return false;
    }
  },

  // Delete a task
  async deleteTask(taskId: string) {
    try {
      console.log('Deleting task:', taskId);
      
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) {
        console.error('Error deleting task:', error);
        throw error;
      }

      console.log('Task deleted successfully');
      return true;
    } catch (error) {
      console.error('Error in deleteTask:', error);
      return false;
    }
  },

  // Get all task submissions
  async getAllSubmissions() {
    try {
      console.log('Fetching task submissions...');
      const { data, error } = await supabase
        .from('task_submissions')
        .select(`
          *,
          tasks(title, points),
          profiles(name, email)
        `)
        .order('submitted_at', { ascending: false });

      if (error) {
        console.error('Error fetching submissions:', error);
        throw error;
      }

      console.log('Submissions fetched:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Error in getAllSubmissions:', error);
      return [];
    }
  },

  // Update submission status
  async updateSubmissionStatus(submissionId: string, status: string, adminNotes?: string) {
    try {
      console.log('Updating submission status:', submissionId, status);
      
      const updateData: any = { status };
      if (adminNotes) {
        updateData.admin_notes = adminNotes;
      }

      const { data, error } = await supabase
        .from('task_submissions')
        .update(updateData)
        .eq('id', submissionId)
        .select()
        .single();

      if (error) {
        console.error('Error updating submission:', error);
        throw error;
      }

      console.log('Submission updated successfully:', data);
      return true;
    } catch (error) {
      console.error('Error in updateSubmissionStatus:', error);
      return false;
    }
  }
};
