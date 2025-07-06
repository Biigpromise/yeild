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
    const { message, context = 'admin', action_type = 'query' } = await req.json();

    if (!message) {
      throw new Error('Message is required');
    }

    console.log('Processing admin AI request:', { message, context, action_type });

    // System prompt for admin assistant
    const systemPrompt = `You are an intelligent AI assistant for a social media platform admin dashboard. Your role is to help administrators with:

1. USER MANAGEMENT: Finding users, managing roles, detecting suspicious activity
2. TASK MANAGEMENT: Creating, editing, reviewing tasks and submissions
3. CONTENT MODERATION: Managing posts, comments, reports
4. ANALYTICS: Interpreting platform metrics and user behavior
5. NAVIGATION: Guiding admins to specific dashboard sections
6. QUICK ACTIONS: Executing common admin operations

Current Admin Dashboard Sections:
- overview: Platform statistics and recent activity
- users: User management and profiles
- tasks: Task creation and management
- enhanced-tasks: Advanced task management
- brands: Brand applications and management
- analytics: Platform analytics and insights
- notifications: Admin notifications
- communication: User communication tools
- content: Content management and moderation
- security: Security settings and fraud detection
- settings: Platform configuration
- wallet: Financial management and payouts

RESPONSE FORMAT:
Respond with JSON containing:
{
  "response": "Your helpful response text",
  "action": "navigate|execute|query|create",
  "target": "section_name or specific_action",
  "parameters": { key: value pairs if needed },
  "confidence": 0.0-1.0,
  "suggestions": ["array of helpful suggestions"]
}

EXAMPLES:
- "Show me pending tasks" → action: "navigate", target: "tasks"
- "Find user John" → action: "execute", target: "search_user", parameters: {"query": "John"}
- "Create announcement about maintenance" → action: "create", target: "announcement"
- "What's the current user activity?" → action: "query", target: "user_stats"

Be concise but helpful. Always provide actionable responses.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('AI Response:', aiResponse);

    // Try to parse as JSON, fallback to text response
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(aiResponse);
    } catch {
      parsedResponse = {
        response: aiResponse,
        action: 'query',
        target: null,
        parameters: {},
        confidence: 0.8,
        suggestions: []
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
        response: "I'm sorry, I encountered an error processing your request. Please try again.",
        action: "query",
        target: null,
        parameters: {},
        confidence: 0.0,
        suggestions: []
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});