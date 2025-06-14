
-- Create the `task-evidence` storage bucket
insert into storage.buckets
  (id, name, public)
values
  ('task-evidence', 'task-evidence', false)
on conflict do nothing;

-- Allow authenticated users to insert their own evidence files (fixing to WITH CHECK)
create policy "Users can upload their own task evidence"
on storage.objects
for insert
with check (
  bucket_id = 'task-evidence'
  and auth.role() = 'authenticated'
);

-- Allow authenticated users to view their own evidence files
create policy "Users can view their own evidence"
on storage.objects
for select
using (
  bucket_id = 'task-evidence'
  and auth.role() = 'authenticated'
);

-- Allow authenticated users to update their own evidence files
create policy "Users can update their own evidence"
on storage.objects
for update
using (
  bucket_id = 'task-evidence'
  and auth.role() = 'authenticated'
);

-- Allow authenticated users to delete their own evidence files
create policy "Users can delete their own evidence"
on storage.objects
for delete
using (
  bucket_id = 'task-evidence'
  and auth.role() = 'authenticated'
);

-- Add evidence_file_url column if not exists
alter table task_submissions
add column if not exists evidence_file_url text;
