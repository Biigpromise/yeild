import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { handleAuthError, checkEmailExists } from "./authErrorHandler";
import { EmailMonitoringService } from "@/services/emailMonitoring";

const PRODUCTION_DOMAIN = 'https://yeildsocials.com';

export const useAuthOperations = () => {
  const signUp = async (email: string, password: string, name?: string, userType?: string, additionalData?: Record<string, any>, emailRedirectTo?: string) => {
    try {
      console.log("Attempting signup for:", email, "Type:", userType);
      
      if (!email || !password) {
        const error = new Error("Email and password are required");
        return { user: null, error };
      }

      if (password.length < 6) {
        const error = new Error("Password must be at least 6 characters long");
        return { user: null, error };
      }

      // Check for referral code in URL
      const urlParams = new URLSearchParams(window.location.search);
      const refCode = urlParams.get('ref');

      // Always use production domain for email confirmation
      const redirectUrl = `${PRODUCTION_DOMAIN}/auth/callback`;
      
      console.log("Using redirect URL:", redirectUrl);

      // For brand signup, include company-specific data
      const signUpData = {
        ...(name ? { name } : {}),
        ...(userType ? { user_type: userType } : {}),
        ...(refCode ? { referral_code: refCode } : {}),
        // For brands, also include company name
        ...(userType === 'brand' && name ? { company_name: name } : {}),
        ...additionalData
      };
      
      // Check if email already exists before attempting signup
      const { exists } = await checkEmailExists(email);
      
      if (exists) {
        return { 
          user: null, 
          error: { 
            message: "An account with this email already exists. Try signing in instead, or use 'Continue with Google' if you created your account with Google." 
          } 
        };
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: Object.keys(signUpData).length > 0 ? signUpData : undefined,
          emailRedirectTo: redirectUrl
        }
      });
      
      if (error) {
        const friendlyMessage = handleAuthError(error, 'signup');
        return { user: null, error: { ...error, message: friendlyMessage } };
      }

      // Handle referral code after successful signup
      if (refCode && data.user) {
        try {
          await supabase.rpc('handle_referral_signup_improved', {
            new_user_id: data.user.id,
            referral_code_param: refCode
          });
          console.log('Referral code processed during signup:', refCode);
        } catch (refError) {
          console.error('Error processing referral during signup:', refError);
        }
      }

      // Send verification email using priority queue for instant delivery
      if (data.user && !data.user.email_confirmed_at) {
        try {
          const displayName = data.user.user_metadata?.name || data.user.email?.split('@')[0];
          const confirmationUrl = `${PRODUCTION_DOMAIN}/auth/callback`;

          const verificationEmail = {
            to: data.user.email,
            subject: "✅ Verify your YEILD account - Action Required",
            html: `
              <!DOCTYPE html>
              <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Verify Your YEILD Account</title>
              </head>
              <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                  <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to YEILD!</h1>
                  <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Hi ${displayName}, let's verify your account</p>
                </div>
                
                <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none;">
                  <p style="font-size: 16px; margin-bottom: 20px;">
                    Thank you for signing up with YEILD! To complete your registration and access your account, please verify your email address by clicking the button below.
                  </p>
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${confirmationUrl}" 
                       style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                              color: white; 
                              padding: 15px 30px; 
                              text-decoration: none; 
                              border-radius: 8px; 
                              font-weight: bold; 
                              font-size: 16px;
                              display: inline-block;
                              box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);">
                      Verify My Account
                    </a>
                  </div>
                  
                  <p style="font-size: 14px; color: #666; margin-top: 30px;">
                    If the button doesn't work, you can also copy and paste this link into your browser:
                  </p>
                  <p style="background: #f8f9fa; padding: 15px; border-radius: 5px; word-break: break-all; font-size: 14px; margin: 15px 0;">
                    <a href="${confirmationUrl}" style="color: #667eea;">${confirmationUrl}</a>
                  </p>
                  
                  <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
                  
                  <h3 style="color: #333; margin-bottom: 15px;">What's Next?</h3>
                  <ul style="color: #666; font-size: 14px;">
                    <li>Complete your profile setup</li>
                    <li>Start earning points by completing tasks</li>
                    <li>Invite friends and earn referral bonuses</li>
                    <li>Redeem your points for rewards</li>
                  </ul>
                  
                  <p style="font-size: 14px; color: #666; margin-top: 30px;">
                    If you didn't create this account, please ignore this email or contact our support team.
                  </p>
                </div>
                
                <div style="background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0; border-top: none;">
                  <p style="margin: 0; font-size: 14px; color: #666;">
                    Best regards,<br>
                    <strong>The YEILD Team</strong>
                  </p>
                  <p style="margin: 10px 0 0 0; font-size: 12px; color: #999;">
                    © 2024 YEILD. All rights reserved.
                  </p>
                </div>
              </body>
              </html>
            `,
            priority: 'high' as const,
            email_type: 'verification'
          };

          // Use priority queue for instant delivery
          const { error: queueError } = await supabase.functions.invoke('priority-email-queue', {
            body: { emails: [verificationEmail] }
          });

          if (queueError) {
            console.error('Priority email queue failed:', queueError);
            toast.warning("Account created but verification email couldn't be sent. You can request a new one later.");
          } else {
            console.log('Verification email queued for priority delivery');
            toast.success("Account created! Please check your email to verify your account.");
          }
        } catch (emailError) {
          console.error('Unexpected error sending verification email:', emailError);
          toast.warning("Account created but verification email couldn't be sent. You can request a new one later.");
        }
      }

      console.log("Signup successful - email confirmation required");
      return { user: data.user, error: null };
    } catch (error) {
      console.error("Signup unexpected error:", error);
      const friendlyMessage = handleAuthError(error, 'signup');
      return { user: null, error: { message: friendlyMessage } };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log("AuthContext: Attempting sign in for:", email);
      
      if (!email || !password) {
        const error = new Error("Email and password are required");
        return { error };
      }

      // Check if email exists and if it's OAuth-only before attempting sign in
      const { exists, isOAuthOnly } = await checkEmailExists(email);
      
      if (exists && isOAuthOnly) {
        return { 
          error: { 
            message: "This account was created with Google. Please use 'Continue with Google' to sign in, or reset your password to enable email/password sign in." 
          } 
        };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        // Provide more specific error for non-existent accounts
        if (error.message.includes('Invalid login credentials') && !exists) {
          return { 
            error: { 
              ...error, 
              message: "No account found with this email address. Please check your email or create a new account." 
            } 
          };
        }
        
        const friendlyMessage = handleAuthError(error, 'sign in');
        return { error: { ...error, message: friendlyMessage } };
      }

      // Check if email is confirmed for regular users - DON'T sign out, just redirect to confirmation
      if (data.user && !data.user.email_confirmed_at) {
        const isBrandUser = data.user.user_metadata?.user_type === 'brand' || 
                           data.user.user_metadata?.company_name;
        
        if (!isBrandUser) {
          console.log("User email not confirmed, will redirect to confirmation page");
          toast.warning("Please check your email and confirm your account to access all features.");
          // Don't sign out - let them stay signed in but redirect to confirmation page
          return { error: null, needsEmailConfirmation: true };
        } else {
          console.log("Brand user signing in without email confirmation");
          toast.warning("Please confirm your email to access all brand features.");
        }
      }

      // Check if brand user has proper metadata, if not, create it
      if (data.user) {
        const isBrandUser = data.user.user_metadata?.user_type === 'brand' || 
                           data.user.user_metadata?.company_name;
        
        if (isBrandUser) {
          try {
            // Check if brand application exists
            const { data: brandApp, error: brandAppError } = await supabase
              .from('brand_applications')
              .select('id')
              .eq('user_id', data.user.id)
              .single();

            if (brandAppError && brandAppError.code === 'PGRST116') {
              // Create brand application if it doesn't exist
              console.log('Creating missing brand application for user:', data.user.id);
              await supabase
                .from('brand_applications')
                .insert({
                  user_id: data.user.id,
                  company_name: data.user.user_metadata?.company_name || data.user.user_metadata?.name || 'Brand User',
                  website: data.user.user_metadata?.website || '',
                  industry: data.user.user_metadata?.industry || 'Other',
                  company_size: data.user.user_metadata?.company_size || '1-10',
                  task_types: data.user.user_metadata?.task_types || [],
                  budget: data.user.user_metadata?.budget || '$1,000 - $5,000',
                  goals: data.user.user_metadata?.goals || 'Brand promotion',
                  email_confirmed: !!data.user.email_confirmed_at
                });
            }

            // Ensure brand role is assigned
            const { data: roleData } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', data.user.id)
              .eq('role', 'brand')
              .single();

            if (!roleData) {
              console.log('Assigning brand role to user:', data.user.id);
              await supabase
                .from('user_roles')
                .insert({
                  user_id: data.user.id,
                  role: 'brand'
                });
            }
          } catch (brandError) {
            console.error('Error handling brand application:', brandError);
          }
        }
      }

      console.log("AuthContext: Sign in successful");
      
      // Check user roles after successful sign in
      if (data.user) {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', data.user.id);
        
        console.log("User roles:", roleData);
      }

      return { error: null };
    } catch (error) {
      console.error("AuthContext: Sign in unexpected error:", error);
      const friendlyMessage = handleAuthError(error, 'sign in');
      return { error: { message: friendlyMessage } };
    }
  };

  const signOut = async () => {
    try {
      console.log("AuthContext: Signing out");
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Sign out error:", error);
        toast.error("Failed to sign out properly");
      } else {
        console.log("Sign out successful");
        toast.success("Signed out successfully");
        // Force redirect to home page
        window.location.href = '/';
      }
    } catch (error) {
      console.error("Sign out unexpected error:", error);
      toast.error("An error occurred while signing out");
    }
  };

  const signInWithProvider = async (provider: 'google' | 'github' | 'twitter', userType?: string) => {
    try {
      console.log("AuthContext: Attempting provider sign in with:", provider, "Type:", userType);
      
      // Get current URL for referral code
      const urlParams = new URLSearchParams(window.location.search);
      const refCode = urlParams.get('ref');
      
      // Always redirect to production domain
      const redirectUrl = `${PRODUCTION_DOMAIN}/auth/callback`;
      
      const queryParams: Record<string, string> = {
        user_type: userType || 'user'
      };
      
      // Include referral code if present
      if (refCode) {
        queryParams.ref = refCode;
      }
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectUrl,
          queryParams
        }
      });
      
      if (error) {
        const friendlyMessage = handleAuthError(error, `${provider} sign in`);
        return { error: { ...error, message: friendlyMessage } };
      }
      
      return { error: null };
    } catch (error) {
      console.error("AuthContext: Provider sign in unexpected error:", error);
      const friendlyMessage = handleAuthError(error, `${provider} sign in`);
      return { error: { message: friendlyMessage } };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      console.log("AuthContext: Attempting password reset for:", email);
      
      if (!email) {
        const error = new Error("Email is required");
        return { error };
      }

      // Create password reset email with high priority using production domain
      const resetEmail = {
        to: email,
        subject: "🔑 Reset your YEILD password - Action Required",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset Your YEILD Password</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Password Reset</h1>
              <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Reset your YEILD account password</p>
            </div>
            
            <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none;">
              <p style="font-size: 16px; margin-bottom: 20px;">
                We received a request to reset your YEILD account password. Click the button below to create a new password:
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${PRODUCTION_DOMAIN}/reset-password" 
                   style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                          color: white; 
                          padding: 15px 30px; 
                          text-decoration: none; 
                          border-radius: 8px; 
                          font-weight: bold; 
                          font-size: 16px;
                          display: inline-block;
                          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);">
                  Reset My Password
                </a>
              </div>
              
              <p style="font-size: 14px; color: #666; margin-top: 30px;">
                If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
              </p>
              
              <p style="font-size: 14px; color: #666; margin-top: 15px;">
                For security reasons, this link will expire in 1 hour.
              </p>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0; border-top: none;">
              <p style="margin: 0; font-size: 14px; color: #666;">
                Best regards,<br>
                <strong>The YEILD Team</strong>
              </p>
              <p style="margin: 10px 0 0 0; font-size: 12px; color: #999;">
                © 2024 YEILD. All rights reserved.
              </p>
            </div>
          </body>
          </html>
        `,
        priority: 'high' as const,
        email_type: 'password_reset'
      };

      // Use priority queue for instant delivery
      const { error: queueError } = await supabase.functions.invoke('priority-email-queue', {
        body: { emails: [resetEmail] }
      });
      
      if (queueError) {
        console.error("Priority password reset queue error:", queueError);
        
        // Fallback to Supabase's default password reset with production domain
        const resetUrl = `${PRODUCTION_DOMAIN}/reset-password`;
        const { error: fallbackError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: resetUrl
        });
        
        if (fallbackError) {
          const friendlyMessage = handleAuthError(fallbackError, 'password reset');
          return { error: { ...fallbackError, message: friendlyMessage } };
        }
      }

      console.log("AuthContext: Password reset email sent successfully");
      return { error: null };
    } catch (error) {
      console.error("AuthContext: Password reset unexpected error:", error);
      const friendlyMessage = handleAuthError(error, 'password reset');
      return { error: { message: friendlyMessage } };
    }
  };

  const resendConfirmation = async (email: string) => {
    try {
      console.log("AuthContext: Resending confirmation email for:", email);
      
      if (!email) {
        const error = new Error("Email is required");
        return { error };
      }

      const displayName = email.split('@')[0];
      const confirmationUrl = `${PRODUCTION_DOMAIN}/auth/callback`;

      const verificationEmail = {
        to: email,
        subject: "✅ Verify your YEILD account - Action Required",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verify Your YEILD Account</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to YEILD!</h1>
              <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Hi ${displayName}, let's verify your account</p>
            </div>
            
            <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none;">
              <p style="font-size: 16px; margin-bottom: 20px;">
                Please verify your email address by clicking the button below to complete your YEILD account setup.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${confirmationUrl}" 
                   style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                          color: white; 
                          padding: 15px 30px; 
                          text-decoration: none; 
                          border-radius: 8px; 
                          font-weight: bold; 
                          font-size: 16px;
                          display: inline-block;
                          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);">
                  Verify My Account
                </a>
              </div>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0; border-top: none;">
              <p style="margin: 0; font-size: 14px; color: #666;">
                Best regards,<br>
                <strong>The YEILD Team</strong>
              </p>
            </div>
          </body>
          </html>
        `,
        priority: 'high' as const,
        email_type: 'verification'
      };

      // Use priority queue for instant delivery
      const { error: queueError } = await supabase.functions.invoke('priority-email-queue', {
        body: { emails: [verificationEmail] }
      });

      if (queueError) {
        console.error('Priority confirmation queue failed:', queueError);
        // Fallback to Supabase's default resend with production domain
        const { error: fallbackError } = await supabase.auth.resend({
          type: 'signup',
          email: email,
          options: {
            emailRedirectTo: `${PRODUCTION_DOMAIN}/auth/callback`
          }
        });
        
        if (fallbackError) {
          const friendlyMessage = handleAuthError(fallbackError, 'resend confirmation');
          return { error: { ...fallbackError, message: friendlyMessage } };
        }
      }

      console.log("AuthContext: Confirmation email resent successfully");
      return { error: null };
    } catch (error) {
      console.error("AuthContext: Resend confirmation unexpected error:", error);
      const friendlyMessage = handleAuthError(error, 'resend confirmation');
      return { error: { message: friendlyMessage } };
    }
  };

  const verifyConfirmationCode = async (inputCode: string): Promise<{ success: boolean; error?: string }> => {
    try {
      return { success: true };
    } catch (error) {
      console.error("Error verifying confirmation code:", error);
      return { success: false, error: "Verification failed" };
    }
  };

  return {
    signUp,
    signIn,
    signOut,
    signInWithProvider,
    resetPassword,
    resendConfirmation,
    verifyConfirmationCode,
  };
};
