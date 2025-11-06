import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Shield, CheckCircle, Building2, TrendingUp, Users } from 'lucide-react';
import { SectorMultiSelect } from '@/components/onboarding/SectorMultiSelect';

const BecomeFunder = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [existingApplication, setExistingApplication] = useState<any>(null);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [selectedStages, setSelectedStages] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    organization_name: '',
    organization_type: '',
    description: '',
    website: '',
    contact_email: '',
    contact_person: '',
    min_investment: '',
    max_investment: '',
    typical_deal_size: '',
    geography_focus: '',
  });

  const fundingStages = [
    'Pre-seed',
    'Seed',
    'Series A',
    'Series B',
    'Series C+',
    'Growth',
    'Late Stage'
  ];

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    checkExistingApplication();
  }, [user]);

  const checkExistingApplication = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('funders')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setExistingApplication(data);
      }
    } catch (error) {
      console.error('Error checking application:', error);
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to register as a funder",
        variant: "destructive",
      });
      return;
    }

    // Validation
    if (!formData.organization_name || !formData.organization_type || !formData.description || !formData.contact_email || !formData.contact_person) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (selectedSectors.length === 0) {
      toast({
        title: "Missing information",
        description: "Please select at least one sector focus",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('funders')
        .insert({
          user_id: user.id,
          organization_name: formData.organization_name,
          organization_type: formData.organization_type,
          description: formData.description,
          website: formData.website || null,
          contact_email: formData.contact_email,
          contact_person: formData.contact_person,
          sector_preferences: selectedSectors,
          stage_preferences: selectedStages,
          min_investment: formData.min_investment ? parseFloat(formData.min_investment) : null,
          max_investment: formData.max_investment ? parseFloat(formData.max_investment) : null,
          typical_deal_size: formData.typical_deal_size ? parseFloat(formData.typical_deal_size) : null,
          geography_focus: formData.geography_focus || null,
          is_verified: false,
        });

      if (error) throw error;

      // Add funder role
      await supabase
        .from('user_roles')
        .insert({
          user_id: user.id,
          role: 'funder',
        });

      toast({
        title: "Application submitted!",
        description: "Your funder registration is under review. We'll notify you once approved!",
      });

      navigate('/funding/funder-dashboard');
    } catch (error: any) {
      console.error('Error submitting application:', error);
      toast({
        title: "Submission failed",
        description: error.message || "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (checkingStatus) {
    return (
      <Layout showSidebar={true}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (existingApplication) {
    return (
      <Layout showSidebar={true}>
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4">
                {existingApplication.is_verified ? (
                  <CheckCircle className="h-16 w-16 text-green-500" />
                ) : (
                  <Loader2 className="h-16 w-16 text-primary animate-spin" />
                )}
              </div>
              <CardTitle className="text-2xl">
                {existingApplication.is_verified ? 'Application Approved!' : 'Application Under Review'}
              </CardTitle>
              <CardDescription>
                {existingApplication.is_verified 
                  ? 'You can now access the Funder Dashboard and start managing funding opportunities'
                  : 'Your registration is under review — we\'ll notify you once approved!'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">Application Details</h3>
                <div className="space-y-2 text-sm">
                  <div><strong>Organization:</strong> {existingApplication.organization_name}</div>
                  <div><strong>Status:</strong> <Badge variant={existingApplication.is_verified ? 'default' : 'secondary'}>
                    {existingApplication.is_verified ? 'Verified' : 'Pending'}
                  </Badge></div>
                  <div><strong>Submitted:</strong> {new Date(existingApplication.created_at).toLocaleDateString()}</div>
                </div>
              </div>
              
              {existingApplication.is_verified && (
                <Button className="w-full" onClick={() => navigate('/funding/funder-dashboard')}>
                  Go to Funder Dashboard
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showSidebar={true}>
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <Badge variant="outline" className="mb-4">Funder Registration</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Become a Verified Funder
          </h1>
          <p className="text-xl text-muted-foreground">
            Join our platform to discover, evaluate, and fund promising South African startups and SMMEs
          </p>
        </div>

        {/* Benefits Section */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardContent className="pt-6">
              <Shield className="h-12 w-12 text-primary mb-4" />
              <h3 className="font-semibold mb-2">Verified Status</h3>
              <p className="text-sm text-muted-foreground">
                Get verified badge to build credibility with entrepreneurs
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <Users className="h-12 w-12 text-primary mb-4" />
              <h3 className="font-semibold mb-2">Quality Deal Flow</h3>
              <p className="text-sm text-muted-foreground">
                Access pre-vetted startups with credit scores and business insights
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <TrendingUp className="h-12 w-12 text-primary mb-4" />
              <h3 className="font-semibold mb-2">AI-Powered Matching</h3>
              <p className="text-sm text-muted-foreground">
                Get matched with opportunities that fit your investment criteria
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Registration Form */}
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Funder Registration</CardTitle>
            <CardDescription>
              Complete the form below to register. Our team will review and verify your application within 48 hours.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="organization_name">Organization Name *</Label>
                  <Input
                    id="organization_name"
                    value={formData.organization_name}
                    onChange={(e) => setFormData({ ...formData, organization_name: e.target.value })}
                    placeholder="Your Organization Name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="organization_type">Organization Type *</Label>
                  <Input
                    id="organization_type"
                    value={formData.organization_type}
                    onChange={(e) => setFormData({ ...formData, organization_type: e.target.value })}
                    placeholder="e.g., VC Fund, Angel Network, Bank, Government Agency"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Organization Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Tell us about your organization, investment focus, and what you're looking for"
                    rows={4}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="contact_person">Contact Person *</Label>
                  <Input
                    id="contact_person"
                    value={formData.contact_person}
                    onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                    placeholder="Full name of contact person"
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contact_email">Contact Email *</Label>
                    <Input
                      id="contact_email"
                      type="email"
                      value={formData.contact_email}
                      onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                      placeholder="contact@organization.com"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      placeholder="https://yourorganization.com"
                    />
                  </div>
                </div>

                <div>
                  <Label>Sector Preferences *</Label>
                  <SectorMultiSelect
                    value={selectedSectors}
                    onChange={setSelectedSectors}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Select the sectors/industries you're interested in funding
                  </p>
                </div>

                <div>
                  <Label>Stage Preferences</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                    {fundingStages.map((stage) => (
                      <Button
                        key={stage}
                        type="button"
                        variant={selectedStages.includes(stage) ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => {
                          setSelectedStages(prev =>
                            prev.includes(stage)
                              ? prev.filter(s => s !== stage)
                              : [...prev, stage]
                          );
                        }}
                      >
                        {stage}
                      </Button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Select the funding stages you typically invest in
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="min_investment">Min Investment (R)</Label>
                    <Input
                      id="min_investment"
                      type="number"
                      value={formData.min_investment}
                      onChange={(e) => setFormData({ ...formData, min_investment: e.target.value })}
                      placeholder="100000"
                    />
                  </div>

                  <div>
                    <Label htmlFor="max_investment">Max Investment (R)</Label>
                    <Input
                      id="max_investment"
                      type="number"
                      value={formData.max_investment}
                      onChange={(e) => setFormData({ ...formData, max_investment: e.target.value })}
                      placeholder="5000000"
                    />
                  </div>

                  <div>
                    <Label htmlFor="typical_deal_size">Typical Deal (R)</Label>
                    <Input
                      id="typical_deal_size"
                      type="number"
                      value={formData.typical_deal_size}
                      onChange={(e) => setFormData({ ...formData, typical_deal_size: e.target.value })}
                      placeholder="1000000"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="geography_focus">Geography Focus</Label>
                  <Input
                    id="geography_focus"
                    value={formData.geography_focus}
                    onChange={(e) => setFormData({ ...formData, geography_focus: e.target.value })}
                    placeholder="e.g., South Africa, Africa, Global"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Application'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default BecomeFunder;
