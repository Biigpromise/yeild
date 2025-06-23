
-- Create functions for post reaction management
CREATE OR REPLACE FUNCTION public.upsert_post_reaction(
  p_post_id UUID,
  p_user_id UUID,
  p_reaction_type TEXT
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.post_reactions (post_id, user_id, reaction_type)
  VALUES (p_post_id, p_user_id, p_reaction_type)
  ON CONFLICT (post_id, user_id) 
  DO UPDATE SET 
    reaction_type = EXCLUDED.reaction_type,
    created_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.delete_post_reaction(
  p_post_id UUID,
  p_user_id UUID
)
RETURNS VOID AS $$
BEGIN
  DELETE FROM public.post_reactions
  WHERE post_id = p_post_id AND user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
