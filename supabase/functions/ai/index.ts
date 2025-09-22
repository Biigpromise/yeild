import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, model = 'google/gemini-2.5-pro', systemPrompt, testingScenario } = await req.json();

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Create system prompt based on testing scenario
    let finalSystemPrompt = systemPrompt || `You are an AI tester evaluating a social media task platform called Yeild Socials (yeildsocials.com). 
    
Provide detailed feedback on:
- User Experience (navigation, clarity, design)
- Technical Issues (bugs, broken links, loading issues)
- Content Quality (text, messaging, flow)
- Mobile Responsiveness
- Accessibility
- Performance
- Conversion Optimization

Be specific and actionable in your recommendations.`;

    if (testingScenario) {
      finalSystemPrompt += `\n\nCurrent Testing Scenario: ${testingScenario}
      
Focus your analysis on this specific user journey and provide detailed step-by-step feedback.`;
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { 
            role: 'system', 
            content: finalSystemPrompt
          },
          { 
            role: 'user', 
            content: message 
          }
        ],
        max_completion_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', errorText);
      throw new Error(`AI Gateway error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    return new Response(JSON.stringify({ 
      response: aiResponse,
      model: model,
      scenario: testingScenario 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in AI function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Failed to get AI response' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});