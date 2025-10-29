import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MentorMatchCard } from "@/components/matching/MentorMatchCard";
import { ServiceMatchCard } from "@/components/matching/ServiceMatchCard";
import { FundingOpportunityCard } from "@/components/funding/FundingOpportunityCard";
import { 
  Target, 
  Users, 
  Package, 
  DollarSign, 
  TrendingUp,
  Sparkles,
  RefreshCw
} from "lucide-react";
import { Link } from "react-router-dom";

interface MentorMatch {
  id: string;
  match_score: number;
  match_reasons: string[];
  is_viewed: boolean;
  mentor: {
    id: string;
    title: string;
    company: string;
    rating: number;
    user: {
      first_name: string;
      last_name: string;
      profile_picture_url: string;
    };
  };
}

interface ServiceMatch {
  id: string;
  match_score: number;
  match_reasons: string[];
  is_viewed: boolean;
  service: {
    id: string;
    name: string;
    description: string;
    rating: number;
    pricing_type: string;
    provider: {
      company_name: string;
    };
  };
}

interface FundingMatch {
  id: string;
  match_score: number;
  match_reasons: string[];
  is_viewed: boolean;
  opportunity: {
    id: string;
    title: string;
    description: string;
    funding_type: string;
    amount_min: number;
    amount_max: number;
    application_deadline: string;
    funder: {
      organization_name: string;
    };
  };
}

const MatchingDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [mentorMatches, setMentorMatches] = useState<MentorMatch[]>([]);
  const [serviceMatches, setServiceMatches] = useState<ServiceMatch[]>([]);
  const [fundingMatches, setFundingMatches] = useState<FundingMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [startupProfile, setStartupProfile] = useState<any>(null);

  useEffect(() => {
    if (user) {
      fetchAllMatches();
    }
  }, [user]);

  const fetchAllMatches = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch mentor matches
      const { data: mentorData } = await supabase
        .from('mentor_matches')
        .select(`
          id,
          match_score,
          match_reasons,
          is_viewed,
          mentor_id
        `)
        .eq('mentee_user_id', user.id)
        .eq('is_dismissed', false)
        .order('match_score', { ascending: false });

      // Fetch mentor details separately
      const mentorMatchesWithDetails = [];
      if (mentorData && mentorData.length > 0) {
        for (const match of mentorData) {
          const { data: mentorDetail } = await supabase
            .from('mentors')
            .select(`
              id,
              title,
              company,
              rating,
              user_id
            `)
            .eq('id', match.mentor_id)
            .single();

          if (mentorDetail) {
            const { data: profileDetail } = await supabase
              .from('profiles')
              .select('first_name, last_name, profile_picture_url')
              .eq('user_id', mentorDetail.user_id)
              .single();

            if (profileDetail) {
              mentorMatchesWithDetails.push({
                ...match,
                mentor: {
                  ...mentorDetail,
                  user: profileDetail
                }
              });
            }
          }
        }
      }

      // Fetch service matches
      const { data: serviceData } = await supabase
        .from('service_matches')
        .select(`
          id,
          match_score,
          match_reasons,
          is_viewed,
          service:services(
            id,
            name,
            description,
            rating,
            pricing_type,
            provider:service_providers(company_name)
          )
        `)
        .eq('buyer_user_id', user.id)
        .eq('is_dismissed', false)
        .order('match_score', { ascending: false });

      // Fetch funding matches (if user has startup profile)
      const { data: startupProfileData } = await supabase
        .from('startup_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      setStartupProfile(startupProfileData);

      let fundingData = null;
      if (startupProfileData) {
        const { data } = await supabase
          .from('funding_matches')
          .select(`
            id,
            match_score,
            match_reasons,
            is_viewed,
            opportunity:funding_opportunities(
              id,
              title,
              description,
              funding_type,
              amount_min,
              amount_max,
              application_deadline,
              funder:funders(organization_name)
            )
          `)
          .eq('startup_id', startupProfileData.id)
          .eq('is_dismissed', false)
          .order('match_score', { ascending: false });
        
        fundingData = data;
      }

      setMentorMatches(mentorMatchesWithDetails || []);
      setServiceMatches(serviceData || []);
      setFundingMatches(fundingData || []);
    } catch (error) {
      console.error('Error fetching matches:', error);
      toast({
        title: "Error",
        description: "Failed to load matches. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateMatches = async () => {
    if (!user) return;

    setRegenerating(true);
    try {
      // Call function to regenerate mentor matches
      const { data, error } = await supabase
        .rpc('generate_mentor_matches_for_user', {
          user_id_param: user.id
        });

      if (error) throw error;

      toast({
        title: "Matches Updated!",
        description: `Found ${data} new mentor matches for you.`
      });

      // Refresh all matches
      await fetchAllMatches();
    } catch (error: any) {
      console.error('Error regenerating matches:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to regenerate matches.",
        variant: "destructive"
      });
    } finally {
      setRegenerating(false);
    }
  };

  const handleDismissMatch = async (matchId: string, type: 'mentor' | 'service' | 'funding') => {
    try {
      const table = type === 'mentor' ? 'mentor_matches' : 
                    type === 'service' ? 'service_matches' : 'funding_matches';
      
      const { error } = await supabase
        .from(table)
        .update({ is_dismissed: true })
        .eq('id', matchId);

      if (error) throw error;

      // Remove from local state
      if (type === 'mentor') {
        setMentorMatches(prev => prev.filter(m => m.id !== matchId));
      } else if (type === 'service') {
        setServiceMatches(prev => prev.filter(m => m.id !== matchId));
      } else {
        setFundingMatches(prev => prev.filter(m => m.id !== matchId));
      }

      toast({
        title: "Match dismissed",
        description: "This match has been removed from your list."
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleViewMatch = async (matchId: string, type: 'mentor' | 'service' | 'funding') => {
    try {
      const table = type === 'mentor' ? 'mentor_matches' : 
                    type === 'service' ? 'service_matches' : 'funding_matches';
      
      await supabase
        .from(table)
        .update({ is_viewed: true })
        .eq('id', matchId);

      // Update local state
      if (type === 'mentor') {
        setMentorMatches(prev => prev.map(m => 
          m.id === matchId ? { ...m, is_viewed: true } : m
        ));
      } else if (type === 'service') {
        setServiceMatches(prev => prev.map(m => 
          m.id === matchId ? { ...m, is_viewed: true } : m
        ));
      } else {
        setFundingMatches(prev => prev.map(m => 
          m.id === matchId ? { ...m, is_viewed: true } : m
        ));
      }
    } catch (error) {
      console.error('Error marking match as viewed:', error);
    }
  };

  const totalMatches = mentorMatches.length + serviceMatches.length + fundingMatches.length;
  const newMatches = mentorMatches.filter(m => !m.is_viewed).length + 
                     serviceMatches.filter(m => !m.is_viewed).length + 
                     fundingMatches.filter(m => !m.is_viewed).length;

  if (!user) {
    return (
      <Layout showSidebar={true}>
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
          <p className="text-muted-foreground mb-6">Sign in to see your personalized matches.</p>
          <Link to="/auth">
            <Button>Sign In</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showSidebar={true}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-primary" />
              Smart Matching
            </h1>
            <p className="text-muted-foreground mt-1">
              AI-powered connections tailored to your profile and needs
            </p>
          </div>
          <Button 
            onClick={handleRegenerateMatches} 
            disabled={regenerating}
            variant="outline"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${regenerating ? 'animate-spin' : ''}`} />
            Refresh Matches
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Target className="h-4 w-4 text-muted-foreground" />
                <span className="ml-2 text-sm font-medium">Total Matches</span>
              </div>
              <div className="text-2xl font-bold">{totalMatches}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span className="ml-2 text-sm font-medium">New Matches</span>
              </div>
              <div className="text-2xl font-bold text-primary">{newMatches}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="ml-2 text-sm font-medium">Mentors</span>
              </div>
              <div className="text-2xl font-bold">{mentorMatches.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="ml-2 text-sm font-medium">Services</span>
              </div>
              <div className="text-2xl font-bold">{serviceMatches.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Matches Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-[500px]">
            <TabsTrigger value="all">
              All
              {newMatches > 0 && (
                <Badge variant="destructive" className="ml-2 text-xs">
                  {newMatches}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="mentors">
              Mentors
              {mentorMatches.filter(m => !m.is_viewed).length > 0 && (
                <Badge variant="destructive" className="ml-2 text-xs">
                  {mentorMatches.filter(m => !m.is_viewed).length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="services">
              Services
              {serviceMatches.filter(m => !m.is_viewed).length > 0 && (
                <Badge variant="destructive" className="ml-2 text-xs">
                  {serviceMatches.filter(m => !m.is_viewed).length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="funding">
              Funding
              {fundingMatches.filter(m => !m.is_viewed).length > 0 && (
                <Badge variant="destructive" className="ml-2 text-xs">
                  {fundingMatches.filter(m => !m.is_viewed).length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {totalMatches === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Target className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No matches yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Complete your profile to get personalized recommendations
                  </p>
                  <Link to="/edit-profile">
                    <Button>Complete Profile</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <>
                {mentorMatches.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Mentor Matches
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {mentorMatches.slice(0, 4).map((match) => (
                        <MentorMatchCard
                          key={match.id}
                          matchId={match.id}
                          mentorId={match.mentor.id}
                          mentorName={`${match.mentor.user.first_name} ${match.mentor.user.last_name}`}
                          mentorTitle={match.mentor.title}
                          mentorCompany={match.mentor.company}
                          mentorAvatar={match.mentor.user.profile_picture_url}
                          mentorRating={match.mentor.rating}
                          matchScore={match.match_score}
                          matchReasons={match.match_reasons}
                          isViewed={match.is_viewed}
                          onDismiss={(id) => handleDismissMatch(id, 'mentor')}
                          onView={(id) => handleViewMatch(id, 'mentor')}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {serviceMatches.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <Package className="w-5 h-5" />
                      Service Matches
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {serviceMatches.slice(0, 4).map((match) => (
                        <ServiceMatchCard
                          key={match.id}
                          matchId={match.id}
                          serviceId={match.service.id}
                          serviceName={match.service.name}
                          serviceDescription={match.service.description}
                          providerName={match.service.provider.company_name}
                          serviceRating={match.service.rating}
                          matchScore={match.match_score}
                          matchReasons={match.match_reasons}
                          pricingType={match.service.pricing_type}
                          isViewed={match.is_viewed}
                          onDismiss={(id) => handleDismissMatch(id, 'service')}
                          onView={(id) => handleViewMatch(id, 'service')}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {fundingMatches.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      Funding Matches
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {fundingMatches.slice(0, 4).map((match) => (
                        <div key={match.id} className={!match.is_viewed ? 'ring-2 ring-primary/30 rounded-lg' : ''}>
                          <FundingOpportunityCard
                            id={match.opportunity.id}
                            title={match.opportunity.title}
                            description={match.match_reasons.join(' • ')}
                            fundingType={match.opportunity.funding_type}
                            funderName={match.opportunity.funder.organization_name}
                            amountMin={match.opportunity.amount_min}
                            amountMax={match.opportunity.amount_max}
                            deadline={match.opportunity.application_deadline}
                            matchScore={match.match_score}
                            onApply={() => {
                              handleViewMatch(match.id, 'funding');
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="mentors" className="space-y-6">
            {mentorMatches.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No mentor matches yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Add your skills and interests to find matching mentors
                  </p>
                  <Link to="/edit-profile">
                    <Button>Update Profile</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {mentorMatches.map((match) => (
                  <MentorMatchCard
                    key={match.id}
                    matchId={match.id}
                    mentorId={match.mentor.id}
                    mentorName={`${match.mentor.user.first_name} ${match.mentor.user.last_name}`}
                    mentorTitle={match.mentor.title}
                    mentorCompany={match.mentor.company}
                    mentorAvatar={match.mentor.user.profile_picture_url}
                    mentorRating={match.mentor.rating}
                    matchScore={match.match_score}
                    matchReasons={match.match_reasons}
                    isViewed={match.is_viewed}
                    onDismiss={(id) => handleDismissMatch(id, 'mentor')}
                    onView={(id) => handleViewMatch(id, 'mentor')}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="services" className="space-y-6">
            {serviceMatches.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No service matches yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Update your industry sectors to discover relevant services
                  </p>
                  <Link to="/edit-profile">
                    <Button>Update Profile</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {serviceMatches.map((match) => (
                  <ServiceMatchCard
                    key={match.id}
                    matchId={match.id}
                    serviceId={match.service.id}
                    serviceName={match.service.name}
                    serviceDescription={match.service.description}
                    providerName={match.service.provider.company_name}
                    serviceRating={match.service.rating}
                    matchScore={match.match_score}
                    matchReasons={match.match_reasons}
                    pricingType={match.service.pricing_type}
                    isViewed={match.is_viewed}
                    onDismiss={(id) => handleDismissMatch(id, 'service')}
                    onView={(id) => handleViewMatch(id, 'service')}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="funding" className="space-y-6">
            {fundingMatches.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <DollarSign className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No funding matches yet</h3>
                  <p className="text-muted-foreground mb-6">
                    {!startupProfile
                      ? "Create your startup profile to get funding recommendations"
                      : "We're generating your personalized funding matches. Check back soon!"}
                  </p>
                  {!startupProfile && (
                    <Link to="/edit-profile?tab=startup&edit=1">
                      <Button>Create Startup Profile</Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {fundingMatches.map((match) => (
                  <div key={match.id} className={!match.is_viewed ? 'ring-2 ring-primary/30 rounded-lg' : ''}>
                    <FundingOpportunityCard
                      id={match.opportunity.id}
                      title={match.opportunity.title}
                      description={match.match_reasons.join(' • ')}
                      fundingType={match.opportunity.funding_type}
                      funderName={match.opportunity.funder.organization_name}
                      amountMin={match.opportunity.amount_min}
                      amountMax={match.opportunity.amount_max}
                      deadline={match.opportunity.application_deadline}
                      matchScore={match.match_score}
                      onApply={() => {
                        handleViewMatch(match.id, 'funding');
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default MatchingDashboard;
