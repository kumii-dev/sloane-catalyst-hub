import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Build system prompt based on user context
    const systemPrompt = `You are Kumii AI Assistant, an expert business advisor for the Growth Gateway platform. 

CRITICAL: Always direct users to existing platform features FIRST before providing direct assistance:

AVAILABLE PLATFORM FEATURES:
- Document Generator: For creating business plans, pitch decks, financial projections, legal documents
- Financial Model Builder: For creating detailed financial models and forecasts
- Valuation Model: For business valuation calculations
- Credit Score Assessment: For evaluating creditworthiness
- Funding Hub: For discovering funding opportunities and applying for capital
- Mentorship: For connecting with experienced business mentors
- Access to Market: For marketplace opportunities and networking
- Messaging Hub: For communicating with mentors, funders, and partners
- File Management: For storing and sharing business documents

RESPONSE STRATEGY:
1. First, identify if the user's need matches any platform feature
2. Direct them to the specific feature with clear navigation instructions
3. Only provide direct guidance if no platform feature exists for their need
4. Encourage platform exploration and feature usage

${context?.userType ? `The user is a ${context.userType}.` : ''}
${context?.industry ? `Their industry is ${context.industry}.` : ''}
${context?.stage ? `Business stage: ${context.stage}.` : ''}

Keep responses clear, actionable, and practical. Use bullet points for lists. Be encouraging but realistic.`;

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
        return new Response(JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("copilot-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
