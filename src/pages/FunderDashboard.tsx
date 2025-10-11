import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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
  website?: string;
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
  const { toast } = useToast();
  const [funderProfile, setFunderProfile] = useState<FunderProfile | null>(null);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingProfile, setCreatingProfile] = useState(false);
  const [showOpportunityDialog, setShowOpportunityDialog] = useState(false);
  const [creatingOpportunity, setCreatingOpportunity] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [formData, setFormData] = useState({
    organization_name: "",
    organization_type: "",
    description: "",
    website: ""
  });
  const [profileEditForm, setProfileEditForm] = useState({
    organization_name: "",
    organization_type: "",
    description: "",
    website: ""
  });
  const [opportunityForm, setOpportunityForm] = useState({
    title: "",
    description: "",
    funding_type: "grant",
    amount_min: "",
    amount_max: "",
    requirements: "",
    application_deadline: ""
  });

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
        // Set profile edit form with current data
        setProfileEditForm({
          organization_name: profileData.organization_name || "",
          organization_type: profileData.organization_type || "",
          description: profileData.description || "",
          website: profileData.website || ""
        });

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
      <Layout showSidebar={false}>
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-6">Please sign in to access your funder dashboard.</p>
          <Link to="/auth">
            <Button>Sign In</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setCreatingProfile(true);
    try {
      const { error } = await supabase
        .from('funders')
        .insert({
          user_id: user.id,
          organization_name: formData.organization_name,
          organization_type: formData.organization_type,
          description: formData.description,
          website: formData.website
        });

      if (error) throw error;

      toast({
        title: "Profile created!",
        description: "Your funder profile has been created successfully."
      });

      // Refresh dashboard data
      fetchDashboardData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setCreatingProfile(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !funderProfile) return;

    setUpdatingProfile(true);
    try {
      const { error } = await supabase
        .from('funders')
        .update({
          organization_name: profileEditForm.organization_name,
          organization_type: profileEditForm.organization_type,
          description: profileEditForm.description,
          website: profileEditForm.website
        })
        .eq('id', funderProfile.id);

      if (error) throw error;

      toast({
        title: "Profile updated!",
        description: "Your funder profile has been updated successfully."
      });

      setEditingProfile(false);
      // Refresh dashboard data
      fetchDashboardData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleCreateOpportunity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !funderProfile) return;

    setCreatingOpportunity(true);
    try {
      const { error } = await supabase
        .from('funding_opportunities')
        .insert([{
          funder_id: funderProfile.id,
          title: opportunityForm.title,
          description: opportunityForm.description,
          funding_type: opportunityForm.funding_type as any,
          amount_min: parseFloat(opportunityForm.amount_min) || 0,
          amount_max: parseFloat(opportunityForm.amount_max) || 0,
          requirements: opportunityForm.requirements,
          application_deadline: opportunityForm.application_deadline || null,
          status: 'active' as any
        }]);

      if (error) throw error;

      toast({
        title: "Opportunity created!",
        description: "Your funding opportunity has been created successfully."
      });

      // Reset form and close dialog
      setOpportunityForm({
        title: "",
        description: "",
        funding_type: "grant",
        amount_min: "",
        amount_max: "",
        requirements: "",
        application_deadline: ""
      });
      setShowOpportunityDialog(false);

      // Refresh dashboard data
      fetchDashboardData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setCreatingOpportunity(false);
    }
  };

  if (!funderProfile && !loading) {
    return (
      <Layout showSidebar={false}>
        <div className="max-w-2xl mx-auto px-4 py-16">
          <div className="text-center mb-8">
            <Building className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-2">Complete Your Funder Profile</h1>
            <p className="text-muted-foreground">
              Create your organization profile to start listing funding opportunities.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Organization Information</CardTitle>
              <CardDescription>Tell us about your organization</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateProfile} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="organization_name">Organization Name *</Label>
                  <Input
                    id="organization_name"
                    required
                    value={formData.organization_name}
                    onChange={(e) => setFormData({ ...formData, organization_name: e.target.value })}
                    placeholder="e.g., Acme Ventures"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="organization_type">Organization Type *</Label>
                  <Select
                    value={formData.organization_type}
                    onValueChange={(value) => setFormData({ ...formData, organization_type: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="venture_capital">Venture Capital</SelectItem>
                      <SelectItem value="angel_investor">Angel Investor</SelectItem>
                      <SelectItem value="government">Government</SelectItem>
                      <SelectItem value="corporate">Corporate</SelectItem>
                      <SelectItem value="non_profit">Non-Profit</SelectItem>
                      <SelectItem value="accelerator">Accelerator/Incubator</SelectItem>
                      <SelectItem value="private_equity">Private Equity</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Tell us about your organization and investment focus..."
                    rows={4}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={creatingProfile}>
                  {creatingProfile ? "Creating..." : "Create Funder Profile"}
                </Button>
              </form>
            </CardContent>
          </Card>
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
            <Button onClick={() => setShowOpportunityDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Opportunity
            </Button>
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

        {/* Kumii Credits Balance */}
        {funderProfile && funderProfile.sloane_credits_balance > 0 && (
          <Card className="mb-8 bg-gradient-to-r from-accent/10 to-primary/10">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Kumii Credits Balance</h3>
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
              <Button onClick={() => setShowOpportunityDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create New
              </Button>
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
                <Button onClick={() => setShowOpportunityDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Opportunity
                </Button>
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
                <Button onClick={() => setShowOpportunityDialog(true)}>Create Opportunity</Button>
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
                   {!editingProfile ? (
                     <>
                       <div className="grid grid-cols-2 gap-4">
                         <div>
                           <label className="text-sm font-medium">Organization Name</label>
                           <p className="text-sm text-muted-foreground">{funderProfile.organization_name}</p>
                         </div>
                         <div>
                           <label className="text-sm font-medium">Organization Type</label>
                           <p className="text-sm text-muted-foreground capitalize">{funderProfile.organization_type?.replace('_', ' ') || 'Not specified'}</p>
                         </div>
                       </div>
                       
                       {funderProfile.website && (
                         <div>
                           <label className="text-sm font-medium">Website</label>
                           <p className="text-sm text-muted-foreground">{funderProfile.website}</p>
                         </div>
                       )}
                       
                       <div>
                         <label className="text-sm font-medium">Description</label>
                         <p className="text-sm text-muted-foreground">{funderProfile.description || 'No description provided'}</p>
                       </div>
                       
                       <div className="flex justify-end">
                         <Button onClick={() => setEditingProfile(true)}>
                           <Settings className="w-4 h-4 mr-2" />
                           Edit Profile
                         </Button>
                       </div>
                     </>
                   ) : (
                     <form onSubmit={handleUpdateProfile} className="space-y-4">
                       <div className="space-y-2">
                         <Label htmlFor="edit_organization_name">Organization Name *</Label>
                         <Input
                           id="edit_organization_name"
                           required
                           value={profileEditForm.organization_name}
                           onChange={(e) => setProfileEditForm({ ...profileEditForm, organization_name: e.target.value })}
                         />
                       </div>

                       <div className="space-y-2">
                         <Label htmlFor="edit_organization_type">Organization Type *</Label>
                         <Select
                           value={profileEditForm.organization_type}
                           onValueChange={(value) => setProfileEditForm({ ...profileEditForm, organization_type: value })}
                           required
                         >
                           <SelectTrigger>
                             <SelectValue placeholder="Select type" />
                           </SelectTrigger>
                           <SelectContent>
                             <SelectItem value="venture_capital">Venture Capital</SelectItem>
                             <SelectItem value="angel_investor">Angel Investor</SelectItem>
                             <SelectItem value="government">Government</SelectItem>
                             <SelectItem value="corporate">Corporate</SelectItem>
                             <SelectItem value="non_profit">Non-Profit</SelectItem>
                             <SelectItem value="accelerator">Accelerator/Incubator</SelectItem>
                             <SelectItem value="private_equity">Private Equity</SelectItem>
                           </SelectContent>
                         </Select>
                       </div>

                       <div className="space-y-2">
                         <Label htmlFor="edit_website">Website</Label>
                         <Input
                           id="edit_website"
                           type="url"
                           value={profileEditForm.website}
                           onChange={(e) => setProfileEditForm({ ...profileEditForm, website: e.target.value })}
                           placeholder="https://example.com"
                         />
                       </div>

                       <div className="space-y-2">
                         <Label htmlFor="edit_description">Description *</Label>
                         <Textarea
                           id="edit_description"
                           required
                           value={profileEditForm.description}
                           onChange={(e) => setProfileEditForm({ ...profileEditForm, description: e.target.value })}
                           rows={4}
                         />
                       </div>

                       <div className="flex justify-end gap-2">
                         <Button type="button" variant="outline" onClick={() => setEditingProfile(false)}>
                           Cancel
                         </Button>
                         <Button type="submit" disabled={updatingProfile}>
                           {updatingProfile ? "Saving..." : "Save Changes"}
                         </Button>
                       </div>
                     </form>
                   )}
                 </CardContent>
               </Card>
             )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Create Opportunity Dialog */}
        <Dialog open={showOpportunityDialog} onOpenChange={setShowOpportunityDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Funding Opportunity</DialogTitle>
              <DialogDescription>
                Create a new funding opportunity for startups to apply to
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleCreateOpportunity} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  required
                  value={opportunityForm.title}
                  onChange={(e) => setOpportunityForm({ ...opportunityForm, title: e.target.value })}
                  placeholder="e.g., Seed Funding for Tech Startups"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="funding_type">Funding Type *</Label>
                <Select
                  value={opportunityForm.funding_type}
                  onValueChange={(value) => setOpportunityForm({ ...opportunityForm, funding_type: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grant">Grant</SelectItem>
                    <SelectItem value="equity">Equity</SelectItem>
                    <SelectItem value="debt">Debt</SelectItem>
                    <SelectItem value="convertible_note">Convertible Note</SelectItem>
                    <SelectItem value="revenue_share">Revenue Share</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount_min">Minimum Amount (R) *</Label>
                  <Input
                    id="amount_min"
                    type="number"
                    required
                    value={opportunityForm.amount_min}
                    onChange={(e) => setOpportunityForm({ ...opportunityForm, amount_min: e.target.value })}
                    placeholder="50000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount_max">Maximum Amount (R) *</Label>
                  <Input
                    id="amount_max"
                    type="number"
                    required
                    value={opportunityForm.amount_max}
                    onChange={(e) => setOpportunityForm({ ...opportunityForm, amount_max: e.target.value })}
                    placeholder="500000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  required
                  value={opportunityForm.description}
                  onChange={(e) => setOpportunityForm({ ...opportunityForm, description: e.target.value })}
                  placeholder="Describe your funding opportunity..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="requirements">Requirements *</Label>
                <Textarea
                  id="requirements"
                  required
                  value={opportunityForm.requirements}
                  onChange={(e) => setOpportunityForm({ ...opportunityForm, requirements: e.target.value })}
                  placeholder="List the requirements for applicants..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="application_deadline">Application Deadline (Optional)</Label>
                <Input
                  id="application_deadline"
                  type="date"
                  value={opportunityForm.application_deadline}
                  onChange={(e) => setOpportunityForm({ ...opportunityForm, application_deadline: e.target.value })}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowOpportunityDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={creatingOpportunity}>
                  {creatingOpportunity ? "Creating..." : "Create Opportunity"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </Layout>
   );
};

export default FunderDashboard;