import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { context, currentUserId } = await req.json();

    if (!context) {
      throw new Error('No context provided');
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Create smart reply suggestions based on context
    const prompt = `Based on this conversation context, generate 3 contextually appropriate, helpful, and natural replies. Make them concise and engaging:

Context:
${context}

Generate replies that:
- Are contextually relevant to the conversation
- Show engagement and interest
- Are helpful or add value
- Are natural and conversational
- Are brief (1-2 sentences max)

Return only a JSON array of 3 reply strings, no other text.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that generates contextual chat reply suggestions. Always respond with valid JSON arrays of strings.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 200,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content;

    if (!aiResponse) {
      throw new Error('No response from OpenAI');
    }

    // Parse the JSON response
    let replies;
    try {
      replies = JSON.parse(aiResponse);
      if (!Array.isArray(replies)) {
        throw new Error('Response is not an array');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiResponse);
      // Fallback to predefined responses
      replies = [
        "That's really interesting! Could you tell me more?",
        "I appreciate you sharing that perspective.",
        "Thanks for the insight! That's helpful to know."
      ];
    }

    return new Response(
      JSON.stringify({ replies: replies.slice(0, 3) }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error in generate-smart-replies:', error);
    
    // Return fallback suggestions on error
    const fallbackReplies = [
      "Thanks for sharing that!",
      "That's really helpful to know.",
      "I'd love to hear more about this."
    ];

    return new Response(
      JSON.stringify({ replies: fallbackReplies }),
      {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }
      }
    );
  }
});