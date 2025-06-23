
-- Add media_url column to messages table for storing uploaded media
ALTER TABLE public.messages 
ADD COLUMN media_url text;
