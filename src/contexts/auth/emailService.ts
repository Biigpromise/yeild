
import { supabase } from "@/integrations/supabase/client";

// Function to send welcome email
export const sendWelcomeEmail = async (email: string, name?: string) => {
  try {
    console.log("Sending welcome email to:", email);
    const { error } = await supabase.functions.invoke('send-welcome-email', {
      body: { email, name }
    });
    
    if (error) {
      console.error("Error sending welcome email:", error);
    } else {
      console.log("Welcome email sent successfully");
    }
  } catch (error) {
    console.error("Unexpected error sending welcome email:", error);
  }
};

// Note: Custom confirmation email no longer needed as we use Supabase's built-in email confirmation
