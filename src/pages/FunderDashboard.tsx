import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  Building, 
  Plus, 
  Settings, 
  TrendingUp,
  DollarSign,
  Users,
  FileText,
  BarChart3,
  Star,
  Clock,
  CheckCircle,
  Target,
  Award,
  Eye,
  ArrowRight
} from "lucide-react";

interface FunderProfile {
  id: string;
  organization_name: string;
  organization_type: string;
  description: string;
  total_funded_amount: number;
  total_funded_companies: number;
  sloane_credits_balance: number;
  is_verified: boolean;
}

interface Opportunity {
  id: string;
  title: string;
  funding_type: string;
  status: string;
  total_applications: number;
  approved_applications: number;
  amount_min: number;
  amount_max: number;
  created_at: string;
}

interface Application {
  id: string;
  status: string;
  requested_amount: number;
  submitted_at: string;
  startup: {
    company_name: string;
    industry: string;
    stage: string;
  };
  opportunity: {
    title: string;
  };
}

const FunderDashboard = () => {
  const { user } = useAuth();
  const [funderProfile, setFunderProfile] = useState<FunderProfile | null>(null);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch funder profile
      const { data: profileData } = await supabase
        .from('funders')
        .select('*')
        .eq('user_id', user!.id)
        .single();
      
      setFunderProfile(profileData);

      if (profileData) {
        // Fetch opportunities
        const { data: opportunitiesData } = await supabase
          .from('funding_opportunities')
          .select('*')
          .eq('funder_id', profileData.id)
          .order('created_at', { ascending: false });

        setOpportunities(opportunitiesData || []);

        // Fetch applications to all opportunities
        const { data: applicationsData } = await supabase
          .from('funding_applications')
          .select(`
            *,
            startup:startup_profiles(company_name, industry, stage),
            opportunity:funding_opportunities(title)
          `)
          .in('opportunity_id', opportunitiesData?.map(o => o.id) || [])
          .order('submitted_at', { ascending: false });

        setApplications(applicationsData || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'draft': return 'bg-gray-500';
      case 'closed': return 'bg-red-500';
      case 'paused': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-6">Please sign in to access your funder dashboard.</p>
          <Link to="/auth">
            <Button>Sign In</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  if (!funderProfile && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <Building className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-4">Complete Your Funder Profile</h1>
          <p className="text-muted-foreground mb-6">
            Create your organization profile to start listing funding opportunities.
          </p>
          <Link to="/funding/funder-onboard">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Profile
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              {funderProfile?.organization_name || 'Funder'} Dashboard
              {funderProfile?.is_verified && (
                <Badge variant="outline" className="ml-3">
                  <Star className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              )}
            </h1>
            <p className="text-muted-foreground">
              Manage your funding opportunities and track applications
            </p>
          </div>
          <div className="flex gap-2">
            <Link to="/funding/funder-profile">
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </Link>
            <Link to="/funding/create-opportunity">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Opportunity
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Target className="h-4 w-4 text-muted-foreground" />
                <span className="ml-2 text-sm font-medium">Active Opportunities</span>
              </div>
              <div className="text-2xl font-bold">
                {opportunities.filter(o => o.status === 'active').length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="ml-2 text-sm font-medium">Total Applications</span>
              </div>
              <div className="text-2xl font-bold">{applications.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="ml-2 text-sm font-medium">Companies Funded</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {funderProfile?.total_funded_companies || 0}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="ml-2 text-sm font-medium">Total Funded</span>
              </div>
              <div className="text-2xl font-bold">
                {formatAmount(funderProfile?.total_funded_amount || 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sloane Credits Balance */}
        {funderProfile && funderProfile.sloane_credits_balance > 0 && (
          <Card className="mb-8 bg-gradient-to-r from-accent/10 to-primary/10">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Sloane Credits Balance</h3>
                  <p className="text-sm text-muted-foreground">
                    Allocate credits to your funding programs to boost startup engagement
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-accent">
                    {funderProfile.sloane_credits_balance.toLocaleString()}
                  </div>
                  <p className="text-sm text-muted-foreground">Credits available</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <Tabs defaultValue="opportunities" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-[500px]">
            <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
            <TabsTrigger value="applications">
              Applications
              {applications.filter(a => a.status === 'submitted').length > 0 && (
                <Badge variant="destructive" className="ml-2 text-xs">
                  {applications.filter(a => a.status === 'submitted').length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="opportunities" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Your Funding Opportunities</h2>
              <Link to="/funding/create-opportunity">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create New
                </Button>
              </Link>
            </div>

            {opportunities.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {opportunities.map((opportunity) => (
                  <Card key={opportunity.id} className="hover:shadow-md transition-all">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg leading-tight">
                          {opportunity.title}
                        </CardTitle>
                        <Badge variant="outline" className={`${getStatusColor(opportunity.status)} text-white capitalize`}>
                          {opportunity.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Type:</span>
                          <Badge variant="secondary" className="ml-2 capitalize">
                            {opportunity.funding_type.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Amount:</span>
                          <span className="ml-2 font-medium text-green-600">
                            {formatAmount(opportunity.amount_min)} - {formatAmount(opportunity.amount_max)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Applications:</span>
                          <span className="ml-2 font-medium">{opportunity.total_applications}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Approved:</span>
                          <span className="ml-2 font-medium text-green-600">{opportunity.approved_applications}</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" className="flex-1" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Target className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No opportunities yet</h3>
                <p className="text-muted-foreground mb-6">
                  Create your first funding opportunity to start receiving applications
                </p>
                <Link to="/funding/create-opportunity">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Opportunity
                  </Button>
                </Link>
              </div>
            )}
          </TabsContent>

          <TabsContent value="applications" className="space-y-6">
            <h2 className="text-xl font-semibold">Recent Applications</h2>
            
            {applications.length > 0 ? (
              <div className="space-y-4">
                {applications.map((application) => (
                  <Card key={application.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg">{application.startup.company_name}</CardTitle>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span>Applied to: {application.opportunity.title}</span>
                            <Badge variant="outline" className="capitalize">
                              {application.startup.industry}
                            </Badge>
                            <Badge variant="outline" className="capitalize">
                              {application.startup.stage.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>
                        <Badge variant="outline" className="capitalize">
                          {application.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6 text-sm">
                          <div>
                            <span className="text-muted-foreground">Requested:</span>
                            <span className="ml-2 font-medium text-green-600">
                              {formatAmount(application.requested_amount)}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Submitted:</span>
                            <span className="ml-2 font-medium">
                              {new Date(application.submitted_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            Review
                          </Button>
                          {application.status === 'submitted' && (
                            <Button size="sm">
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Approve
                            </Button>
                          )}
                        </div>
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
                  Once you create active funding opportunities, applications will appear here
                </p>
                <Link to="/funding/create-opportunity">
                  <Button>Create Opportunity</Button>
                </Link>
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="text-center py-12">
              <BarChart3 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Analytics Dashboard</h3>
              <p className="text-muted-foreground mb-6">
                Detailed analytics and reporting for your funding programs
              </p>
              <Button disabled>Coming Soon</Button>
            </div>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            {funderProfile && (
              <Card>
                <CardHeader>
                  <CardTitle>Organization Profile</CardTitle>
                  <CardDescription>
                    Manage your organization details and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Organization Name</label>
                      <p className="text-sm text-muted-foreground">{funderProfile.organization_name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Organization Type</label>
                      <p className="text-sm text-muted-foreground">{funderProfile.organization_type || 'Not specified'}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <p className="text-sm text-muted-foreground">{funderProfile.description || 'No description provided'}</p>
                  </div>
                  
                  <div className="flex justify-end">
                    <Link to="/funding/funder-profile">
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

      <Footer />
    </div>
  );
};

export default FunderDashboard;