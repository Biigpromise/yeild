
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerifyCodeRequest {
  email: string;
  code: string;
  type: 'signup' | 'signin';
  password?: string;
  name?: string;
  userType?: 'user' | 'brand';
  userData?: Record<string, unknown>;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== Starting verification process ===');
    
    const requestBody = await req.json();
    console.log('Request body received:', { ...requestBody, code: '[REDACTED]' });
    
    const { email, code, type, password, name, userType, userData }: VerifyCodeRequest = requestBody;

    if (!email || !code || !type) {
      console.log('Missing required fields:', { email: !!email, code: !!code, type: !!type });
      return new Response(
        JSON.stringify({ error: 'Email, code, and type are required' }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log('Supabase client initialized');

    // Determine post-auth redirect path based on user_type metadata (brand vs operator)
    let redirectPath = userType === 'brand' ? '/brand-dashboard' : '/dashboard';
    try {
      const { data: usersList } = await supabase.auth.admin.listUsers();
      const matchedUser = usersList?.users?.find((u: any) => u.email === email);
      const existingUserType = matchedUser?.user_metadata?.user_type;
      if (existingUserType === 'brand') redirectPath = '/brand-dashboard';
    } catch (e) {
      console.error('Could not resolve user_type for redirect, defaulting to /dashboard', e);
    }
    console.log('Post-auth redirectPath:', redirectPath);

    console.log('Verifying code for email:', email, 'type:', type);

    // Find the verification code
    const { data: existingCode, error: existingError } = await supabase
      .from('email_verification_codes')
      .select('*')
      .eq('email', email)
      .eq('verification_code', code)
      .maybeSingle();

    if (existingError) {
      console.error('Database error when fetching verification code:', existingError);
      return new Response(
        JSON.stringify({ error: 'Database error occurred' }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    if (!existingCode) {
      console.log('Verification code not found for email:', email);
      return new Response(
        JSON.stringify({ error: 'Invalid verification code' }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    console.log('Found verification code:', {
      id: existingCode.id,
      verified_at: existingCode.verified_at,
      expires_at: existingCode.expires_at,
      attempt_count: existingCode.attempt_count
    });

    // Check if already verified
    if (existingCode.verified_at) {
      console.log('Code already verified at:', existingCode.verified_at);
      
      // For already verified signin/signup codes, recover by generating a fresh magic link.
      // This prevents a successful account creation from turning into a non-2xx error if the
      // browser retries the request or the user taps verify again before redirect completes.
      if (type === 'signin' || type === 'signup') {
        try {
          console.log('Generating new magic link for already verified code');
          const { data: magicLink, error: linkError } = await supabase.auth.admin.generateLink({
            type: 'magiclink',
            email: email,
            options: {
              redirectTo: `${Deno.env.get('SITE_URL') || 'https://yeildsocials.com'}${redirectPath}`
            }
          });

          if (!linkError && magicLink?.properties?.action_link) {
            console.log('Successfully generated new magic link');
            return new Response(
              JSON.stringify({ 
                success: true, 
                token: existingCode.token,
                magicLink: magicLink.properties.action_link,
                message: 'Code already verified, signing you in...',
                verified: true,
                alreadyVerified: true
              }),
              { 
                status: 200, 
                headers: { 'Content-Type': 'application/json', ...corsHeaders } 
              }
            );
          } else {
            console.error('Failed to generate new magic link:', linkError);
          }
        } catch (linkError) {
          console.error('Error generating new magic link:', linkError);
        }

        if (type === 'signup') {
          return new Response(
            JSON.stringify({
              success: true,
              token: existingCode.token,
              message: 'Code already verified. Please sign in to continue.',
              verified: true,
              alreadyVerified: true
            }),
            { 
              status: 200, 
              headers: { 'Content-Type': 'application/json', ...corsHeaders } 
            }
          );
        }
      }
      
      return new Response(
        JSON.stringify({ error: 'This verification code has already been used. Please request a new one.' }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Check if expired
    if (new Date(existingCode.expires_at) < new Date()) {
      console.log('Verification code expired at:', existingCode.expires_at);
      return new Response(
        JSON.stringify({ error: 'Verification code has expired. Please request a new one.' }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Check attempt limit (increment first to include current attempt)
    const newAttemptCount = (existingCode.attempt_count || 0) + 1;
    console.log('Attempt count:', newAttemptCount);
    
    if (newAttemptCount > 5) {
      console.log('Too many attempts for verification code');
      return new Response(
        JSON.stringify({ error: 'Too many attempts. Please request a new code.' }),
        { 
          status: 429, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Update attempt count only
    const { error: updateAttemptError } = await supabase
      .from('email_verification_codes')
      .update({ 
        attempt_count: newAttemptCount,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingCode.id);

    if (updateAttemptError) {
      console.error('Error updating attempt count:', updateAttemptError);
    }

    console.log('Code validation successful, proceeding with verification...');

    // For signin, create a magic link for auto sign-in
    if (type === 'signin') {
      try {
        console.log('Generating magic link for signin');
        const { data: magicLink, error: linkError } = await supabase.auth.admin.generateLink({
          type: 'magiclink',
          email: email,
          options: {
            redirectTo: `${Deno.env.get('SITE_URL') || 'https://yeildsocials.com'}${redirectPath}`
          }
        });

        if (!linkError && magicLink?.properties?.action_link) {
          console.log('Successfully generated magic link for signin');
          return new Response(
            JSON.stringify({ 
              success: true, 
              token: existingCode.token,
              magicLink: magicLink.properties.action_link,
              message: 'Code verified successfully - redirecting...' 
            }),
            { 
              status: 200, 
              headers: { 'Content-Type': 'application/json', ...corsHeaders } 
            }
          );
        } else {
          console.error('Failed to generate magic link:', linkError);
          // Continue without magic link for signin
        }
      } catch (linkError) {
        console.error('Error generating magic link:', linkError);
        // Continue without magic link for signin
      }
    }

    // For signup, confirm the user's email and mark as verified
    if (type === 'signup') {
      try {
        console.log('Confirming user email for signup verification');
        
        // Find the user in auth.users by email
        const { data: authUsers, error: userError } = await supabase.auth.admin.listUsers();
        
        if (userError) {
          console.error('Error fetching users:', userError);
          return new Response(
            JSON.stringify({ error: 'Failed to verify user account' }),
            { 
              status: 500, 
              headers: { 'Content-Type': 'application/json', ...corsHeaders } 
            }
          );
        }
        
        let user = authUsers.users.find(u => u.email === email);
        
        if (!user) {
          if (!password) {
            console.log('User not found and password was not provided for deferred signup:', email);
            return new Response(
              JSON.stringify({ success: false, error: 'Signup details expired. Please start signup again.' }),
              { 
                status: 400, 
                headers: { 'Content-Type': 'application/json', ...corsHeaders } 
              }
            );
          }

          console.log('Creating verified user after code validation:', email);
          const { data: createdUser, error: createUserError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
              name: name || email.split('@')[0],
              user_type: userType || 'user',
              ...(userData || {})
            }
          });

          if (createUserError || !createdUser?.user) {
            console.error('Error creating verified user:', createUserError);
            return new Response(
              JSON.stringify({ success: false, error: createUserError?.message || 'Failed to create account' }),
              { 
                status: 400, 
                headers: { 'Content-Type': 'application/json', ...corsHeaders } 
              }
            );
          }

          user = createdUser.user;
          console.log('Created verified user successfully:', user.id);
        } else {
          console.log('Found user, confirming email:', user.id);
          
          const { error: updateError } = await supabase.auth.admin.updateUserById(
            user.id,
            {
              email_confirm: true
            }
          );
          
          if (updateError) {
            console.error('Error confirming user email:', updateError);
            return new Response(
              JSON.stringify({ error: 'Failed to confirm email address' }),
              { 
                status: 500, 
                headers: { 'Content-Type': 'application/json', ...corsHeaders } 
              }
            );
          }
          
          console.log('User email confirmed successfully');
        }
        
        // Mark verification code as used
        const { error: verifyError } = await supabase
          .from('email_verification_codes')
          .update({ 
            verified_at: new Date().toISOString(),
            used_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', existingCode.id);
        
        if (verifyError) {
          console.error('Error marking code as verified:', verifyError);
          // Continue anyway - the user is confirmed
        }
        
        // Generate a magic link for immediate sign-in
        const { data: magicLink, error: linkError } = await supabase.auth.admin.generateLink({
          type: 'magiclink',
          email: email,
          options: {
            redirectTo: `${Deno.env.get('SITE_URL') || 'https://yeildsocials.com'}${redirectPath}`
          }
        });
        
        if (!linkError && magicLink?.properties?.action_link) {
          console.log('Generated magic link for newly verified user');
          return new Response(
            JSON.stringify({ 
              success: true, 
              token: existingCode.token,
              magicLink: magicLink.properties.action_link,
              message: 'Email verified successfully! Signing you in...',
              verified: true
            }),
            { 
              status: 200, 
              headers: { 'Content-Type': 'application/json', ...corsHeaders } 
            }
          );
        } else {
          console.log('Magic link generation failed, returning success without auto-signin');
          return new Response(
            JSON.stringify({ 
              success: true, 
              token: existingCode.token,
              message: 'Email verified successfully! You can now sign in.',
              verified: true
            }),
            { 
              status: 200, 
              headers: { 'Content-Type': 'application/json', ...corsHeaders } 
            }
          );
        }
        
      } catch (signupError) {
        console.error('Error in signup verification process:', signupError);
        return new Response(
          JSON.stringify({ error: 'Failed to complete signup verification' }),
          { 
            status: 500, 
            headers: { 'Content-Type': 'application/json', ...corsHeaders } 
          }
        );
      }
    }

    // For signin, return success without marking as verified yet
    // The code will be marked as verified by the frontend after successful account creation
    console.log('Returning success response for signup verification');
    return new Response(
      JSON.stringify({ 
        success: true, 
        token: existingCode.token,
        codeId: existingCode.id,
        message: 'Code verified successfully' 
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );

  } catch (error: any) {
    console.error('Unexpected error in verify-signup-code function:', error);
    console.error('Error stack:', error.stack);
    
    return new Response(
      JSON.stringify({ 
        error: 'An unexpected error occurred during verification. Please try again.',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
  }
};

serve(handler);
