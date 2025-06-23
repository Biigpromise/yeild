
-- Create storage bucket for chat media
insert into storage.buckets (id, name, public)
values ('chat-media', 'chat-media', true);

-- Create storage policies for chat media bucket
create policy "Anyone can view chat media" on storage.objects
for select using (bucket_id = 'chat-media');

create policy "Authenticated users can upload chat media" on storage.objects
for insert with check (bucket_id = 'chat-media' and auth.role() = 'authenticated');

create policy "Users can update their own chat media" on storage.objects
for update using (bucket_id = 'chat-media' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can delete their own chat media" on storage.objects
for delete using (bucket_id = 'chat-media' and auth.uid()::text = (storage.foldername(name))[1]);
