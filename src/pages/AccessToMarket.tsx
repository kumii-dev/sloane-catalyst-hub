import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  Users, 
  Target, 
  DollarSign, 
  Award, 
  ArrowRight, 
  CheckCircle, 
  Building2,
  Zap,
  Shield,
  BarChart3
} from "lucide-react";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

interface CreditScore {
  overall_score: number;
  technical_score: number;
  financial_score: number;
  market_score: number;
}

interface FunderProfile {
  id: string;
  organization_name: string;
  logo_url?: string;
  description?: string;
  focus_areas?: string[];
  min_funding_amount?: number;
  max_funding_amount?: number;
  preferred_stages?: string[];
  is_verified: boolean;
}

const AccessToMarket = () => {
  const { user } = useAuth();
  const [creditScore, setCreditScore] = useState<CreditScore | null>(null);
  const [featuredFunders, setFeaturedFunders] = useState<FunderProfile[]>([]);
  const [matchedOpportunities, setMatchedOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMarketData();
  }, [user]);

  const fetchMarketData = async () => {
    try {
      // Fetch featured funders
      const { data: funders } = await supabase
        .from('funders')
        .select('*')
        .eq('is_verified', true)
        .limit(6);

      if (funders) setFeaturedFunders(funders);

      // If user is logged in, fetch personalized data
      if (user) {
        // Fetch user's startup profile for credit score
        const { data: startup } = await supabase
          .from('startup_profiles')
          .select('id, credit_score')
          .eq('user_id', user.id)
          .single();

        if (startup?.credit_score) {
          // Generate mock detailed credit scores based on overall score
          const overall = startup.credit_score;
          setCreditScore({
            overall_score: overall,
            technical_score: Math.min(100, overall + Math.random() * 20 - 10),
            financial_score: Math.min(100, overall + Math.random() * 20 - 10),
            market_score: Math.min(100, overall + Math.random() * 20 - 10)
          });
        }

        // Fetch matched opportunities
        const { data: matches } = await supabase
          .from('funding_matches')
          .select(`
            *,
            funding_opportunities (
              title,
              description,
              funding_type,
              amount_min,
              amount_max
            )
          `)
          .eq('startup_id', startup?.id)
          .limit(3);

        if (matches) setMatchedOpportunities(matches);
      }
    } catch (error) {
      console.error('Error fetching market data:', error);
    } finally {
      setLoading(false);
    }
  };

  const marketFeatures = [
    {
      icon: Shield,
      title: "Credit Score Check",
      description: "Get your standardized credit and technical readiness scores",
      href: "/credit-score",
      color: "bg-blue-500/10 text-blue-600",
      action: "Check Score"
    },
    {
      icon: Building2,
      title: "Funder Directory",
      description: "Browse verified funders, banks, and sponsor programs",
      href: "/funding/browse",
      color: "bg-green-500/10 text-green-600",
      action: "Browse Funders"
    },
    {
      icon: Target,
      title: "Smart Matching",
      description: "AI-powered supplier/buyer and funder matching engine",
      href: "/funding",
      color: "bg-purple-500/10 text-purple-600",
      action: "Find Matches"
    },
    {
      icon: DollarSign,
      title: "Funding Opportunities",
      description: "Discover grants, loans, and investment opportunities",
      href: "/funding/browse",
      color: "bg-orange-500/10 text-orange-600",
      action: "Apply Now"
    }
  ];

  const stats = [
    { label: "Active Funders", value: "50+", icon: Building2 },
    { label: "Funding Allocated", value: "R2.5B+", icon: DollarSign },
    { label: "Startups Funded", value: "1,200+", icon: TrendingUp },
    { label: "Success Rate", value: "85%", icon: Award }
  ];

  return (
    <Layout showSidebar={true}>
      {/* Hero Section */}
      <section className="py-12 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <Badge variant="outline" className="mb-4">
              Access to Market
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Powering Market Access with Trust & Transparency
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Connect with funders, corporates, and buyers through our trusted ecosystem powered by 
              credit scoring, profiling, and intelligent matching.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
              {stats.map((stat) => (
                <Card key={stat.label} className="border-0 bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-4 text-center">
                    <stat.icon className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Features */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {marketFeatures.map((feature) => (
              <Card key={feature.title} className="group hover:shadow-lg transition-all duration-300">
                <CardHeader className="text-center">
                  <div className={`w-16 h-16 mx-auto rounded-lg ${feature.color} flex items-center justify-center mb-4`}>
                    <feature.icon className="w-8 h-8" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button asChild className="w-full" variant="outline">
                    <Link to={feature.href}>
                      {feature.action}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Personalized Dashboard Section */}
          {user && (
            <Tabs defaultValue="overview" className="mb-16">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="credit">Credit Score</TabsTrigger>
                <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Your Market Access Dashboard
                    </CardTitle>
                    <CardDescription>
                      Personalized insights and recommendations for your startup
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-6">
                      <Card className="bg-blue-50 border-blue-200">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-2xl font-bold text-blue-600">
                                {creditScore?.overall_score || 'N/A'}
                              </div>
                              <div className="text-sm text-blue-600">Credit Score</div>
                            </div>
                            <Shield className="w-8 h-8 text-blue-500" />
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-green-50 border-green-200">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-2xl font-bold text-green-600">
                                {featuredFunders.length}
                              </div>
                              <div className="text-sm text-green-600">Matched Funders</div>
                            </div>
                            <Building2 className="w-8 h-8 text-green-500" />
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-purple-50 border-purple-200">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-2xl font-bold text-purple-600">
                                {matchedOpportunities.length}
                              </div>
                              <div className="text-sm text-purple-600">Opportunities</div>
                            </div>
                            <Target className="w-8 h-8 text-purple-500" />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="credit" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Credit Score Breakdown</CardTitle>
                    <CardDescription>
                      Your standardized credit and technical readiness scores
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {creditScore ? (
                      <>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between mb-2">
                              <span className="text-sm font-medium">Overall Score</span>
                              <span className="text-sm text-muted-foreground">{creditScore.overall_score}/100</span>
                            </div>
                            <Progress value={creditScore.overall_score} className="h-2" />
                          </div>
                          
                          <div>
                            <div className="flex justify-between mb-2">
                              <span className="text-sm font-medium">Technical Readiness</span>
                              <span className="text-sm text-muted-foreground">{creditScore.technical_score.toFixed(0)}/100</span>
                            </div>
                            <Progress value={creditScore.technical_score} className="h-2" />
                          </div>
                          
                          <div>
                            <div className="flex justify-between mb-2">
                              <span className="text-sm font-medium">Financial Health</span>
                              <span className="text-sm text-muted-foreground">{creditScore.financial_score.toFixed(0)}/100</span>
                            </div>
                            <Progress value={creditScore.financial_score} className="h-2" />
                          </div>
                          
                          <div>
                            <div className="flex justify-between mb-2">
                              <span className="text-sm font-medium">Market Position</span>
                              <span className="text-sm text-muted-foreground">{creditScore.market_score.toFixed(0)}/100</span>
                            </div>
                            <Progress value={creditScore.market_score} className="h-2" />
                          </div>
                        </div>
                        
                        <div className="flex gap-4">
                          <Button>Download Report</Button>
                          <Button variant="outline">Share with Funders</Button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <Shield className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground mb-4">
                          Complete your startup profile to get your credit score
                        </p>
                        <Button asChild>
                          <Link to="/funding/startup-dashboard">Complete Profile</Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="opportunities" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Matched Funding Opportunities</CardTitle>
                    <CardDescription>
                      Opportunities tailored to your startup profile and credit score
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {matchedOpportunities.length > 0 ? (
                      <div className="space-y-4">
                        {matchedOpportunities.map((match: any) => (
                          <Card key={match.id} className="border-l-4 border-l-primary">
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <h3 className="font-semibold mb-2">
                                    {match.funding_opportunities?.title}
                                  </h3>
                                  <p className="text-sm text-muted-foreground mb-2">
                                    {match.funding_opportunities?.description}
                                  </p>
                                  <div className="flex gap-2">
                                    <Badge variant="secondary">
                                      {match.funding_opportunities?.funding_type}
                                    </Badge>
                                    <Badge variant="outline">
                                      {match.match_score}% Match
                                    </Badge>
                                  </div>
                                </div>
                                <Button size="sm">
                                  Apply Now
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Target className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground mb-4">
                          No matched opportunities yet. Complete your profile to get personalized matches.
                        </p>
                        <Button asChild>
                          <Link to="/funding/startup-dashboard">Update Profile</Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}

          {/* Featured Funders */}
          <div className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Trusted Funders & Sponsors</h2>
              <p className="text-muted-foreground">
                Connect with verified South African banks, AWS, Microsoft, and other leading funders
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredFunders.map((funder) => (
                <Card key={funder.id} className="group hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      {funder.logo_url && (
                        <img 
                          src={funder.logo_url} 
                          alt={funder.organization_name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {funder.organization_name}
                          {funder.is_verified && (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          )}
                        </CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {funder.description}
                    </p>
                    
                    {funder.focus_areas && (
                      <div className="flex flex-wrap gap-1">
                        {funder.focus_areas.slice(0, 3).map((area) => (
                          <Badge key={area} variant="secondary" className="text-xs">
                            {area}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center pt-2">
                      <div className="text-sm text-muted-foreground">
                        {funder.min_funding_amount && funder.max_funding_amount && (
                          <span>
                            R{(funder.min_funding_amount / 1000000).toFixed(1)}M - 
                            R{(funder.max_funding_amount / 1000000).toFixed(1)}M
                          </span>
                        )}
                      </div>
                      <Button size="sm" variant="outline">
                        View Profile
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="text-center mt-8">
              <Button asChild>
                <Link to="/funding/browse">
                  View All Funders
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Call to Action */}
          <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
            <CardContent className="p-8 text-center">
              <Zap className="w-16 h-16 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold mb-4">Ready to Access New Markets?</h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Join thousands of startups and SMMEs who have successfully connected with 
                funders and expanded their market reach through our trusted platform.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button asChild size="lg">
                  <Link to="/auth">Get Started Today</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/funding">Browse Opportunities</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
};

export default AccessToMarket;