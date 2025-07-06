-- Remove unique constraint on post_reactions to allow multiple reactions per user
ALTER TABLE public.post_reactions DROP CONSTRAINT IF EXISTS post_reactions_post_id_user_id_key;

-- Add emoji field to support different reaction types like Facebook
ALTER TABLE public.post_reactions ADD COLUMN IF NOT EXISTS emoji TEXT DEFAULT '👍';

-- Update the unique constraint to allow multiple reactions but prevent duplicate emoji reactions
ALTER TABLE public.post_reactions ADD CONSTRAINT post_reactions_post_user_emoji_unique 
UNIQUE (post_id, user_id, emoji);

-- Update reaction_type to be more flexible (keep for backward compatibility)
ALTER TABLE public.post_reactions ALTER COLUMN reaction_type DROP NOT NULL;