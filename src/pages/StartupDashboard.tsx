import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { FundingOpportunityCard } from "@/components/funding/FundingOpportunityCard";
import { 
  FileText, 
  Target,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  ArrowRight,
  Plus,
  Settings,
  Building
} from "lucide-react";

interface Application {
  id: string;
  status: string;
  requested_amount: number;
  submitted_at: string;
  opportunity: {
    title: string;
    funding_type: string;
    funder: {
      organization_name: string;
    };
  };
}

interface Match {
  id: string;
  match_score: number;
  match_reasons: string[];
  is_viewed: boolean;
  opportunity: {
    title: string;
    funding_type: string;
    amount_min: number;
    amount_max: number;
    application_deadline: string;
    funder: {
      organization_name: string;
    };
  };
}

const StartupDashboard = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch startup profile
      const { data: profileData } = await supabase
        .from('startup_profiles')
        .select('*')
        .eq('user_id', user!.id)
        .single();
      
      setProfile(profileData);

      if (profileData) {
        // Fetch applications
        const { data: applicationsData } = await supabase
          .from('funding_applications')
          .select(`
            *,
            opportunity:funding_opportunities(
              title,
              funding_type,
              funder:funders(organization_name)
            )
          `)
          .eq('applicant_id', user!.id)
          .order('created_at', { ascending: false });

        setApplications(applicationsData || []);

        // Fetch matches
        const { data: matchesData } = await supabase
          .from('funding_matches')
          .select(`
            *,
            opportunity:funding_opportunities(
              title,
              funding_type,
              amount_min,
              amount_max,
              application_deadline,
              funder:funders(organization_name)
            )
          `)
          .eq('startup_id', profileData.id)
          .eq('is_dismissed', false)
          .order('match_score', { ascending: false })
          .limit(5);

        setMatches(matchesData || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'under_review': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'submitted': return <FileText className="w-4 h-4 text-orange-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      case 'under_review': return 'bg-blue-500';
      case 'submitted': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const formatAmount = (amount: number) => {
    if (amount >= 1000000) {
      return `R${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `R${(amount / 1000).toFixed(0)}K`;
    }
    return `R${amount}`;
  };

  if (!user) {
    return (
      <Layout showSidebar={false}>
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-6">Please sign in to access your startup dashboard.</p>
          <Link to="/auth">
            <Button>Sign In</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  if (!profile && !loading) {
    return (
      <Layout showSidebar={false}>
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <Building className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-4">Complete Your Startup Profile</h1>
          <p className="text-muted-foreground mb-6">
            Create your startup profile to access funding opportunities and get personalized matches.
          </p>
          <Link to="/funding/startup-profile">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Profile
            </Button>
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
            <h1 className="text-3xl font-bold">
              {profile?.company_name || 'Startup'} Dashboard
            </h1>
            <p className="text-muted-foreground">
              Track your funding applications and discover new opportunities
            </p>
          </div>
          <div className="flex gap-2">
            <Link to="/funding/startup-profile">
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </Link>
            <Link to="/funding/browse">
              <Button>
                <Target className="w-4 h-4 mr-2" />
                Browse Opportunities
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="ml-2 text-sm font-medium">Applications</span>
              </div>
              <div className="text-2xl font-bold">{applications.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Target className="h-4 w-4 text-muted-foreground" />
                <span className="ml-2 text-sm font-medium">New Matches</span>
              </div>
              <div className="text-2xl font-bold">{matches.filter(m => !m.is_viewed).length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                <span className="ml-2 text-sm font-medium">Approved</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {applications.filter(a => a.status === 'approved').length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="ml-2 text-sm font-medium">Total Requested</span>
              </div>
              <div className="text-2xl font-bold">
                {formatAmount(applications.reduce((sum, app) => sum + (app.requested_amount || 0), 0))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="matches" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="matches">
              AI Matches
              {matches.filter(m => !m.is_viewed).length > 0 && (
                <Badge variant="destructive" className="ml-2 text-xs">
                  {matches.filter(m => !m.is_viewed).length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="matches" className="space-y-6">
            {matches.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Recommended for You</h2>
                  <Link to="/funding/browse">
                    <Button variant="ghost" size="sm">
                      View All <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
                
                {matches.map((match) => (
                  <div key={match.id} className={!match.is_viewed ? 'ring-2 ring-primary/20 rounded-lg' : ''}>
                    <FundingOpportunityCard
                      id={match.id}
                      title={match.opportunity.title}
                      description={match.match_reasons.join(' • ')}
                      fundingType={match.opportunity.funding_type}
                      funderName={match.opportunity.funder.organization_name}
                      amountMin={match.opportunity.amount_min}
                      amountMax={match.opportunity.amount_max}
                      deadline={match.opportunity.application_deadline}
                      matchScore={match.match_score}
                      onApply={() => {
                        window.location.href = '/funding/browse';
                      }}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Target className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No matches yet</h3>
                <p className="text-muted-foreground mb-6">
                  Complete your profile to get AI-powered funding recommendations
                </p>
                <Link to="/funding/startup-profile">
                  <Button>Update Profile</Button>
                </Link>
              </div>
            )}
          </TabsContent>

          <TabsContent value="applications" className="space-y-6">
            {applications.length > 0 ? (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Your Applications</h2>
                
                {applications.map((application) => (
                  <Card key={application.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg">{application.opportunity.title}</CardTitle>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-muted-foreground">to</span>
                            <span className="text-sm font-medium">{application.opportunity.funder.organization_name}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(application.status)}
                          <Badge variant="outline" className="capitalize">
                            {application.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Requested:</span>
                          <span className="ml-2 font-medium text-green-600">
                            {formatAmount(application.requested_amount)}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Type:</span>
                          <Badge variant="secondary" className="ml-2 capitalize">
                            {application.opportunity.funding_type.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Submitted:</span>
                          <span className="ml-2 font-medium">
                            {new Date(application.submitted_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <Progress value={
                          application.status === 'submitted' ? 25 :
                          application.status === 'under_review' ? 50 :
                          application.status === 'approved' ? 100 :
                          application.status === 'rejected' ? 100 : 0
                        } className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No applications yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start applying to funding opportunities that match your startup
                </p>
                <Link to="/funding/browse">
                  <Button>Browse Opportunities</Button>
                </Link>
              </div>
            )}
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            {profile && (
              <Card>
                <CardHeader>
                  <CardTitle>Startup Profile</CardTitle>
                  <CardDescription>
                    Keep your profile updated to get better funding matches
                  </CardDescription>
                </CardHeader>
                 <CardContent className="space-y-4">
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <label className="text-sm font-medium">Company Name</label>
                       <p className="text-sm text-muted-foreground">{profile.company_name}</p>
                     </div>
                     <div>
                       <label className="text-sm font-medium">Industry</label>
                       <p className="text-sm text-muted-foreground capitalize">{profile.industry}</p>
                     </div>
                   </div>
                    <div>
                      <label className="text-sm font-medium">Stage</label>
                      <p className="text-sm text-muted-foreground capitalize">{profile.stage.replace('_', ' ')}</p>
                    </div>
                    <div>
                       <label className="text-sm font-medium">Funding Needed</label>
                       <p className="text-sm text-muted-foreground">
                         {profile.funding_needed ? formatAmount(profile.funding_needed) : 'Not specified'}
                       </p>
                     </div>
                   
                   <div>
                     <label className="text-sm font-medium">Description</label>
                     <p className="text-sm text-muted-foreground">{profile.description || 'No description provided'}</p>
                   </div>
                   
                   <div className="flex justify-end">
                     <Link to="/funding/startup-profile">
                       <Button>
                         <Settings className="w-4 h-4 mr-2" />
                         Edit Profile
                       </Button>
                     </Link>
                   </div>
                 </CardContent>
               </Card>
             )}
           </TabsContent>
         </Tabs>
       </div>
     </Layout>
  );
};

export default StartupDashboard;