import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { assessmentData, userId, startupId } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting credit assessment analysis for user:', userId);

    // Build the prompt for AI analysis
    const systemPrompt = `You are a Credit Scoring Assistant for the 22 On Sloane Capital Marketplace in South Africa. You evaluate the creditworthiness of SMMEs and Tech Startups using a 10-domain framework.

Each domain is scored out of 100 points (10% weight each):
1. Business Profile & Age
2. Financial Health (cashflow, margins, liquidity)
3. Repayment Behaviour (past loans, payment records)
4. Governance & Compliance (CIPC, SARS, VAT, PAYE)
5. Market Position & Demand (customers, contracts, sector growth)
6. Operational Capacity (staffing, systems, production capability)
7. Technology & Innovation (use of digital tools, IP, R&D)
8. Social & Environmental Impact (ESG alignment, inclusivity)
9. Trust & Reputation (references, testimonials, supplier/customer history)
10. Growth Potential & Strategy (plans, scalability, investor readiness)

You must analyze the provided business information and documents, then return a JSON response with:
- Individual scores for each domain (0-100)
- Composite score (0-1000)
- Risk band (Low >700, Medium 400-700, High <400)
- Funding eligibility range
- Detailed explanation of strengths and weaknesses
- Specific recommendations for improvement
- Domain-specific explanations

Be professional, clear, and supportive. The aim is to empower entrepreneurs.`;

    const userPrompt = `Please analyze this SMME/Tech Startup credit assessment:

Business Information:
${JSON.stringify(assessmentData, null, 2)}

Provide a comprehensive credit score analysis following the 10-domain framework. Return ONLY valid JSON in this exact format:
{
  "business_profile_score": <0-100>,
  "financial_health_score": <0-100>,
  "repayment_behaviour_score": <0-100>,
  "governance_score": <0-100>,
  "market_access_score": <0-100>,
  "operational_capacity_score": <0-100>,
  "technology_innovation_score": <0-100>,
  "social_environmental_score": <0-100>,
  "trust_reputation_score": <0-100>,
  "growth_readiness_score": <0-100>,
  "overall_score": <0-1000>,
  "risk_band": "<Low|Medium|High>",
  "funding_eligibility_range": "<range description>",
  "score_explanation": "<detailed explanation>",
  "domain_explanations": {
    "business_profile": "<explanation>",
    "financial_health": "<explanation>",
    "repayment_behaviour": "<explanation>",
    "governance_compliance": "<explanation>",
    "market_position": "<explanation>",
    "operational_capacity": "<explanation>",
    "technology_innovation": "<explanation>",
    "social_environmental": "<explanation>",
    "trust_reputation": "<explanation>",
    "growth_potential": "<explanation>"
  },
  "strengths": ["<strength 1>", "<strength 2>", ...],
  "weaknesses": ["<weakness 1>", "<weakness 2>", ...],
  "recommendations": ["<recommendation 1>", "<recommendation 2>", ...]
}`;

    // Call Lovable AI
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits to your workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await aiResponse.text();
      console.error('AI gateway error:', aiResponse.status, errorText);
      throw new Error(`AI gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices[0].message.content;

    console.log('AI response received:', aiContent);

    // Parse AI response
    let analysisResult;
    try {
      // Extract JSON from the response (in case there's surrounding text)
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in AI response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      throw new Error('Failed to parse AI analysis result');
    }

    // Create the assessment record
    const { data: assessment, error: insertError } = await supabase
      .from('credit_assessments')
      .insert({
        user_id: userId,
        startup_id: startupId,
        status: 'completed',
        assessed_at: new Date().toISOString(),
        
        // Individual domain scores
        business_profile_score: analysisResult.business_profile_score,
        financial_health_score: analysisResult.financial_health_score,
        repayment_behaviour_score: analysisResult.repayment_behaviour_score,
        governance_score: analysisResult.governance_score,
        market_access_score: analysisResult.market_access_score,
        operational_capacity_score: analysisResult.operational_capacity_score,
        technology_innovation_score: analysisResult.technology_innovation_score,
        social_environmental_score: analysisResult.social_environmental_score,
        trust_reputation_score: analysisResult.trust_reputation_score,
        growth_readiness_score: analysisResult.growth_readiness_score,
        
        // Overall metrics
        overall_score: analysisResult.overall_score,
        risk_band: analysisResult.risk_band,
        funding_eligibility_range: analysisResult.funding_eligibility_range,
        score_explanation: analysisResult.score_explanation,
        
        // Additional data
        domain_explanations: analysisResult.domain_explanations,
        recommendations: analysisResult.recommendations,
        improvement_areas: analysisResult.weaknesses,
        
        // Store full AI analysis
        ai_analysis: {
          strengths: analysisResult.strengths,
          weaknesses: analysisResult.weaknesses,
          timestamp: new Date().toISOString()
        },
        
        // Store assessment data
        assessment_data: assessmentData,
        
        // Document URLs if provided
        document_urls: assessmentData.document_urls || {},
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting assessment:', insertError);
      throw insertError;
    }

    console.log('Assessment created successfully:', assessment.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        assessment,
        analysis: analysisResult 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in analyze-credit-assessment:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});