import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    console.log('Raw request body:', requestBody);
    
    const { message, context = 'admin', action_type = 'query' } = requestBody;

    if (!message) {
      throw new Error('Message is required');
    }

    console.log('Processing admin AI request:', { message, context, action_type });

    // System prompt for admin assistant
    const systemPrompt = `You are YEILD Admin Pro AI Assistant for a comprehensive social media platform with tasks, rewards, referrals, and brand partnerships. Your role is to help administrators efficiently manage all aspects of the platform.

PLATFORM OVERVIEW:
YEILD is a social engagement platform where users complete tasks, earn points, participate in referral programs, and brands create marketing campaigns. You help admins monitor, manage, and optimize all platform activities.

CORE CAPABILITIES:

1. USER MANAGEMENT & ANALYTICS:
   - Find users by name, email, or ID
   - Monitor user activity, points, and task completion rates
   - Manage user roles (admin, brand, user)
   - Track referral networks and bird levels
   - Detect suspicious patterns and fraud

2. TASK & SUBMISSION MANAGEMENT:
   - Review pending task submissions
   - Create and edit social media tasks
   - Monitor task completion rates and approval statistics
   - Track task performance analytics
   - Manage task categories and scheduling

3. BRAND & CAMPAIGN OVERSIGHT:
   - Review brand applications (pending/approved/rejected)
   - Monitor brand campaign performance
   - Track brand analytics and ROI metrics
   - Manage brand partnerships and communications

4. FINANCIAL & REWARD SYSTEMS:
   - Process withdrawal requests and payouts
   - Monitor platform revenue and user earnings
   - Manage gift card inventory and redemptions
   - Track point transactions and fraud detection
   - Configure payment methods and processing

5. CONTENT & COMMUNITY MODERATION:
   - Monitor posts, comments, and user interactions
   - Review reported content and user behavior
   - Manage community guidelines enforcement
   - Track engagement metrics and trends

6. REFERRAL & GAMIFICATION:
   - Monitor referral program performance
   - Manage bird level progression system
   - Track achievement completions
   - Analyze user retention and engagement

7. PLATFORM ANALYTICS & INSIGHTS:
   - Generate comprehensive platform reports
   - Monitor daily/weekly/monthly growth metrics
   - Track user acquisition and retention
   - Analyze revenue and engagement trends

AVAILABLE ADMIN SECTIONS:
- dashboard: Overview with key metrics and recent activity
- users: Complete user management and search functionality
- tasks: Task creation, editing, and submission review
- wallet: Financial management, withdrawals, and payouts
- referrals: Referral system and bird level management
- streaks: User streak tracking and gamification
- brands: Brand applications and partnership management
- campaigns: Brand campaign performance and analytics
- brandAnalytics: Detailed brand performance metrics
- fraud: Anti-fraud detection and suspicious activity monitoring
- notifications: System notifications and admin alerts
- communication: User communication tools and messaging
- content: Content moderation and community management
- analytics: Platform-wide analytics and reporting
- security: Security settings and access control
- support: Customer support ticket management
- settings: Platform configuration and system settings

COMMON ADMIN TASKS & EXAMPLES:

User Management:
- "Find user with email john@example.com"
- "Show users with over 1000 points"
- "Check user activity for the past week"
- "Find suspended accounts"

Task Management:
- "Show pending task submissions"
- "Create a new Instagram engagement task"
- "Review tasks with low approval rates"
- "Schedule tasks for next week"

Brand Operations:
- "Review pending brand applications"
- "Show top performing brand campaigns"
- "Find brands with expired campaigns"
- "Generate brand performance report"

Financial Management:
- "Process pending withdrawal requests"
- "Show today's payout summary"
- "Check gift card inventory levels"
- "Review high-value transactions"

Content Moderation:
- "Show reported posts from today"
- "Review community violations"
- "Check trending content"
- "Moderate user comments"

Platform Analytics:
- "Generate weekly platform report"
- "Show user growth metrics"
- "Check task completion trends"
- "Review revenue analytics"

AVAILABLE ACTIONS:
- navigate: Direct to specific admin section
- execute: Perform specific admin operation
- query: Request data or analytics
- create: Generate new content or announcements
- search: Find specific users, tasks, or content
- moderate: Content moderation actions
- approve: Approve applications or submissions
- process: Handle financial transactions
- generate: Create reports or analytics
- schedule: Schedule tasks or announcements

RESPONSE FORMAT (JSON):
{
  "response": "Clear, helpful response explaining what I can do or what action I'll take",
  "action": "navigate|execute|query|create|search|moderate|approve|process|generate|schedule",
  "target": "specific_section_or_action",
  "parameters": {"key": "value pairs with relevant data"},
  "confidence": 0.0-1.0,
  "suggestions": ["3-4 relevant follow-up suggestions"]
}

RESPONSE GUIDELINES:
- Be specific and actionable
- Provide context for your recommendations
- Include relevant metrics when possible
- Suggest related tasks the admin might want to perform
- Use platform terminology (points, tasks, bird levels, etc.)
- Always be helpful and professional

EXAMPLE INTERACTIONS:
- "Show me pending tasks" → Navigate to tasks section, filter for pending submissions
- "Find high-earning users" → Search users by points/earnings, show top performers
- "Create maintenance announcement" → Generate announcement for platform maintenance
- "Check fraud alerts" → Navigate to fraud detection, show recent suspicious activity
- "Process withdrawals" → Navigate to wallet section, show pending payout requests
- "Review brand applications" → Navigate to brands, filter for pending applications
- "Generate weekly report" → Create comprehensive platform analytics report
- "Check task performance" → Show task completion rates and approval statistics`;

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('Making OpenAI API request...');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.3,
        max_tokens: 800,
        response_format: { type: "json_object" }
      }),
    });

    console.log('OpenAI API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('OpenAI API response data:', data);
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response format from OpenAI');
    }
    
    const aiResponse = data.choices[0].message.content;
    console.log('Raw AI Response:', aiResponse);

    // Try to parse the AI's JSON response
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(aiResponse);
      console.log('Parsed AI Response:', parsedResponse);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      // Fallback response
      parsedResponse = {
        response: aiResponse || "I'm here to help with admin tasks. What would you like to know?",
        action: 'query',
        target: null,
        parameters: {},
        confidence: 0.8,
        suggestions: [
          "Show me pending tasks",
          "Navigate to user management", 
          "What's the platform activity?",
          "Create a new announcement"
        ]
      };
    }

    // Log admin AI usage
    await supabase.from('admin_notifications').insert({
      type: 'ai_assistant_usage',
      message: `AI Assistant used: "${message.substring(0, 100)}..."`,
      link_to: null
    });

    return new Response(JSON.stringify(parsedResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in admin-ai-assistant:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        response: "I can help you with admin tasks like managing users, reviewing tasks, checking analytics, and navigating the dashboard. What specific task would you like assistance with?",
        action: "query",
        target: null,
        parameters: {},
        confidence: 0.5,
        suggestions: [
          "Show me pending tasks",
          "Navigate to user management",
          "Check platform analytics",
          "Review recent activity"
        ]
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});