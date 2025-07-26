
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const PRODUCTION_DOMAIN = 'https://yeildsocials.com';

export function useResendBrandConfirmation() {
  const [resendLoading, setResendLoading] = useState(false);

  const resend = useCallback(async (email?: string | null, companyName?: string | null) => {
    if (!email || !companyName) {
      toast.error('Missing application context, please refresh and try again.');
      return false;
    }
    
    setResendLoading(true);
    try {
      console.log('Resending brand confirmation email to:', email, 'Company:', companyName);
      
      const magicLinkUrl = `${PRODUCTION_DOMAIN}/brand-dashboard`;
      
      const brandEmail = {
        to: email,
        subject: '✅ Confirm your YEILD brand account - Action Required',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Confirm Your YEILD Brand Account</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to YEILD!</h1>
              <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Hi ${companyName}, let's get you started</p>
            </div>
            
            <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none;">
              <p style="font-size: 16px; margin-bottom: 20px;">
                Thank you for signing up with YEILD as a brand partner! To complete your registration and access your brand dashboard, please confirm your email address by clicking the button below.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${magicLinkUrl}" 
                   style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                          color: white; 
                          padding: 15px 30px; 
                          text-decoration: none; 
                          border-radius: 8px; 
                          font-weight: bold; 
                          font-size: 16px;
                          display: inline-block;
                          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);">
                  Confirm My Account
                </a>
              </div>
              
              <p style="font-size: 14px; color: #666; margin-top: 30px;">
                If the button doesn't work, you can also copy and paste this link into your browser:
              </p>
              <p style="background: #f8f9fa; padding: 15px; border-radius: 5px; word-break: break-all; font-size: 14px; margin: 15px 0;">
                <a href="${magicLinkUrl}" style="color: #667eea;">${magicLinkUrl}</a>
              </p>
              
              <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
              
              <h3 style="color: #333; margin-bottom: 15px;">What's Next?</h3>
              <ul style="color: #666; font-size: 14px;">
                <li>Your brand application will be reviewed by our team</li>
                <li>You'll receive an update within 24-48 hours</li>
                <li>Once approved, you can start creating campaigns</li>
                <li>Access advanced analytics and targeting options</li>
              </ul>
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
        email_type: 'brand_confirmation'
      };

      // Use priority queue for instant delivery
      const { error } = await supabase.functions.invoke('priority-email-queue', {
        body: { emails: [brandEmail] }
      });
      
      if (error) {
        console.error('Failed to queue brand confirmation email:', error);
        throw error;
      }
      
      console.log('Brand confirmation email queued for priority delivery');
      toast.success('Confirmation email sent! Please check your inbox.');
      return true;
    } catch (err) {
      console.error('Failed to resend confirmation email', err);
      toast.error('Failed to resend confirmation email. Please try again shortly.');
      return false;
    } finally {
      setResendLoading(false);
    }
  }, []);

  return { resend, resendLoading };
}
