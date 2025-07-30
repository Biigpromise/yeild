import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, X-Client-Info',
};

interface CreateUserRequest {
  email: string;
  password: string;
  name?: string;
  userType: string;
  codeId: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('=== Starting user account creation ===');
    
    const requestBody = await req.json();
    console.log('Request body received:', { ...requestBody, password: '[REDACTED]' });
    
    const { email, password, name, userType, codeId }: CreateUserRequest = requestBody;

    if (!email || !password || !userType || !codeId) {
      console.log('Missing required fields:', { 
        email: !!email, 
        password: !!password, 
        userType: !!userType, 
        codeId: !!codeId 
      });
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Email, password, userType, and codeId are required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Initialize Supabase admin client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables');
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Server configuration error' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log('Supabase admin client initialized');

    // Verify the code is still valid and not used
    const { data: codeData, error: codeError } = await supabase
      .from('email_verification_codes')
      .select('*')
      .eq('id', codeId)
      .eq('email', email)
      .single();

    if (codeError || !codeData) {
      console.error('Invalid code ID or code not found:', codeError);
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Invalid verification code' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    if (codeData.verified_at) {
      console.log('Code already verified');
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Verification code already used' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    if (new Date(codeData.expires_at) < new Date()) {
      console.log('Code expired');
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Verification code expired' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    console.log('Creating user account with admin client...');

    // Create user account using admin client (bypasses email confirmation)
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Mark email as confirmed since we verified it
      user_metadata: {
        name: name || email.split('@')[0],
        user_type: userType
      }
    });

    if (userError) {
      console.error('Failed to create user account:', userError);
      return new Response(JSON.stringify({ 
        success: false, 
        message: userError.message || 'Failed to create account' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    console.log('User account created successfully:', userData.user?.id);

    // Mark the verification code as used
    const { error: markError } = await supabase
      .from('email_verification_codes')
      .update({ 
        verified_at: new Date().toISOString(),
        used_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', codeId);

    if (markError) {
      console.error('Error marking code as verified:', markError);
      // Don't fail the entire operation for this
    } else {
      console.log('Verification code marked as used');
    }

    // Generate a session for the user
    console.log('Generating user session...');
    const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: email,
      options: {
        redirectTo: `${window?.location?.origin || 'https://yeildsocials.com'}/dashboard`
      }
    });

    if (sessionError) {
      console.error('Failed to generate session:', sessionError);
      // Still return success since account was created
    }

    console.log('Account creation completed successfully');

    return new Response(JSON.stringify({ 
      success: true,
      user: userData.user,
      session: userData.session,
      magicLink: sessionData?.properties?.action_link,
      message: 'Account created successfully!' 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Unexpected error in create-verified-user function:', error);
    console.error('Error stack:', error.stack);
    
    return new Response(JSON.stringify({ 
      success: false, 
      message: 'An unexpected error occurred during account creation. Please try again.',
      details: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};

serve(handler);