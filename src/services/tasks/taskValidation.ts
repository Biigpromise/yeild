
import { InputValidator } from '@/services/validation/inputValidator';
import { Task } from '@/services/taskService';

export interface TaskValidationResult {
  isValid: boolean;
  errors: string[];
}

export class TaskValidator {
  static validateTaskCreation(taskData: Partial<Task>): TaskValidationResult {
    const errors: string[] = [];

    // Required fields
    if (!InputValidator.required(taskData.title || '', 'Task title')) {
      errors.push('Title is required');
    }

    if (!InputValidator.required(taskData.description || '', 'Task description')) {
      errors.push('Description is required');
    }

    if (!InputValidator.required(taskData.category || '', 'Category')) {
      errors.push('Category is required');
    }

    if (!InputValidator.required(taskData.difficulty || '', 'Difficulty')) {
      errors.push('Difficulty is required');
    }

    // Length validation
    if (taskData.title && !InputValidator.maxLength(taskData.title, 100, 'Title')) {
      errors.push('Title must be less than 100 characters');
    }

    if (taskData.description && !InputValidator.maxLength(taskData.description, 1000, 'Description')) {
      errors.push('Description must be less than 1000 characters');
    }

    // Points validation
    if (taskData.points !== undefined) {
      if (taskData.points < 0) {
        errors.push('Points cannot be negative');
      }
      if (taskData.points > 10000) {
        errors.push('Points cannot exceed 10,000');
      }
    }

    // Sanitize inputs
    if (taskData.title) {
      taskData.title = InputValidator.sanitizeInput(taskData.title);
    }
    if (taskData.description) {
      taskData.description = InputValidator.sanitizeInput(taskData.description);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateTaskSubmission(evidence: string, file?: File): TaskValidationResult {
    const errors: string[] = [];

    // Must have either evidence text or file
    if (!evidence.trim() && !file) {
      errors.push('Please provide evidence (text or file)');
      return { isValid: false, errors };
    }

    // Evidence text validation
    if (evidence.trim()) {
      if (!InputValidator.minLength(evidence.trim(), 10, 'Evidence')) {
        errors.push('Evidence must be at least 10 characters');
      }
      if (!InputValidator.maxLength(evidence, 2000, 'Evidence')) {
        errors.push('Evidence must be less than 2000 characters');
      }
    }

    // File validation
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/webm'];
      if (!allowedTypes.includes(file.type)) {
        errors.push('Only images (JPEG, PNG, GIF) and videos (MP4, WebM) are allowed');
      }
      
      const maxSize = 15 * 1024 * 1024; // 15MB
      if (file.size > maxSize) {
        errors.push('File size must be less than 15MB');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
