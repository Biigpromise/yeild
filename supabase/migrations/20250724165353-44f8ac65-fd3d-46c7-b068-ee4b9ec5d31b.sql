
-- Create the task-evidence storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('task-evidence', 'task-evidence', true)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  updated_at = now();

-- Create RLS policies for the task-evidence bucket
CREATE POLICY "Allow public read access on task-evidence bucket"
ON storage.objects FOR SELECT
USING (bucket_id = 'task-evidence');

CREATE POLICY "Allow authenticated users to upload to task-evidence bucket"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'task-evidence' AND auth.role() = 'authenticated');

CREATE POLICY "Allow users to update their own files in task-evidence bucket"
ON storage.objects FOR UPDATE
USING (bucket_id = 'task-evidence' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Allow users to delete their own files in task-evidence bucket"
ON storage.objects FOR DELETE
USING (bucket_id = 'task-evidence' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Also ensure the stories bucket exists and is properly configured
INSERT INTO storage.buckets (id, name, public)
VALUES ('stories', 'stories', true)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  updated_at = now();
