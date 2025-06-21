
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

// Function to send confirmation email
export const sendConfirmationEmail = async (email: string, name?: string) => {
  try {
    console.log("Sending confirmation email to:", email);
    
    // Create confirmation URL
    const redirectUrl = window.location.origin;
    const confirmationUrl = `${redirectUrl}/dashboard`; // This will be updated with actual confirmation token by Supabase
    
    const { error } = await supabase.functions.invoke('send-signup-confirmation', {
      body: { 
        email, 
        name,
        confirmationUrl 
      }
    });
    
    if (error) {
      console.error("Error sending confirmation email:", error);
    } else {
      console.log("Confirmation email sent successfully");
    }
  } catch (error) {
    console.error("Unexpected error sending confirmation email:", error);
  }
};
