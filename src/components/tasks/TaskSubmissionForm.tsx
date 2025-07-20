import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Upload, Send, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useSecureSubmission } from '@/hooks/useSecureSubmission';
import { InputValidator } from '@/services/validation/inputValidator';

const submissionSchema = z.object({
  evidenceUrl: z.string().url('Please provide a valid URL'),
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must not exceed 500 characters'),
  socialMediaHandle: z.string().optional(),
});

type SubmissionFormData = z.infer<typeof submissionSchema>;

interface TaskSubmissionFormProps {
  taskId: string;
  onSubmissionComplete: () => void;
}

export const TaskSubmissionForm = ({ taskId, onSubmissionComplete }: TaskSubmissionFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const { submitTaskSubmission } = useSecureSubmission();

  const form = useForm<SubmissionFormData>({
    resolver: zodResolver(submissionSchema),
    defaultValues: {
      evidenceUrl: '',
      description: '',
      socialMediaHandle: '',
    },
  });

  const handleFileUpload = async (file: File) => {
    try {
      // Validate file type and size
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload only images (JPEG, PNG, WebP) or MP4 videos');
        return null;
      }

      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('File size must be less than 10MB');
        return null;
      }

      // Generate secure filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${taskId}/${fileName}`;

      // Upload to secure bucket
      const { data, error } = await supabase.storage
        .from('task-evidence')
        .upload(filePath, file);

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('task-evidence')
        .getPublicUrl(data.path);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload file');
      return null;
    }
  };

  const onSubmit = async (data: SubmissionFormData) => {
    setIsSubmitting(true);
    
    try {
      // Validate and sanitize input
      const sanitizedData = {
        evidenceUrl: InputValidator.sanitizeUrl(data.evidenceUrl),
        description: InputValidator.sanitizeText(data.description),
        socialMediaHandle: data.socialMediaHandle ? InputValidator.sanitizeText(data.socialMediaHandle) : null,
      };

      // Additional validation
      if (!InputValidator.isValidUrl(sanitizedData.evidenceUrl)) {
        toast.error('Please provide a valid evidence URL');
        return;
      }

      let finalEvidenceUrl = sanitizedData.evidenceUrl;

      // If file uploaded, use that URL instead
      if (evidenceFile) {
        const uploadedUrl = await handleFileUpload(evidenceFile);
        if (!uploadedUrl) return;
        finalEvidenceUrl = uploadedUrl;
      }

      // Submit with security validation
      const result = await submitTaskSubmission({
        task_id: taskId,
        evidence_url: finalEvidenceUrl,
        description: sanitizedData.description,
        social_media_handle: sanitizedData.socialMediaHandle,
        status: 'pending',
      });

      if (result.success) {
        toast.success('Task submitted successfully! It will be reviewed shortly.');
        form.reset();
        setEvidenceFile(null);
        onSubmissionComplete();
      } else {
        toast.error(result.error || 'Failed to submit task');
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('An error occurred while submitting');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="w-5 h-5" />
          Submit Task Evidence
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* File Upload Section */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Upload Evidence (Optional)</label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="image/*,video/mp4"
                  onChange={(e) => setEvidenceFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="evidence-upload"
                />
                <label
                  htmlFor="evidence-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Upload className="w-8 h-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {evidenceFile ? evidenceFile.name : 'Click to upload image or video'}
                  </span>
                </label>
              </div>
            </div>

            {/* Evidence URL Field */}
            <FormField
              control={form.control}
              name="evidenceUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Evidence URL *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com/your-evidence"
                      {...field}
                      disabled={!!evidenceFile}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description Field */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Description *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe how you completed this task..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Social Media Handle */}
            <FormField
              control={form.control}
              name="socialMediaHandle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Social Media Handle (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="@yourusername"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Security Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-md p-3 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-800">
                <strong>Security Notice:</strong> All submissions are validated and monitored. 
                Please ensure your evidence is legitimate and follows platform guidelines.
              </div>
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Task'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};