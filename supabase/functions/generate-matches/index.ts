import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    console.log(`Generating matches for user: ${user.id}`);

    let mentorMatchesCount = 0;
    let serviceMatchesCount = 0;
    let fundingMatchesCount = 0;

    // Generate mentor matches using the existing RPC function
    try {
      const { data: mentorCount, error: mentorError } = await supabase
        .rpc('generate_mentor_matches_for_user', {
          user_id_param: user.id
        });

      if (mentorError) {
        console.error('Error generating mentor matches:', mentorError);
      } else {
        mentorMatchesCount = mentorCount || 0;
        console.log(`Generated ${mentorMatchesCount} mentor matches`);
      }
    } catch (error) {
      console.error('Error in mentor match generation:', error);
    }

    // Generate service matches
    try {
      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('industry_sectors, persona_type')
        .eq('user_id', user.id)
        .single();

      if (profile && ['startup', 'smme', 'unassigned'].includes(profile.persona_type)) {
        // Delete existing service matches
        await supabase
          .from('service_matches')
          .delete()
          .eq('buyer_user_id', user.id);

        // Get active services
        const { data: services } = await supabase
          .from('services')
          .select('id, target_industries, rating, is_featured, provider_id')
          .eq('is_active', true);

        if (services) {
          for (const service of services) {
            // Skip if user is the provider
            const { data: providerData } = await supabase
              .from('service_providers')
              .select('user_id')
              .eq('id', service.provider_id)
              .single();

            if (providerData?.user_id === user.id) continue;

            // Calculate match score
            let matchScore = 0;
            const matchReasons: string[] = [];

            // Industry match (40 points)
            if (service.target_industries && profile.industry_sectors) {
              const commonIndustries = service.target_industries.filter((ind: string) =>
                profile.industry_sectors.includes(ind)
              );
              if (commonIndustries.length > 0) {
                matchScore += 30;
                matchReasons.push('Industry alignment');
              }
            } else if (!service.target_industries) {
              matchScore += 20;
            }

            // Rating (20 points)
            if (service.rating >= 4.0) {
              matchScore += 20;
              matchReasons.push('Highly rated service');
            } else if (service.rating >= 3.0) {
              matchScore += 15;
            } else if (service.rating > 0) {
              matchScore += 10;
            }

            // Featured service (10 points)
            if (service.is_featured) {
              matchScore += 10;
              matchReasons.push('Featured provider');
            }

            // Only create matches with score >= 40
            if (matchScore >= 40) {
              await supabase
                .from('service_matches')
                .insert({
                  service_id: service.id,
                  buyer_user_id: user.id,
                  match_score: matchScore,
                  match_reasons: matchReasons,
                  is_viewed: false,
                  is_dismissed: false
                });
              serviceMatchesCount++;
            }
          }
          console.log(`Generated ${serviceMatchesCount} service matches`);
        }
      }
    } catch (error) {
      console.error('Error in service match generation:', error);
    }

    // Generate funding matches
    try {
      // Get startup profile
      const { data: startupProfile } = await supabase
        .from('startup_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (startupProfile) {
        // Delete existing funding matches
        await supabase
          .from('funding_matches')
          .delete()
          .eq('startup_id', startupProfile.id);

        // Get active funding opportunities
        const { data: opportunities } = await supabase
          .from('funding_opportunities')
          .select(`
            id,
            funder_id,
            amount_min,
            amount_max,
            industry_focus,
            stage_requirements,
            geographic_restrictions
          `)
          .eq('status', 'active');

        if (opportunities) {
          for (const opp of opportunities) {
            // Get funder details
            const { data: funder } = await supabase
              .from('funders')
              .select('preferred_industries, preferred_stages, geographic_preferences')
              .eq('id', opp.funder_id)
              .single();

            if (!funder) continue;

            let matchScore = 0;
            const matchReasons: string[] = [];

            // Industry match (30 points)
            if (funder.preferred_industries?.includes(startupProfile.industry)) {
              matchScore += 30;
              matchReasons.push('Industry match');
            }

            // Stage match (25 points)
            if (funder.preferred_stages?.includes(startupProfile.stage)) {
              matchScore += 25;
              matchReasons.push('Stage match');
            }

            // Funding amount match (25 points)
            if (
              startupProfile.funding_needed &&
              startupProfile.funding_needed >= opp.amount_min &&
              startupProfile.funding_needed <= opp.amount_max
            ) {
              matchScore += 25;
              matchReasons.push('Funding amount match');
            }

            // Location match (10 points)
            if (!funder.geographic_preferences || funder.geographic_preferences.includes(startupProfile.location)) {
              matchScore += 10;
            }

            // Credit score bonus (10 points)
            if (startupProfile.credit_score && startupProfile.credit_score >= 70) {
              matchScore += 10;
            }

            // Only create matches with score >= 40
            if (matchScore >= 40) {
              await supabase
                .from('funding_matches')
                .insert({
                  opportunity_id: opp.id,
                  startup_id: startupProfile.id,
                  match_score: matchScore,
                  match_reasons: matchReasons,
                  is_viewed: false,
                  is_dismissed: false
                });
              fundingMatchesCount++;
            }
          }
          console.log(`Generated ${fundingMatchesCount} funding matches`);
        }
      }
    } catch (error) {
      console.error('Error in funding match generation:', error);
    }

    return new Response(
      JSON.stringify({
        success: true,
        matches: {
          mentors: mentorMatchesCount,
          services: serviceMatchesCount,
          funding: fundingMatchesCount
        },
        total: mentorMatchesCount + serviceMatchesCount + fundingMatchesCount
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Error generating matches:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
