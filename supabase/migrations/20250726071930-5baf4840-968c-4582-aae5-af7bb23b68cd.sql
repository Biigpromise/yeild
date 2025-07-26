-- Fix search path for handle_new_user_verification function
CREATE OR REPLACE FUNCTION public.handle_new_user_verification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  confirmation_url TEXT;
  function_response JSON;
BEGIN
  -- Only send verification email for new signups (not confirmations)
  IF NEW.email_confirmed_at IS NULL AND OLD IS NULL THEN
    -- Build the confirmation URL
    confirmation_url := 'https://yeildsocials.com/auth/confirm?token=' || NEW.confirmation_token || '&type=signup&redirect_to=' || encode(convert_to('https://yeildsocials.com/dashboard', 'utf8'), 'base64');
    
    -- Call the send-verification-email edge function
    BEGIN
      SELECT content::json INTO function_response
      FROM http((
        'POST',
        'https://stehjqdbncykevpokcvj.supabase.co/functions/v1/send-verification-email',
        ARRAY[
          http_header('Content-Type', 'application/json'),
          http_header('Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true))
        ],
        'application/json',
        json_build_object(
          'email', NEW.email,
          'name', COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
          'confirmationUrl', confirmation_url
        )::text
      ));
      
      -- Log success
      INSERT INTO public.user_activity_logs (
        user_id,
        action,
        activity_data
      ) VALUES (
        NEW.id,
        'verification_email_triggered',
        json_build_object(
          'email', NEW.email,
          'timestamp', now(),
          'function_response', function_response
        )
      );
      
    EXCEPTION WHEN OTHERS THEN
      -- Log error but don't fail user creation
      INSERT INTO public.user_activity_logs (
        user_id,
        action,
        activity_data
      ) VALUES (
        NEW.id,
        'verification_email_error',
        json_build_object(
          'email', NEW.email,
          'error', SQLERRM,
          'timestamp', now()
        )
      );
    END;
  END IF;
  
  RETURN NEW;
END;
$$;