import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Save, LayoutDashboard } from 'lucide-react';
import BasicProfileEditor from '@/components/profile/BasicProfileEditor';
import StartupProfileEditor from '@/components/profile/StartupProfileEditor';
import FunderProfileEditor from '@/components/profile/FunderProfileEditor';
import MentorProfileEditor from '@/components/profile/MentorProfileEditor';
import ServiceProviderProfileEditor from '@/components/profile/ServiceProviderProfileEditor';

const EditProfile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('basic');
  const [isEditing, setIsEditing] = useState(false);
  const [startupProfile, setStartupProfile] = useState<any>(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchStartupProfile();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      setProfile(data || {
        id: user?.id,
        user_id: user?.id,
        profile_completion_percentage: 0
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStartupProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('startup_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      setStartupProfile(data);
    } catch (error: any) {
      console.error('Error fetching startup profile:', error);
    }
  };

  const handleSaveBasic = async (data: any, exitEditMode: boolean = true) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('user_id', user?.id);

      if (error) throw error;

      if (exitEditMode) {
        toast({
          title: 'Success',
          description: 'Profile updated successfully',
        });
        setIsEditing(false);
      }
      
      await fetchProfile();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleStartupProfileSaveComplete = async () => {
    setIsEditing(false);
    await fetchStartupProfile();
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">Please sign in to view your profile.</p>
            <Button onClick={() => navigate('/auth')}>Sign In</Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">{isEditing ? 'Edit Profile' : 'Profile Management'}</h1>
              <p className="text-muted-foreground mt-1">
                {isEditing ? 'Complete your profile for better matching opportunities' : 'Complete your profile to unlock better matches and guaranteed access to the Kumii Ecosystem'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {profile && (
                <div className="text-right">
                  <p className="text-sm text-muted-foreground mb-1">Profile Completion</p>
                  <div className="flex items-center gap-3">
                    <Progress value={profile.profile_completion_percentage || 0} className="w-32" />
                    <span className="font-semibold text-lg">{profile.profile_completion_percentage || 0}%</span>
                  </div>
                </div>
              )}
              {!isEditing && (
                <Button onClick={() => setIsEditing(true)}>
                  <Save className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Your persona: {profile?.persona_type?.replace('_', ' ').toUpperCase() || 'Not selected'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                {profile?.persona_type === 'smme_startup' && (
                  <TabsTrigger value="startup">Business Profile</TabsTrigger>
                )}
                {profile?.persona_type === 'funder' && (
                  <TabsTrigger value="funder">Funder Profile</TabsTrigger>
                )}
                {profile?.persona_type === 'professional' && (
                  <TabsTrigger value="mentor">Professional Profile</TabsTrigger>
                )}
                {profile?.persona_type === 'service_provider' && (
                  <TabsTrigger value="provider">Provider Profile</TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="basic" className="space-y-4 mt-6">
                {isEditing ? (
                  <BasicProfileEditor
                    profile={profile}
                    onSave={handleSaveBasic}
                    saving={saving}
                  />
                ) : (
                  <div className="space-y-6">
                    {profile?.profile_picture_url && (
                      <div className="flex items-center gap-4 mb-8">
                        <img src={profile.profile_picture_url} alt="User profile picture" className="h-32 w-32 rounded-full object-cover border-4 border-primary/20 shadow-lg" loading="lazy" />
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                        <p className="text-lg mt-1">{[profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Email</label>
                        <p className="text-lg mt-1">{profile?.email || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Phone</label>
                        <p className="text-lg mt-1">{profile?.phone || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Location</label>
                        <p className="text-lg mt-1">{profile?.location || 'Not provided'}</p>
                      </div>
                    </div>
                    {profile?.bio && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Bio</label>
                        <p className="text-lg mt-1">{profile.bio}</p>
                      </div>
                    )}
                    {profile?.skills?.length > 0 && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Skills</label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {profile.skills.map((skill: string) => (
                            <span key={skill} className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>

              {profile?.persona_type === 'smme_startup' && (
                <TabsContent value="startup" className="space-y-4 mt-6">
                  {isEditing ? (
                    <StartupProfileEditor userId={user?.id || ''} onSaveComplete={handleStartupProfileSaveComplete} />
                  ) : startupProfile ? (
                    <div className="space-y-6">
                      {startupProfile.logo_url && (
                        <div className="flex items-center gap-4 mb-8">
                          <img src={startupProfile.logo_url} alt="Company logo" className="h-32 w-32 object-contain border rounded-lg p-3 shadow-lg bg-white" loading="lazy" />
                        </div>
                      )}
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Business Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Company Name</label>
                            <p className="text-lg mt-1">{startupProfile.company_name || 'Not provided'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Registration Number</label>
                            <p className="text-lg mt-1">{startupProfile.business_registration_number || 'Not provided'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Business Age</label>
                            <p className="text-lg mt-1">{startupProfile.business_age || 'Not provided'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Employee Count</label>
                            <p className="text-lg mt-1">{startupProfile.employee_count_range || 'Not provided'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Annual Revenue</label>
                            <p className="text-lg mt-1">{startupProfile.revenue_range || 'Not provided'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Growth Stage</label>
                            <p className="text-lg mt-1">{startupProfile.growth_stage || 'Not provided'}</p>
                          </div>
                        </div>
                        {startupProfile.description && (
                          <div className="mt-4">
                            <label className="text-sm font-medium text-muted-foreground">Business Description</label>
                            <p className="text-lg mt-1">{startupProfile.description}</p>
                          </div>
                        )}
                        {startupProfile.key_products_services?.length > 0 && (
                          <div className="mt-4">
                            <label className="text-sm font-medium text-muted-foreground">Key Products/Services</label>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {startupProfile.key_products_services.map((product: string) => (
                                <span key={product} className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm">
                                  {product}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-4">Funding Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Funding Needs</label>
                            <p className="text-lg mt-1">{startupProfile.funding_needs || 'Not provided'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Funding Amount Needed</label>
                            <p className="text-lg mt-1">{startupProfile.funding_amount_needed || 'Not provided'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Previous Funding</label>
                            <p className="text-lg mt-1">{startupProfile.funding_history || 'Not provided'}</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-4">Market & Operations</h3>
                        <div className="grid grid-cols-1 gap-6">
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Target Market</label>
                            <p className="text-lg mt-1">{startupProfile.target_market || 'Not provided'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Competitive Advantage</label>
                            <p className="text-lg mt-1">{startupProfile.competitive_advantage || 'Not provided'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Business Model</label>
                            <p className="text-lg mt-1">{startupProfile.business_model || 'Not provided'}</p>
                          </div>
                          {startupProfile.challenges?.length > 0 && (
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">Challenges</label>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {startupProfile.challenges.map((challenge: string) => (
                                  <span key={challenge} className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm">
                                    {challenge}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {startupProfile.support_needed?.length > 0 && (
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">Support Needed</label>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {startupProfile.support_needed.map((support: string) => (
                                  <span key={support} className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm">
                                    {support}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-8 pt-6 border-t">
                        <Button 
                          onClick={() => navigate('/startup-dashboard')}
                          className="w-full md:w-auto"
                        >
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          Go to Company Dashboard
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      Click "Edit Profile" to add your business information
                    </div>
                  )}
                </TabsContent>
              )}

              {profile?.persona_type === 'funder' && (
                <TabsContent value="funder" className="space-y-4 mt-6">
                  <FunderProfileEditor userId={user?.id || ''} />
                </TabsContent>
              )}

              {profile?.persona_type === 'professional' && (
                <TabsContent value="mentor" className="space-y-4 mt-6">
                  <MentorProfileEditor userId={user?.id || ''} />
                </TabsContent>
              )}

              {profile?.persona_type === 'service_provider' && (
                <TabsContent value="provider" className="space-y-4 mt-6">
                  <ServiceProviderProfileEditor userId={user?.id || ''} />
                </TabsContent>
              )}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default EditProfile;