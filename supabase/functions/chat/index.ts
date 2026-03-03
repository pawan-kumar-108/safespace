import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, type } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    let systemPrompt = '';
    
    if (type === 'reflect') {
      systemPrompt = `You are a compassionate, empathetic mental health companion for youth aged 13-25 in the Safe Space app. Your role is to:

1. VALIDATE their feelings first - acknowledge their emotions without judgment
2. Ask gentle, reflective questions to help them explore their feelings
3. Offer soft, practical coping suggestions when appropriate
4. Use warm, supportive language that feels like talking to a caring friend

IMPORTANT RULES:
- Never diagnose or use clinical terms
- Never give medical advice
- If someone expresses crisis or self-harm thoughts, gently encourage them to reach out to a trusted adult or crisis helpline
- Keep responses concise but caring (2-4 sentences typically)
- Use "I hear you", "That sounds really tough", "It makes sense you'd feel that way"
- Avoid toxic positivity - don't dismiss their feelings with "just think positive"

Remember: You're here to help them feel heard and understood, not to fix everything.`;
    } else if (type === 'chat') {
      systemPrompt = `You are a supportive mental health advisor for the Safe Space app, helping youth aged 13-25 with mental wellness guidance.

Your role:
- Provide educational, supportive mental health information
- Share coping strategies and wellness tips
- Help users understand emotions and mental health concepts
- Encourage healthy habits and self-care practices

IMPORTANT BOUNDARIES:
- You are NOT a therapist - you provide general wellness support
- Never diagnose conditions or provide medical advice
- For serious concerns, always recommend speaking with a trusted adult, school counselor, or professional
- If someone mentions self-harm, crisis, or abuse - provide crisis resources and encourage immediate help

Tone: Warm, understanding, non-judgmental, and youth-friendly. Use clear, simple language.

Keep responses helpful but concise. End with a gentle question or actionable suggestion when appropriate.`;
    } else {
      systemPrompt = 'You are a helpful, empathetic assistant.';
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service temporarily unavailable." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
