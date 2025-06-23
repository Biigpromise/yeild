
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

// Function to generate a 6-digit confirmation code
const generateConfirmationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Function to send confirmation email with code
export const sendConfirmationEmail = async (email: string, name?: string) => {
  try {
    console.log("Sending confirmation email to:", email);
    
    // Generate a 6-digit confirmation code
    const confirmationCode = generateConfirmationCode();
    
    const { error } = await supabase.functions.invoke('send-signup-confirmation', {
      body: { 
        email, 
        name,
        confirmationCode 
      }
    });
    
    if (error) {
      console.error("Error sending confirmation email:", error);
    } else {
      console.log("Confirmation email sent successfully");
    }
    
    return confirmationCode;
  } catch (error) {
    console.error("Unexpected error sending confirmation email:", error);
    return null;
  }
};
