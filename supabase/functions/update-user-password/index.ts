
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.9';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface UpdatePasswordRequest {
  userId: string;
  password: string;
  token: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log('Update user password function called');
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, password, token }: UpdatePasswordRequest = await req.json();
    console.log('Processing password update for user:', userId);

    if (!userId || !password || !token) {
      throw new Error('User ID, password, and token are required');
    }

    // Create Supabase client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify the token is still valid
    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .from('password_reset_tokens')
      .select('user_id, email, expires_at, used_at')
      .eq('token', token)
      .eq('user_id', userId)
      .single();

    if (tokenError) {
      console.error('Token verification error:', tokenError);
      throw new Error('Invalid or expired reset token');
    }

    if (!tokenData) {
      throw new Error('Reset token not found');
    }

    // Check if token is expired
    const now = new Date();
    const expiresAt = new Date(tokenData.expires_at);
    
    if (now > expiresAt) {
      throw new Error('Reset token has expired');
    }

    // Check if token has already been used
    if (tokenData.used_at) {
      throw new Error('Reset token has already been used');
    }

    // Update user password using admin client
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { password: password }
    );

    if (updateError) {
      console.error('Password update error:', updateError);
      throw new Error('Failed to update password: ' + updateError.message);
    }

    // Mark token as used
    const { error: markUsedError } = await supabaseAdmin
      .from('password_reset_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('token', token);

    if (markUsedError) {
      console.error('Error marking token as used:', markUsedError);
      // Don't fail the request for this, password was already updated
    }

    console.log('Password updated successfully for user:', userId);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Password updated successfully"
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );

  } catch (error: any) {
    console.error("Error in update-user-password function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Failed to update password",
        success: false 
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);
