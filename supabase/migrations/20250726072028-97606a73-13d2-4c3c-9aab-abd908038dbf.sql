-- Remove the trigger we created since we're handling emails manually
DROP TRIGGER IF EXISTS send_verification_email_trigger ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user_verification();